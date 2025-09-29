import z from "zod";
import { EdgeType, NodeType } from "../../generated/prisma";

export const nodeSchema = z.object({
  id: z.string(),
  nodeType: z.enum(Object.values(NodeType)),
  positionX: z.number(),
  positionY: z.number(),
  metadata: z.record(z.string(), z.unknown()),
});

export const edgeSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  edgeType: z.enum(Object.values(EdgeType)),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const nodeWebhookMetadatSchema = z.object({
  endpointId: z.string(),
});

export type NodeWebhookMetadataSchema = z.infer<
  typeof nodeWebhookMetadatSchema
>;
