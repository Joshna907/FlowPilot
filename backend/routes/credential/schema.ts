import z from "zod";
import { CredentialType } from "../../generated/prisma";

const createGmailCredentialSchema = z.object({
  GMAIL_USER: z.email(),
  GMAIL_APP_PASSWORD: z.string(),
});
export const credentialSchemaMap = {
  [CredentialType.GMAIL]: createGmailCredentialSchema,
};
