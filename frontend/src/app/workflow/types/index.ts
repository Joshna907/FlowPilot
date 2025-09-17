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
  nodeTypeId: string;
  nodeType: {
    id: string;
    name: string;
  };
  positionX: number;
  positionY: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ApiEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  createdAt: string;
  updatedAt: string;
};
