export type HttpRequestMetadataInput = {
  endpoint?: string;
  webhookUrl?: string;
  accessToken?: string;
  phoneNumberId?: string;
  to?: string;
  message?: string;
  body?: string;
  method?: string;
};

export type HttpRequestMetadata = HttpRequestMetadataInput & Record<string, unknown>;

const requiredFieldsByIntegration: Record<string, Array<keyof HttpRequestMetadataInput>> = {
  slack: ["webhookUrl", "message"],
  discord: ["webhookUrl", "message"],
  whatsapp: ["accessToken", "phoneNumberId", "to", "message"],
  http: ["endpoint"],
  "webhook-site": ["endpoint"],
};

export function buildHttpRequestMetadata(
  existingMetadata: Record<string, unknown> | undefined,
  values: HttpRequestMetadataInput,
): HttpRequestMetadata {
  const metadata = { ...(existingMetadata ?? {}) };
  const integrationKey =
    typeof metadata.integrationKey === "string" ? metadata.integrationKey : "http";
  const requiredFields = requiredFieldsByIntegration[integrationKey] ?? ["endpoint"];
  const missingFields = requiredFields.filter((field) => !values[field]?.trim());

  if (missingFields.length === 0) {
    delete metadata.needsConfig;
    delete metadata.missingFields;
  } else {
    metadata.needsConfig = true;
    metadata.missingFields = missingFields;
  }

  return {
    ...metadata,
    ...values,
  };
}
