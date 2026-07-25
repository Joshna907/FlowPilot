import test from "node:test";
import assert from "node:assert/strict";
import { NodeType } from "@/stores/useWorkflowStore";
import {
  buildIntegrationNode,
  getIntegrationByKey,
  getPickerIntegrations,
  searchIntegrations,
} from "./integrationCatalog";

test("searchIntegrations returns enabled messaging apps before coming soon apps", () => {
  const results = searchIntegrations("message");

  assert.deepEqual(
    results.slice(0, 3).map((item) => item.key),
    ["slack", "discord", "whatsapp"],
  );
  assert.equal(results.find((item) => item.key === "telegram")?.status, "coming_soon");
});

test("buildIntegrationNode maps Slack to HTTP request with missing config markers", () => {
  const node = buildIntegrationNode({
    integrationKey: "slack",
    nodeId: "slack-node",
    position: { x: 100, y: 200 },
  });

  assert.equal(node.type, NodeType.HTTP_REQUEST);
  assert.equal(node.data.integrationKey, "slack");
  assert.equal(node.data.label, "Send Slack message");
  assert.equal(node.data.needsConfig, true);
  assert.deepEqual(node.data.missingFields, ["webhookUrl", "message"]);
});

test("getPickerIntegrations only shows demo-ready apps", () => {
  assert.deepEqual(
    getPickerIntegrations().map((item) => item.key),
    ["email", "slack", "whatsapp", "discord"],
  );
  assert.deepEqual(
    getPickerIntegrations("http").map((item) => item.key),
    [],
  );
  assert.deepEqual(
    getPickerIntegrations("discord").map((item) => item.key),
    ["discord"],
  );
});

test("buildIntegrationNode maps WhatsApp to HTTP request with Cloud API fields", () => {
  const node = buildIntegrationNode({
    integrationKey: "whatsapp",
    nodeId: "whatsapp-node",
    position: { x: 0, y: 0 },
  });

  assert.equal(node.type, NodeType.HTTP_REQUEST);
  assert.equal(node.data.integrationKey, "whatsapp");
  assert.deepEqual(node.data.missingFields, [
    "accessToken",
    "phoneNumberId",
    "to",
    "message",
  ]);
});

test("getIntegrationByKey returns undefined for unknown integrations", () => {
  assert.equal(getIntegrationByKey("missing"), undefined);
});
