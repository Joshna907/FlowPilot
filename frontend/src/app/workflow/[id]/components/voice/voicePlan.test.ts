import test from "node:test";
import assert from "node:assert/strict";
import { EdgeType, NodeType } from "@/stores/useWorkflowStore";
import {
  convertPlannedEdge,
  convertPlannedNode,
  getVoicePlanErrorMessage,
} from "./voicePlan";

test("converts planned node with missing config markers", () => {
  const node = convertPlannedNode({
    id: "email",
    nodeType: NodeType.SEND_EMAIL,
    positionX: 240,
    positionY: 80,
    metadata: { subject: "", label: "Follow up" },
    needsConfig: true,
    missingFields: ["to", "body"],
  });

  assert.equal(node.id, "email");
  assert.equal(node.type, NodeType.SEND_EMAIL);
  assert.deepEqual(node.position, { x: 240, y: 80 });
  assert.equal(node.data.label, "Follow up");
  assert.equal(node.data.needsConfig, true);
  assert.deepEqual(node.data.missingFields, ["to", "body"]);
});

test("converts planned edge to React Flow edge", () => {
  const edge = convertPlannedEdge({
    id: "trigger-email",
    sourceNodeId: "trigger",
    targetNodeId: "email",
    edgeType: EdgeType.STEP,
    metadata: { source: "voice" },
  });

  assert.equal(edge.id, "trigger-email");
  assert.equal(edge.source, "trigger");
  assert.equal(edge.target, "email");
  assert.equal(edge.type, EdgeType.STEP);
  assert.deepEqual(edge.data, { voiceGenerated: true, source: "voice" });
});

test("uses friendly voice planner setup message when API key is missing", () => {
  assert.equal(
    getVoicePlanErrorMessage({
      response: {
        status: 503,
        data: {
          error: "GROQ_API_KEY or OPENAI_API_KEY is required for voice planning",
        },
      },
    }),
    "Add a Groq or OpenAI API key to use Voice Builder.",
  );
});

test("falls back to setup hint for empty 503 voice planner error", () => {
  assert.equal(
    getVoicePlanErrorMessage({ response: { status: 503, data: {} } }),
    "Add a Groq or OpenAI API key to use Voice Builder.",
  );
});
