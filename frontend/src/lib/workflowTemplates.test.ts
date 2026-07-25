import assert from "node:assert/strict";
import test from "node:test";
import { buildTemplateCreatePayload, workflowTemplates } from "./workflowTemplates";

test("templates build concrete workflow payloads", () => {
  const payload = buildTemplateCreatePayload(workflowTemplates[0]);

  assert.ok(payload.name);
  assert.ok(payload.nodes.length >= 3);
  assert.ok(payload.edges.length >= 2);
});
