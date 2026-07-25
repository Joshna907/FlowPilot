import express from "express";
import assert from "assert";
import z from "zod";
import { prisma } from "../utils/db";
import { ExecutionStatus, NodeType } from "../generated/prisma";
import { RedisManager } from "../utils/redis";
import { buildHttpRequestExecution } from "../../execution/nodes/httpRequestConfig";
export const router = express.Router();

type ExecutableWorkflowInput = {
  nodes: Array<{ nodeType: NodeType }>;
};

class WorkflowRunValidationError extends Error {
  statusCode = 422;
}

export function validateExecutableWorkflow(workflow: ExecutableWorkflowInput) {
  if (workflow.nodes.length === 0) {
    return "Workflow has no saved steps. Save the canvas before running.";
  }

  const hasTrigger = workflow.nodes.some(
    (node) =>
      node.nodeType === NodeType.MANUAL_TRIGGER ||
      node.nodeType === NodeType.WEBHOOK_TRIGGER,
  );
  if (!hasTrigger) {
    return "Workflow needs a manual or webhook trigger before running.";
  }

  return undefined;
}

export async function enqueueExecution(workflowId: string) {
  const existingWorkflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      nodes: {
        select: { nodeType: true },
      },
    },
  });
  if (!existingWorkflow) {
    throw new Error("provided workflow Id doesn't exist");
  }
  const validationError = validateExecutableWorkflow(existingWorkflow);
  if (validationError) {
    throw new WorkflowRunValidationError(validationError);
  }
  const execution = await prisma.execution.create({
    data: {
      workflowId: existingWorkflow.id,
      status: ExecutionStatus.QUEUED,
    },
  });
  const redisManager = RedisManager.getInstance();
  const qLength = await redisManager.pushExection(execution.id);

  if (qLength <= 0) {
    throw new Error("error Queuing Exeution");
  }
  return execution;
}

router.get("/workflow/:workflowId", async (req, res) => {
  assert(req.user);
  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.workflowId, userId: req.user.id },
    select: { id: true },
  });
  if (!workflow) {
    return res.status(404).json({ success: false, error: "workflow not found" });
  }

  const executions = await prisma.execution.findMany({
    where: { workflowId: workflow.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return res.json({ success: true, data: { executions } });
});

router.get("/:executionId", async (req, res) => {
  assert(req.user);
  const execution = await prisma.execution.findFirst({
    where: {
      id: req.params.executionId,
      workflow: { userId: req.user.id },
    },
  });
  if (!execution) {
    return res
      .status(404)
      .json({ success: false, error: "execution not found" });
  }
  return res.json({ success: true, data: { execution } });
});

router.post("/execute/:id", async (req, res) => {
  assert(req.user);
  const id = req.params.id;
  try {
    const execution = await enqueueExecution(id);
    if (!execution) {
      throw new Error("execution couldn't be queued");
    }
    return res.json({
      success: true,
      data: {
        message: "execution has been queued",
        execution,
      },
    });
  } catch (error) {
    const statusCode =
      error instanceof WorkflowRunValidationError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : "execution couldn't be queued";
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
});

const testStepSchema = z.object({
  nodeType: z.enum(Object.values(NodeType)),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

router.post("/test-step", async (req, res) => {
  assert(req.user);
  const { data, success, error } = testStepSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ success: false, error: error.message });
  }

  if (data.nodeType !== NodeType.HTTP_REQUEST) {
    return res.status(422).json({
      success: false,
      error: "Step testing currently supports HTTP-based integrations",
    });
  }

  let request: ReturnType<typeof buildHttpRequestExecution>;
  try {
    request = buildHttpRequestExecution(data.metadata ?? {});
  } catch (error) {
    return res.status(422).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid step config",
    });
  }

  let response: Response;
  try {
    response = await fetch(request.endpoint, {
      method: request.method,
      headers: request.headers,
      body:
        request.payload === undefined
          ? undefined
          : typeof request.payload === "string"
            ? request.payload
            : JSON.stringify(request.payload),
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : "Step request failed",
    });
  }
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return res.json({
    success: true,
    data: {
      result: {
        status: response.status,
        ok: response.ok,
        body,
      },
    },
  });
});
