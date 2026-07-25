import assert from "node:assert/strict";
import test from "node:test";
import { buildHttpRequestExecution } from "./httpRequest";

test("builds Slack webhook request", () => {
  const request = buildHttpRequestExecution({
    integrationKey: "slack",
    webhookUrl: "https://hooks.slack.test/abc",
    message: "Build shipped",
  });

  assert.equal(request.endpoint, "https://hooks.slack.test/abc");
  assert.deepEqual(request.payload, { text: "Build shipped" });
});

test("builds Discord webhook request", () => {
  const request = buildHttpRequestExecution({
    integrationKey: "discord",
    webhookUrl: "https://discord.test/webhook",
    message: "Run failed",
  });

  assert.equal(request.endpoint, "https://discord.test/webhook");
  assert.deepEqual(request.payload, { content: "Run failed" });
});

test("builds WhatsApp Cloud API request", () => {
  const request = buildHttpRequestExecution({
    integrationKey: "whatsapp",
    accessToken: "token",
    phoneNumberId: "123",
    to: "919999999999",
    message: "okay",
  });

  assert.equal(request.endpoint, "https://graph.facebook.com/v20.0/123/messages");
  assert.equal(request.headers.Authorization, "Bearer token");
  assert.deepEqual(request.payload, {
    messaging_product: "whatsapp",
    to: "919999999999",
    type: "text",
    text: { body: "okay" },
  });
});

test("keeps generic JSON request body", () => {
  const request = buildHttpRequestExecution({
    endpoint: "https://webhook.site/demo",
    body: '{"message":"okay"}',
  });

  assert.equal(request.endpoint, "https://webhook.site/demo");
  assert.deepEqual(request.payload, { message: "okay" });
});
