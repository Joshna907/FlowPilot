import z from "zod";
import { CredentialType } from "../../generated/prisma";

const createGmailCredentialSchema = z.object({
  GMAIL_USER: z.email(),
  GMAIL_APP_PASSWORD: z.string(),
});

const createSlackWebhookCredentialSchema = z.object({
  webhookUrl: z.url(),
});

const createDiscordWebhookCredentialSchema = z.object({
  webhookUrl: z.url(),
});

const createWhatsAppCloudCredentialSchema = z.object({
  accessToken: z.string().min(1),
  phoneNumberId: z.string().min(1),
});

export const credentialSchemaMap = {
  [CredentialType.GMAIL]: createGmailCredentialSchema,
  [CredentialType.SLACK_WEBHOOK]: createSlackWebhookCredentialSchema,
  [CredentialType.DISCORD_WEBHOOK]: createDiscordWebhookCredentialSchema,
  [CredentialType.WHATSAPP_CLOUD]: createWhatsAppCloudCredentialSchema,
};
