import express from "express";
import assert from "assert";
import z from "zod";
import { edgeSchema, nodeSchema } from "./types";
import { prisma } from "../../utils/db";
import { ErrorMessage } from "../../utils/errorMessage";
import _ from "lodash";
import { EdgeType, Prisma, type Edge, type Node } from "../../generated/prisma";

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

  const result = await prisma.$transaction(async (tx) => {
    const updatedWorkflow = await tx.workflow.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name }),
      },
    });

    const isNodesProvided = !_.isEmpty(data.nodes);
    const isEdgesProvided = !_.isEmpty(data.edges);

    const incomingNodeIds = new Set((data.nodes ?? []).map((n) => n.id));
    const incomingEdgeIds = new Set((data.edges ?? []).map((e) => e.id));

    const [existingNodes, existingEdges] = await Promise.all([
      tx.node.findMany({
        where: { workflowId: data.id },
        select: { id: true },
      }),
      tx.edge.findMany({
        where: { workflowId: data.id },
        select: { id: true, sourceNodeId: true, targetNodeId: true },
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
            metadata: node.metadata as unknown as Prisma.InputJsonValue,
          },
          create: {
            id: node.id,
            workflowId: data.id,
            nodeType: node.nodeType,
            positionX: node.positionX,
            positionY: node.positionY,
            metadata: node.metadata as unknown as Prisma.InputJsonValue,
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
          },
          create: {
            id: edge.id,
            workflowId: data.id,
            edgeType: EdgeType.STEP,
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
          },
        }),
      );
      updatedEdges = await Promise.all(upserts);
    }

    return { updatedWorkflow, updatedNodes, updatedEdges };
  });

  return res.json({
    success: true,
    data: { workflow: result.updatedWorkflow },
  });
});
