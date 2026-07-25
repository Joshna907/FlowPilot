import { Edge, Node } from "@xyflow/react";
import { EdgeType, NodeType } from "@/stores/useWorkflowStore";

export type PlannedNode = {
  id: string;
  nodeType: NodeType;
  positionX: number;
  positionY: number;
  metadata: Record<string, unknown>;
  needsConfig?: boolean;
  missingFields?: string[];
};

export type PlannedEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: EdgeType;
  metadata?: Record<string, unknown>;
};

export type VoicePlan = {
  nameSuggestion?: string;
  explanation: string;
  nodes: PlannedNode[];
  edges: PlannedEdge[];
};

type ApiErrorLike = {
  message?: string;
  response?: {
    status?: number;
    data?: {
      error?: unknown;
      message?: unknown;
    };
  };
};

export function getVoicePlanErrorMessage(error: unknown) {
  const apiError = error as ApiErrorLike;
  const responseError = apiError.response?.data?.error;
  const responseMessage = apiError.response?.data?.message;

  const voiceSetupMessage = "Add a Groq or OpenAI API key to use Voice Builder.";

  if (typeof responseError === "string" && responseError.trim()) {
    if (
      responseError.includes("GROQ_API_KEY") ||
      responseError.includes("OPENAI_API_KEY")
    ) {
      return voiceSetupMessage;
    }
    return responseError;
  }
  if (typeof responseMessage === "string" && responseMessage.trim()) {
    if (
      responseMessage.includes("GROQ_API_KEY") ||
      responseMessage.includes("OPENAI_API_KEY")
    ) {
      return voiceSetupMessage;
    }
    return responseMessage;
  }
  if (apiError.response?.status === 503) {
    return voiceSetupMessage;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Voice draft failed";
}

export function getDefaultNodeLabel(nodeType: NodeType) {
  const labels: Record<NodeType, string> = {
    [NodeType.ADD_NODE]: "",
    [NodeType.INITIAL]: "Start",
    [NodeType.EMPTY]: "Step",
    [NodeType.SEND_EMAIL]: "Email",
    [NodeType.WEBHOOK_TRIGGER]: "Webhook",
    [NodeType.MANUAL_TRIGGER]: "Manual",
    [NodeType.SEND_EMAIL_AND_AWAIT_REPLY]: "Await reply",
    [NodeType.HTTP_REQUEST]: "HTTP",
    [NodeType.DELAY]: "Delay",
    [NodeType.FILTER]: "Filter",
  };
  return labels[nodeType];
}

export function getNodeDisplayName(nodeType: NodeType) {
  const labels: Record<NodeType, string> = {
    [NodeType.ADD_NODE]: "Add step",
    [NodeType.INITIAL]: "Choose trigger",
    [NodeType.EMPTY]: "Empty step",
    [NodeType.SEND_EMAIL]: "Send email",
    [NodeType.WEBHOOK_TRIGGER]: "Webhook trigger",
    [NodeType.MANUAL_TRIGGER]: "Manual trigger",
    [NodeType.SEND_EMAIL_AND_AWAIT_REPLY]: "Email and await reply",
    [NodeType.HTTP_REQUEST]: "HTTP request",
    [NodeType.DELAY]: "Delay",
    [NodeType.FILTER]: "Filter",
  };
  return labels[nodeType];
}

export function convertPlannedNode(node: PlannedNode): Node {
  return {
    id: node.id,
    type: node.nodeType,
    position: { x: node.positionX, y: node.positionY },
    data: {
      label:
        typeof node.metadata.label === "string"
          ? node.metadata.label
          : getDefaultNodeLabel(node.nodeType),
      voiceGenerated: true,
      ...node.metadata,
      ...(node.needsConfig && { needsConfig: node.needsConfig }),
      ...(node.missingFields && { missingFields: node.missingFields }),
    },
  };
}

export function convertPlannedEdge(edge: PlannedEdge): Edge {
  return {
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    type: edge.edgeType,
    data: { voiceGenerated: true, ...(edge.metadata ?? {}) },
  };
}
