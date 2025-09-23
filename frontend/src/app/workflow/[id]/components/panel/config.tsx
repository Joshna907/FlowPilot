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
        description: "Run Manually upon clicking the Trigger.",
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
    ];
  } else {
    return [];
  }
}

export function getPanelTitle(nodeType: NodeType) {
  if (nodeType === NodeType.INITIAL || nodeType === NodeType.MANUAL_TRIGGER) {
    return "What triggers this workflow?";
  }
  return "What does this Node Do ?";
}

export function getPanelDescription(nodeType: NodeType) {
  if (nodeType === NodeType.INITIAL || nodeType === NodeType.MANUAL_TRIGGER) {
    return "A trigger is a step that starts your workflow";
  }
  return "Choose what step you want this node to perform.";
}
