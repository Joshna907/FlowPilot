import { NodeType } from "@/stores/useWorkflowStore";

export type ApiWorkflow = {
  id: string;
  name: string;
  nodes: ApiNode[];
  edges: ApiEdge[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

export type ApiNode = {
  id: string;
  nodeType: NodeType;
  positionX: number;
  positionY: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ApiNodeInput = Omit<ApiNode, "createdAt" | "updatedAt">;

export type ApiEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiEdgeInput = Omit<ApiEdge, "createdAt" | "updatedAt">;
