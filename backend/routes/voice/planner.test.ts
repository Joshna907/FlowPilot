import test from "node:test";
import assert from "node:assert/strict";
import { NodeType, EdgeType } from "../../generated/prisma";
import {
  buildPlannerRequestBody,
  createFallbackVoicePlan,
  extractPlannerResponseText,
  getVoicePlannerProvider,
  normalizeVoicePlan,
} from "./planner";

test("normalizes a valid voice plan and preserves missing config markers", () => {
  const plan = normalizeVoicePlan({
    nameSuggestion: "Customer follow up",
    explanation: "Drafts a follow-up automation.",
    nodes: [
      {
        id: "trigger",
        nodeType: NodeType.MANUAL_TRIGGER,
        positionX: 0,
        positionY: 0,
        metadata: {},
      },
      {
        id: "email",
        nodeType: NodeType.SEND_EMAIL,
        positionX: 200,
        positionY: 0,
        metadata: { to: "", subject: "", body: "" },
        needsConfig: true,
        missingFields: ["from", "to"],
      },
      {
        id: "add",
        nodeType: NodeType.ADD_NODE,
        positionX: 400,
        positionY: 0,
        metadata: {},
      },
    ],
    edges: [
      {
        id: "trigger-email",
        sourceNodeId: "trigger",
        targetNodeId: "email",
        edgeType: EdgeType.STEP,
      },
      {
        id: "email-add",
        sourceNodeId: "email",
        targetNodeId: "add",
        edgeType: EdgeType.STEP,
      },
    ],
  });

  assert.equal(plan.nodes.length, 3);
  assert.equal(plan.nodes[1]?.needsConfig, true);
  assert.deepEqual(plan.nodes[1]?.missingFields, ["from", "to"]);
});

test("normalizes provider alias fields for nodes and edges", () => {
  const plan = normalizeVoicePlan({
    explanation: "Drafts a customer follow-up workflow.",
    nodes: [
      {
        id: "trigger",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 0, y: 0 },
      },
      {
        id: "email",
        type: NodeType.SEND_EMAIL,
        position: { x: 200, y: 0 },
        data: { subject: "" },
        needsConfig: true,
        missingFields: ["to", "body"],
      },
      {
        id: "add",
        type: NodeType.ADD_NODE,
        position: { x: 400, y: 0 },
      },
    ],
    edges: [
      {
        id: "trigger-email",
        source: "trigger",
        target: "email",
        type: EdgeType.STEP,
      },
      {
        id: "email-add",
        source: "email",
        target: "add",
        type: EdgeType.STEP,
      },
    ],
  });

  assert.equal(plan.nodes[0]?.nodeType, NodeType.MANUAL_TRIGGER);
  assert.equal(plan.nodes[1]?.positionX, 200);
  assert.equal(plan.nodes[1]?.metadata.subject, "");
  assert.equal(plan.edges[0]?.sourceNodeId, "trigger");
  assert.equal(plan.edges[0]?.edgeType, EdgeType.STEP);
});

test("normalizes lowercase node types, array positions, and lowercase edge types", () => {
  const plan = normalizeVoicePlan({
    explanation: "Drafts a customer follow-up workflow.",
    nodes: [
      {
        id: "trigger",
        nodeType: "manual_trigger",
        position: [0, 0],
      },
      {
        id: "email",
        nodeType: "send email",
        position: [200, 0],
      },
      {
        id: "add",
        nodeType: "add_node",
      },
    ],
    edges: [
      {
        id: "trigger-email",
        source: "trigger",
        target: "email",
        edgeType: "step",
      },
      {
        id: "email-add",
        source: "email",
        target: "add",
      },
    ],
  });

  assert.equal(plan.nodes[0]?.nodeType, NodeType.MANUAL_TRIGGER);
  assert.equal(plan.nodes[1]?.nodeType, NodeType.SEND_EMAIL);
  assert.equal(plan.nodes[2]?.positionX, 400);
  assert.equal(plan.edges[0]?.edgeType, EdgeType.STEP);
});

test("adds missing trigger, add node, and sequential edges", () => {
  const plan = normalizeVoicePlan({
    explanation: "Drafts an email workflow.",
    nodes: [
      {
        id: "email",
        nodeType: "email",
        needsConfig: true,
        missingFields: ["to"],
      },
    ],
    edges: [],
  });

  assert.equal(plan.nodes[0]?.nodeType, NodeType.MANUAL_TRIGGER);
  assert.equal(plan.nodes[1]?.nodeType, NodeType.SEND_EMAIL);
  assert.equal(plan.nodes[2]?.nodeType, NodeType.ADD_NODE);
  assert.equal(plan.edges.length, 2);
  assert.equal(plan.edges[0]?.sourceNodeId, plan.nodes[0]?.id);
  assert.equal(plan.edges[1]?.targetNodeId, plan.nodes[2]?.id);
});

test("creates fallback plan from transcript when model draft is unusable", () => {
  const plan = createFallbackVoicePlan(
    "When I run this manually, send a follow-up email to the customer, then call my CRM webhook.",
  );

  assert.equal(plan.nodes[0]?.nodeType, NodeType.MANUAL_TRIGGER);
  assert.equal(plan.nodes[1]?.nodeType, NodeType.SEND_EMAIL);
  assert.equal(plan.nodes[2]?.nodeType, NodeType.HTTP_REQUEST);
  assert.equal(plan.nodes.at(-1)?.nodeType, NodeType.ADD_NODE);
  assert.equal(plan.edges.length, plan.nodes.length - 1);
});

test("creates WhatsApp fallback as an HTTP request step", () => {
  const plan = createFallbackVoicePlan(
    "When I get message on whatsapp, send a follow-up message them as okay",
  );

  assert.equal(plan.nodes[0]?.nodeType, NodeType.MANUAL_TRIGGER);
  assert.equal(plan.nodes[1]?.nodeType, NodeType.HTTP_REQUEST);
  assert.equal(plan.nodes[1]?.metadata.label, "Send WhatsApp message");
  assert.equal(plan.nodes[1]?.metadata.integrationKey, "whatsapp");
  assert.deepEqual(plan.nodes[1]?.missingFields, [
    "accessToken",
    "phoneNumberId",
    "to",
    "message",
  ]);
  assert.equal(plan.nodes.at(-1)?.nodeType, NodeType.ADD_NODE);
});

test("creates delay fallback with parsed duration", () => {
  const plan = createFallbackVoicePlan(
    "When I run this manually, wait for 2 seconds, then send a Slack message",
  );

  assert.equal(plan.nodes[1]?.nodeType, NodeType.DELAY);
  assert.equal(plan.nodes[1]?.metadata.durationMs, 2000);
  assert.equal(plan.nodes[1]?.needsConfig, false);
  assert.equal(plan.nodes[2]?.nodeType, NodeType.HTTP_REQUEST);
  assert.equal(plan.nodes[2]?.metadata.integrationKey, "slack");
});

test("creates filter fallback with missing condition fields", () => {
  const plan = createFallbackVoicePlan(
    "Start from a webhook, only continue if status is paid, then send discord message",
  );

  assert.equal(plan.nodes[0]?.nodeType, NodeType.WEBHOOK_TRIGGER);
  assert.equal(plan.nodes[1]?.nodeType, NodeType.FILTER);
  assert.equal(plan.nodes[1]?.needsConfig, true);
  assert.deepEqual(plan.nodes[1]?.missingFields, ["left", "operator", "right"]);
  assert.equal(plan.nodes[2]?.metadata.integrationKey, "discord");
});

test("rejects a voice plan whose edges reference unknown nodes", () => {
  assert.throws(
    () =>
      normalizeVoicePlan({
        explanation: "Invalid draft.",
        nodes: [
          {
            id: "trigger",
            nodeType: NodeType.MANUAL_TRIGGER,
            positionX: 0,
            positionY: 0,
            metadata: {},
          },
          {
            id: "add",
            nodeType: NodeType.ADD_NODE,
            positionX: 200,
            positionY: 0,
            metadata: {},
          },
        ],
        edges: [
          {
            id: "bad-edge",
            sourceNodeId: "trigger",
            targetNodeId: "missing-node",
            edgeType: EdgeType.STEP,
          },
        ],
      }),
    /unknown node/,
  );
});

test("uses Groq provider when GROQ_API_KEY is present", () => {
  const provider = getVoicePlannerProvider({
    GROQ_API_KEY: "groq-key",
    GROQ_MODEL: "llama-3.3-70b-versatile",
  });

  assert.equal(provider.apiKey, "groq-key");
  assert.equal(
    provider.baseUrl,
    "https://api.groq.com/openai/v1/chat/completions",
  );
  assert.equal(provider.kind, "groq-chat-json");
  assert.equal(provider.model, "llama-3.3-70b-versatile");
});

test("uses OpenAI provider when only OPENAI_API_KEY is present", () => {
  const provider = getVoicePlannerProvider({
    OPENAI_API_KEY: "openai-key",
    VOICE_PLANNER_MODEL: "gpt-5.1",
  });

  assert.equal(provider.apiKey, "openai-key");
  assert.equal(provider.baseUrl, "https://api.openai.com/v1/responses");
  assert.equal(provider.kind, "openai-responses");
  assert.equal(provider.model, "gpt-5.1");
});

test("builds Groq chat completions JSON request body", () => {
  const provider = getVoicePlannerProvider({
    GROQ_API_KEY: "groq-key",
    GROQ_MODEL: "llama-3.3-70b-versatile",
  });
  const body = buildPlannerRequestBody(provider, "send email to customer") as {
    model: string;
    messages?: Array<{ role: string; content: string }>;
    response_format?: { type: string };
    input?: unknown;
  };

  assert.equal(body.model, "llama-3.3-70b-versatile");
  assert.equal(body.response_format?.type, "json_object");
  assert.equal(body.input, undefined);
  assert.equal(body.messages?.[0]?.role, "system");
  assert.match(body.messages?.[1]?.content ?? "", /send email to customer/);
});

test("builds OpenAI responses JSON schema request body", () => {
  const provider = getVoicePlannerProvider({
    OPENAI_API_KEY: "openai-key",
    VOICE_PLANNER_MODEL: "gpt-5.1",
  });
  const body = buildPlannerRequestBody(provider, "call webhook") as {
    model: string;
    messages?: unknown;
    input?: Array<{ role: string; content: string }>;
    text?: { format?: { type: string; name: string } };
  };

  assert.equal(body.model, "gpt-5.1");
  assert.equal(body.messages, undefined);
  assert.equal(body.input?.[0]?.role, "system");
  assert.equal(body.text?.format?.type, "json_schema");
  assert.equal(body.text?.format?.name, "voice_workflow_plan");
});

test("extracts text from responses api payload", () => {
  const text = extractPlannerResponseText({
    output_text: "{\"nodes\":[]}",
  });

  assert.equal(text, "{\"nodes\":[]}");
});

test("extracts text from chat completion payload", () => {
  const text = extractPlannerResponseText({
    choices: [{ message: { content: "{\"ok\":true}" } }],
  });

  assert.equal(text, "{\"ok\":true}");
});
