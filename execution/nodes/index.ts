import { NodeType } from "../../backend/generated/prisma";
import { sendEmail } from "./sendMail";

function placeholder() {
  return new Promise(() => {});
}
export const executableNodes: Record<NodeType, () => Promise<unknown>> = {
  [NodeType.SEND_EMAIL]: sendEmail,
  [NodeType.ADD_NODE]: placeholder,
  [NodeType.INITIAL]: placeholder,
  [NodeType.EMPTY]: placeholder,
  [NodeType.MANUAL_TRIGGER]: placeholder,
  [NodeType.WEBHOOK_TRIGGER]: placeholder,
};
