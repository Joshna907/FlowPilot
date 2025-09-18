import { NodeType } from "@/stores/useWorkflowStore";
import { SendEmailForm } from "./sendEmail";

export const nodesFormConfig: Record<NodeType, React.ReactNode> = {
  [NodeType.ADD_NODE]: undefined,
  [NodeType.INITIAL]: undefined,
  [NodeType.EMPTY]: undefined,
  [NodeType.SEND_EMAIL]: <SendEmailForm />,
  [NodeType.WEBHOOK_TRIGGER]: undefined,
  [NodeType.MANUAL_TRIGGER]: undefined,
};
