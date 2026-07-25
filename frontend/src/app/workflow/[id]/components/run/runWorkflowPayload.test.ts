import test from "node:test";
import assert from "node:assert/strict";
import { EdgeType, NodeType } from "@/stores/useWorkflowStore";
import {
  assertWorkflowEditorReady,
  buildWorkflowSavePayload,
} from "./runWorkflowPayload";

test("builds save payload with trigger node before execution", () => {
  const payload = buildWorkflowSavePayload(
    [
      {
        id: "trigger",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 0, y: 0 },
        data: { label: "Manual" },
      },
      {
        id: "request",
        type: NodeType.HTTP_REQUEST,
        position: { x: 200, y: 0 },
        data: { endpoint: "https://webhook.site/test", body: "{}" },
      },
    ],
    [
      {
        id: "trigger-request",
        source: "trigger",
        target: "request",
        type: EdgeType.STEP,
        data: {},
      },
    ],
  );

  assert.equal(payload.nodes[0]?.nodeType, NodeType.MANUAL_TRIGGER);
  assert.equal(payload.nodes[1]?.nodeType, NodeType.HTTP_REQUEST);
  assert.equal(payload.edges[0]?.sourceNodeId, "trigger");
  assert.equal(payload.edges[0]?.targetNodeId, "request");
});

test("rejects save or run when editor state belongs to another workflow", () => {
  assert.throws(
    () =>
      assertWorkflowEditorReady({
        expectedWorkflowId: "url-workflow",
        activeWorkflowId: "store-workflow",
        nodes: [{ id: "trigger", type: NodeType.MANUAL_TRIGGER, position: { x: 0, y: 0 }, data: {} }],
      }),
    /Editor is still switching workflows/,
  );
});

test("rejects save or run when editor graph is empty", () => {
  assert.throws(
    () =>
      assertWorkflowEditorReady({
        expectedWorkflowId: "workflow",
        activeWorkflowId: "workflow",
        nodes: [],
      }),
    /Canvas is empty/,
  );
});
