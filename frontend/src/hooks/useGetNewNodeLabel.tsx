import { useWorkflow } from "@/stores";
import { NodeType } from "@/stores/useWorkflowStore";

export const defaultNodeLabel = {
  [NodeType.INITIAL]: "",
  [NodeType.EMPTY]: "",
  [NodeType.MANUAL_TRIGGER]: "",
  [NodeType.ADD_NODE]: "",
  [NodeType.WEBHOOK_TRIGGER]: "",
  [NodeType.SEND_EMAIL]: "SEND_EMAIL_NODE",
  [NodeType.SEND_EMAIL_AND_AWAIT_REPLY]: "SEND_EMAIL_AND_AWAIT_REPLY_NODE",
  [NodeType.HTTP_REQUEST]: "HTTP_REQUEST_NODE",
} as const;

export function useGetDefaultNodeLabel(nodeType: NodeType) {
  const nodes = useWorkflow((state) => state.nodes);
  function getDefaultLabel() {
    return `${defaultNodeLabel[nodeType]}_${nodes.length - 1}`;
  }
  return getDefaultLabel;
}
