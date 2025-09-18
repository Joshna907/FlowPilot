import { Prisma } from "../backend/generated/prisma";

export type WorkflowWithNodesAndEdges = Prisma.WorkflowGetPayload<{
  include: {
    nodes: {
      include: {
        outgoingEdges: true;
        incomingEdges: true;
        nodeType: true;
      };
    };
    edges: true;
  };
}>;
