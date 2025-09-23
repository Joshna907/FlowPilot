import { Prisma } from "../backend/generated/prisma";

export type WorkflowWithNodesAndEdges = Prisma.WorkflowGetPayload<{
  include: {
    nodes: {
      include: {
        outgoingEdges: true;
        incomingEdges: true;
        nodeType: true;
        metadata: true;
      };
    };
    edges: true;
  };
}>;

export type NodeWithIncomingAndOutgoingEdges = Prisma.NodeGetPayload<{
  include: {
    outgoingEdges: true;
    incomingEdges: true;
    nodeType: true;
    metadata: true;
  };
}>;
