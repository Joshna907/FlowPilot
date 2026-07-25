import z from "zod";

const httpRequestMeadataSchema = z.object({
  integrationKey: z.string().optional(),
  endpoint: z.string().optional(),
  webhookUrl: z.string().optional(),
  accessToken: z.string().optional(),
  phoneNumberId: z.string().optional(),
  to: z.string().optional(),
  message: z.string().optional(),
  body: z.string().optional(),
  method: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export type BuiltHttpRequest = {
  endpoint: string;
  payload: unknown;
  headers: Record<string, string>;
  method: string;
};

function parseBody(body: string | undefined) {
  if (!body) return undefined;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export function buildHttpRequestExecution(
  metadata: Record<string, unknown>,
): BuiltHttpRequest {
  const { data, success } = httpRequestMeadataSchema.safeParse(metadata);
  if (!success) {
    throw new Error("unable to parse httpRequest data");
  }
  const integrationKey = data.integrationKey?.toLowerCase();

  if (integrationKey === "slack") {
    if (!data.webhookUrl || !data.message) {
      throw new Error("missing Slack webhook URL or message");
    }
    return {
      endpoint: data.webhookUrl,
      payload: { text: data.message },
      headers: { "content-type": "application/json" },
      method: "POST",
    };
  }

  if (integrationKey === "discord") {
    if (!data.webhookUrl || !data.message) {
      throw new Error("missing Discord webhook URL or message");
    }
    return {
      endpoint: data.webhookUrl,
      payload: { content: data.message },
      headers: { "content-type": "application/json" },
      method: "POST",
    };
  }

  if (integrationKey === "whatsapp") {
    if (!data.accessToken || !data.phoneNumberId || !data.to || !data.message) {
      throw new Error("missing WhatsApp Cloud API config");
    }
    return {
      endpoint: `https://graph.facebook.com/v20.0/${data.phoneNumberId}/messages`,
      payload: {
        messaging_product: "whatsapp",
        to: data.to,
        type: "text",
        text: { body: data.message },
      },
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
        "content-type": "application/json",
      },
      method: "POST",
    };
  }

  if (!data.endpoint) {
    throw new Error("missing HTTP endpoint");
  }

  const payload = parseBody(data.body);
  const headers: Record<string, string> = {
    ...(data.headers ?? {}),
  };
  if (data.body) {
    headers["content-type"] =
      typeof payload === "string" ? "text/plain" : "application/json";
  }

  return {
    endpoint: data.endpoint,
    payload,
    headers,
    method: data.method ?? "POST",
  };
}
