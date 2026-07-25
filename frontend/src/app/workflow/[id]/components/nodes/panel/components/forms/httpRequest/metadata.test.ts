import test from "node:test";
import assert from "node:assert/strict";
import { buildHttpRequestMetadata } from "./metadata";

test("keeps display label when saving HTTP request config", () => {
  const metadata = buildHttpRequestMetadata(
    {
      label: "Send WhatsApp message",
      needsConfig: true,
      missingFields: ["url", "method", "body"],
      voiceGenerated: true,
    },
    {
      endpoint: "https://webhook.site/test",
      body: '{ "message": "okay" }',
    },
  );

  assert.equal(metadata.label, "Send WhatsApp message");
  assert.equal(metadata.endpoint, "https://webhook.site/test");
  assert.equal(metadata.needsConfig, undefined);
  assert.equal(metadata.missingFields, undefined);
  assert.equal(metadata.voiceGenerated, true);
});

test("clears Slack missing config only when webhook and message exist", () => {
  const metadata = buildHttpRequestMetadata(
    {
      integrationKey: "slack",
      needsConfig: true,
      missingFields: ["webhookUrl", "message"],
    },
    {
      webhookUrl: "https://hooks.slack.test/abc",
      message: "Run succeeded",
    },
  );

  assert.equal(metadata.needsConfig, undefined);
  assert.equal(metadata.missingFields, undefined);
});

test("keeps WhatsApp missing config when token is absent", () => {
  const metadata = buildHttpRequestMetadata(
    {
      integrationKey: "whatsapp",
      needsConfig: true,
      missingFields: ["accessToken", "phoneNumberId", "to", "message"],
    },
    {
      phoneNumberId: "123",
      to: "919999999999",
      message: "okay",
    },
  );

  assert.equal(metadata.needsConfig, true);
  assert.deepEqual(metadata.missingFields, ["accessToken"]);
});
