import express from "express";
import assert from "assert";
import z from "zod";
import { edgeSchema, nodeSchema } from "./types";
import { prisma } from "../../utils/db";
import { ErrorMessage } from "../../utils/errorMessage";
import _ from "lodash";
import type { Edge, Node } from "../../generated/prisma";

export const router = express.Router();

router.get("/list", async (req, res) => {
  assert(req.user);
  const workflows = await prisma.workflow.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: "desc" },
  });
  return res.json({ success: true, data: { workflows } });
});

const createWorkflowSchema = z.object({ name: z.string() });

router.post("/create", async (req, res) => {
  assert(req.user);
  const { data, success } = createWorkflowSchema.safeParse(req.body);
  if (!success) {
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }
  const workflow = await prisma.workflow.create({
    data: {
      userId: req.user.id,
      name: data.name,
    },
    select: {
      id: true,
    },
  });
  if (!workflow) {
    return res.json({ success: false, error: "unable to create a workflow" });
  }
  return res.json({ success: true, data: { workflow } });
});

router.get("/:id", async (req, res) => {
  assert(req.user);
  const workflowId = req.params.id;
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
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

  const updatedWorkflow = await prisma.workflow.update({
    where: { id: data.id },
    data: {
      ...(data.name && { name: data.name }),
    },
  });

  let updatedNodes: Node[] = [];
  if (!_.isEmpty(data.nodes)) {
    const updatedNodesPromises: Promise<Node>[] = [];
    data.nodes?.forEach((node) => {
      updatedNodesPromises.push(
        prisma.node.upsert({
          where: { id: node.id },
          update: {
            nodeType: node.nodeType,
            positionX: node.positionX,
            positionY: node.positionY,
            metadata: node.metadata,
          },
          create: {
            id: node.id,
            workflowId: data.id,
            nodeType: node.nodeType,
            positionX: node.positionX,
            positionY: node.positionY,
            metadata: node.metadata,
          },
        }),
      );
    });
    updatedNodes = await Promise.all(updatedNodesPromises);
  }

  let updatedEdges: Edge[] = [];
  if (!_.isEmpty(data.edges)) {
    const updatedEdgesPromises: Promise<Edge>[] = [];
    data.edges?.forEach((edge) => {
      updatedEdgesPromises.push(
        prisma.edge.upsert({
          where: { id: edge.id },
          update: {
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
          },
          create: {
            id: edge.id,
            workflowId: data.id,
            edgeType: edge.edgeType,
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
          },
        }),
      );
    });
    updatedEdges = await Promise.all(updatedEdgesPromises);
  }
  // console.log({ updatedEdges, updatedNodes, updatedWorkflow });
  return res.json({ success: true, data: { workflow: updatedWorkflow } });
});
