import z from "zod";
import { EdgeType, NodeType } from "../../generated/prisma";

export const nodeSchema = z.object({
  id: z.string(),
  nodeType: z.enum(Object.values(NodeType)),
  positionX: z.number(),
  positionY: z.number(),
  metadata: z.object(),
});

export const edgeSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  edgeType: z.string(),
});
