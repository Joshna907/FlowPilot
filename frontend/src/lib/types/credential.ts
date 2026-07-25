export enum CredentialType {
  GMAIL = "GMAIL",
  SLACK_WEBHOOK = "SLACK_WEBHOOK",
  DISCORD_WEBHOOK = "DISCORD_WEBHOOK",
  WHATSAPP_CLOUD = "WHATSAPP_CLOUD",
}

export type ApiCredential = {
  id: string;
  userId: string;
  credentialType: CredentialType;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
