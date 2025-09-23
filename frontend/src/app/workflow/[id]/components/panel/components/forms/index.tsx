import { NodeType } from "@/stores/useWorkflowStore";
import { SendEmailForm } from "./sendEmail/SendEmail";
import { WebhookTriggerForm } from "./WebhookTrigger";
import { HttpRequestForm } from "./httpRequest";

export const nodesFormConfig: Record<NodeType, React.ReactNode> = {
  [NodeType.ADD_NODE]: undefined,
  [NodeType.INITIAL]: undefined,
  [NodeType.EMPTY]: undefined,
  [NodeType.SEND_EMAIL]: <SendEmailForm nodeType={NodeType.SEND_EMAIL} />,
  [NodeType.WEBHOOK_TRIGGER]: <WebhookTriggerForm />,
  [NodeType.MANUAL_TRIGGER]: undefined,
  [NodeType.SEND_EMAIL_AND_AWAIT_REPLY]: (
    <SendEmailForm nodeType={NodeType.SEND_EMAIL_AND_AWAIT_REPLY} />
  ),
  [NodeType.HTTP_REQUEST]: <HttpRequestForm />,
};
