import { NodeType } from "../../backend/generated/prisma";
import { executeHttpRequest } from "./httpRequest";
import { sendEmail } from "./sendEmail";
import { sendEmailAndAwaitReply } from "./sendMailAndAwaitReply";

function placeholder(metadata: Record<string, unknown>) {
  return Promise.resolve({ ok: true, metadata });
}
export const executableNodes: Record<
  NodeType,
  (metadata: Record<string, unknown>) => Promise<unknown>
> = {
  [NodeType.SEND_EMAIL]: sendEmail,
  [NodeType.ADD_NODE]: placeholder,
  [NodeType.INITIAL]: placeholder,
  [NodeType.EMPTY]: placeholder,
  [NodeType.MANUAL_TRIGGER]: placeholder,
  [NodeType.WEBHOOK_TRIGGER]: placeholder,
  [NodeType.SEND_EMAIL_AND_AWAIT_REPLY]: sendEmailAndAwaitReply,
  [NodeType.HTTP_REQUEST]: executeHttpRequest,
};
