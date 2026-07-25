import express from "express";
import assert from "assert";
import z from "zod";
import { edgeSchema, nodeSchema, nodeWebhookMetadatSchema } from "./types";
import { prisma } from "../../utils/db";
import { ErrorMessage } from "../../utils/errorMessage";
import {
  EdgeType,
  NodeType,
  Prisma,
  type Edge,
  type Node,
} from "../../generated/prisma";
import { createWebhook, deleteWebhook } from "../webhook";

export const router = express.Router();

router.get("/list", async (req, res) => {
  assert(req.user);
  const workflows = await prisma.workflow.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: "desc" },
  });
  return res.json({ success: true, data: { workflows } });
});

const createWorkflowSchema = z.object({
  name: z.string(),
  nodes: z.array(nodeSchema).optional(),
  edges: z.array(edgeSchema).optional(),
});

router.post("/create", async (req, res) => {
  assert(req.user);
  const userId = req.user.id;
  const { data, success } = createWorkflowSchema.safeParse(req.body);
  if (!success) {
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }
  const workflow = await prisma.$transaction(async (tx) => {
    const createdWorkflow = await tx.workflow.create({
      data: {
        userId,
        name: data.name,
      },
      select: {
        id: true,
      },
    });

    if (data.nodes?.length) {
      await tx.node.createMany({
        data: data.nodes.map((node) => ({
          id: node.id,
          workflowId: createdWorkflow.id,
          nodeType: node.nodeType,
          positionX: node.positionX,
          positionY: node.positionY,
          metadata: node.metadata as Prisma.InputJsonValue,
        })),
      });
    }

    if (data.edges?.length) {
      await tx.edge.createMany({
        data: data.edges.map((edge) => ({
          id: edge.id,
          workflowId: createdWorkflow.id,
          sourceNodeId: edge.sourceNodeId,
          targetNodeId: edge.targetNodeId,
          edgeType: edge.edgeType as EdgeType,
          metadata: edge.metadata as Prisma.InputJsonValue,
        })),
      });
    }

    return createdWorkflow;
  });
  if (!workflow) {
    return res.json({ success: false, error: "unable to create a workflow" });
  }
  return res.json({ success: true, data: { workflow } });
});

router.post("/publish/:id", async (req, res) => {
  assert(req.user);
  const existingWorkflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existingWorkflow) {
    return res.status(404).json({ success: false, error: "workflow not found" });
  }
  const workflow = await prisma.workflow.update({
    where: { id: existingWorkflow.id },
    data: { publishedAt: new Date() },
  });
  return res.json({ success: true, data: { workflow } });
});

router.post("/archive/:id", async (req, res) => {
  assert(req.user);
  const existingWorkflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existingWorkflow) {
    return res.status(404).json({ success: false, error: "workflow not found" });
  }

  const workflow = await prisma.workflow.update({
    where: { id: existingWorkflow.id },
    data: { archivedAt: new Date() },
  });

  return res.json({ success: true, data: { workflow } });
});

router.post("/unarchive/:id", async (req, res) => {
  assert(req.user);
  const existingWorkflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existingWorkflow) {
    return res.status(404).json({ success: false, error: "workflow not found" });
  }

  const workflow = await prisma.workflow.update({
    where: { id: existingWorkflow.id },
    data: { archivedAt: null },
  });

  return res.json({ success: true, data: { workflow } });
});

router.delete("/:id", async (req, res) => {
  assert(req.user);
  const existingWorkflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existingWorkflow) {
    return res.status(404).json({ success: false, error: "workflow not found" });
  }

  await prisma.workflow.delete({
    where: { id: existingWorkflow.id },
  });

  return res.json({
    success: true,
    data: { workflowId: existingWorkflow.id },
  });
});

router.get("/:id", async (req, res) => {
  assert(req.user);
  const workflowId = req.params.id;
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId: req.user.id },
    include: {
      nodes: true,
      edges: true,
    },
  });
  if (!workflow) {
    return res.json({ success: false, error: "unable to find a workflow" });
  }
  return res.json({ success: true, data: { workflow } });
});

const updateWorkflowSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  nodes: z.array(nodeSchema).optional(),
  edges: z.array(edgeSchema).optional(),
});

router.put("/update/:id", async (req, res) => {
  assert(req.user);

  const { data, success, error } = updateWorkflowSchema.safeParse({
    id: req.params.id,
    ...req.body,
  });

  if (!success) {
    console.error({ error });
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedWorkflow = await tx.workflow.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name }),
      },
    });

    const isNodesProvided = data.nodes !== undefined;
    const isEdgesProvided = data.edges !== undefined;

    const incomingNodeIds = new Set((data.nodes ?? []).map((n) => n.id));
    const incomingEdgeIds = new Set((data.edges ?? []).map((e) => e.id));

    const [existingNodes, existingEdges] = await Promise.all([
      tx.node.findMany({
        where: { workflowId: data.id },
      }),
      tx.edge.findMany({
        where: { workflowId: data.id },
      }),
    ]);

    const nodesToDelete = isNodesProvided
      ? existingNodes.map((n) => n.id).filter((id) => !incomingNodeIds.has(id))
      : [];

    const edgesToDelete = isEdgesProvided
      ? existingEdges.map((e) => e.id).filter((id) => !incomingEdgeIds.has(id))
      : [];

    if (edgesToDelete.length > 0) {
      await tx.edge.deleteMany({
        where: { workflowId: data.id, id: { in: edgesToDelete } },
      });
    }

    if (nodesToDelete.length > 0) {
      await tx.node.deleteMany({
        where: { workflowId: data.id, id: { in: nodesToDelete } },
      });
    }

    let updatedNodes: Node[] = [];
    if (isNodesProvided) {
      const upserts = (data.nodes ?? []).map((node) => {
        return tx.node.upsert({
          where: { id: node.id },
          update: {
            nodeType: node.nodeType,
            positionX: node.positionX,
            positionY: node.positionY,
            metadata: node.metadata as Prisma.InputJsonValue,
          },
          create: {
            id: node.id,
            workflowId: data.id,
            nodeType: node.nodeType,
            positionX: node.positionX,
            positionY: node.positionY,
            metadata: node.metadata as Prisma.InputJsonValue,
          },
        });
      });
      updatedNodes = await Promise.all(upserts);
    }

    let updatedEdges: Edge[] = [];
    if (isEdgesProvided) {
      const upserts = (data.edges ?? []).map((edge) =>
        tx.edge.upsert({
          where: { id: edge.id },
          update: {
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            edgeType: edge.edgeType as EdgeType,
            metadata: edge.metadata as Prisma.InputJsonValue,
          },
          create: {
            id: edge.id,
            workflowId: data.id,
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            edgeType: edge.edgeType as EdgeType,
            metadata: edge.metadata as Prisma.InputJsonValue,
          },
        }),
      );
      updatedEdges = await Promise.all(upserts);
    }

    // add or remove webhooks

    const providedWebhookNode = data.nodes?.find((n) => {
      return n.nodeType === NodeType.WEBHOOK_TRIGGER;
    });
    const existingWebhookNode = existingNodes.find((node) => {
      return node.nodeType === NodeType.WEBHOOK_TRIGGER;
    });

    const {
      data: providedWebhookNodeParsedMetadata,
      success: providedWebhookNodeParsedMetadataParsingSuccess,
    } = nodeWebhookMetadatSchema.safeParse(providedWebhookNode?.metadata);

    const {
      data: existingWebhookNodeParsedMetadata,
      success: existingWebhookNodeParsedMetadataParsingSuccess,
    } = nodeWebhookMetadatSchema.safeParse(existingWebhookNode?.metadata);

    if (
      providedWebhookNode &&
      providedWebhookNodeParsedMetadataParsingSuccess &&
      !existingWebhookNode
    ) {
      // create a new webhook
      await createWebhook({
        db: tx,
        webhookId: providedWebhookNodeParsedMetadata.endpointId,
        workflowId: data.id,
      });
    }

    if (
      !providedWebhookNode &&
      existingWebhookNode &&
      existingWebhookNodeParsedMetadataParsingSuccess
    ) {
      // delete the existing webhook
      await deleteWebhook({
        db: tx,
        webhookId: existingWebhookNodeParsedMetadata.endpointId,
      });
    }

    // will be needed in future
    // if (
    //   providedWebhookNode &&
    //   providedWebhookNodeParsedMetadataParsingSuccess &&
    //   existingWebhookNode
    // ) {
    // update the existing webhook
    // }

    return { updatedWorkflow, updatedNodes, updatedEdges };
  });

  return res.json({
    success: true,
    data: {
      workflow: result.updatedWorkflow,
      nodes: result.updatedNodes,
      edges: result.updatedEdges,
    },
  });
});
