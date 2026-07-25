import { NodeType } from "@/stores/useWorkflowStore";
import { nodesFormConfig } from "./components/forms";

export enum NodeCategory {
  TRIGGER = "TRIGGER",
  STEP = "STEP",
}

export const nodeCategories: Record<NodeCategory, NodeType[]> = {
  [NodeCategory.TRIGGER]: [
    NodeType.WEBHOOK_TRIGGER,
    NodeType.MANUAL_TRIGGER,
    NodeType.INITIAL,
  ],
  [NodeCategory.STEP]: [
    NodeType.SEND_EMAIL,
    NodeType.EMPTY,
    NodeType.SEND_EMAIL_AND_AWAIT_REPLY,
    NodeType.HTTP_REQUEST,
    NodeType.DELAY,
    NodeType.FILTER,
  ],
};

export type NodeOption = {
  nodeType: NodeType;
  title: string;
  description: string;
  form?: React.ReactNode;
};

// node options that can replace the currently selected node
export function getNodeOptions(nodeType: NodeType): NodeOption[] {
  if (nodeCategories[NodeCategory.TRIGGER]?.includes(nodeType)) {
    return [
      {
        nodeType: NodeType.MANUAL_TRIGGER,
        title: "Manual",
        description: "Start when you click Run.",
        form: nodesFormConfig[NodeType.MANUAL_TRIGGER],
      },
      {
        nodeType: NodeType.WEBHOOK_TRIGGER,
        title: "Webhook",
        description: "Run when a webhook is hit.",
        form: nodesFormConfig[NodeType.WEBHOOK_TRIGGER],
      },
    ];
  } else if (nodeCategories[NodeCategory.STEP]?.includes(nodeType)) {
    return [
      {
        nodeType: NodeType.SEND_EMAIL,
        title: "Email",
        description: "Email",
        form: nodesFormConfig[NodeType.SEND_EMAIL],
      },
      {
        nodeType: NodeType.SEND_EMAIL_AND_AWAIT_REPLY,
        title: "Send email and await reply",
        description: "Send email and await reply",
        form: nodesFormConfig[NodeType.SEND_EMAIL_AND_AWAIT_REPLY],
      },
      {
        nodeType: NodeType.HTTP_REQUEST,
        title: "Send to webhook / API",
        description: "Send data to another app or endpoint.",
        form: nodesFormConfig[NodeType.HTTP_REQUEST],
      },
      {
        nodeType: NodeType.DELAY,
        title: "Delay",
        description: "Pause before the next step",
        form: nodesFormConfig[NodeType.DELAY],
      },
      {
        nodeType: NodeType.FILTER,
        title: "Filter",
        description: "Continue only when a condition passes",
        form: nodesFormConfig[NodeType.FILTER],
      },
    ];
  } else {
    return [];
  }
}

export function getDirectNodeFormType(nodeType: NodeType) {
  if (
    nodeType === NodeType.SEND_EMAIL ||
    nodeType === NodeType.SEND_EMAIL_AND_AWAIT_REPLY ||
    nodeType === NodeType.WEBHOOK_TRIGGER ||
    nodeType === NodeType.HTTP_REQUEST ||
    nodeType === NodeType.DELAY ||
    nodeType === NodeType.FILTER
  ) {
    return nodeType;
  }
  return undefined;
}

export function getPanelTitle(nodeType: NodeType) {
  if (getDirectNodeFormType(nodeType)) {
    return "Set up this step";
  }
  if (nodeType === NodeType.INITIAL || nodeType === NodeType.MANUAL_TRIGGER) {
    return "What triggers this workflow?";
  }
  return "Choose a step type";
}

export function getPanelDescription(nodeType: NodeType) {
  if (getDirectNodeFormType(nodeType)) {
    return "Add the details this step needs before running.";
  }
  if (nodeType === NodeType.INITIAL || nodeType === NodeType.MANUAL_TRIGGER) {
    return "Choose how this workflow starts.";
  }
  return "Choose what step you want this node to perform.";
}
