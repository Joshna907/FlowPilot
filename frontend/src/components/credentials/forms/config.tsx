import { CredentialType } from "@/lib/types/credential";

export type CreateCredentialsInput = {
  credentialType: CredentialType;
  metadata: Record<string, unknown>;
};

export type CredentialField = {
  key: string;
  label: string;
  type?: string;
};

export function useCredentialsFormConfig(): Record<
  CredentialType,
  { title: string; body: string; fields: CredentialField[] }
> {
  return {
    [CredentialType.GMAIL]: {
      title: "Gmail connection",
      body: "Use the Google integration button to connect Gmail with OAuth.",
      fields: [
        { key: "GMAIL_USER", label: "Gmail user" },
        { key: "GMAIL_APP_PASSWORD", label: "App password", type: "password" },
      ],
    },
    [CredentialType.SLACK_WEBHOOK]: {
      title: "Slack webhook",
      body: "Store an incoming webhook URL for channel messages.",
      fields: [{ key: "webhookUrl", label: "Webhook URL" }],
    },
    [CredentialType.DISCORD_WEBHOOK]: {
      title: "Discord webhook",
      body: "Store a Discord webhook URL for channel messages.",
      fields: [{ key: "webhookUrl", label: "Webhook URL" }],
    },
    [CredentialType.WHATSAPP_CLOUD]: {
      title: "WhatsApp Cloud API",
      body: "Store Meta Cloud API credentials. Recipient is still per-step.",
      fields: [
        { key: "accessToken", label: "Access token", type: "password" },
        { key: "phoneNumberId", label: "Phone number ID" },
      ],
    },
  };
}
