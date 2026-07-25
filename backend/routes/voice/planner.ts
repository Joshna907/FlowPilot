import z from "zod";
import { EdgeType, NodeType } from "../../generated/prisma";

export const voicePlanNodeSchema = z.object({
  id: z.string().min(1),
  nodeType: z.enum(Object.values(NodeType)),
  positionX: z.number(),
  positionY: z.number(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  needsConfig: z.boolean().optional(),
  missingFields: z.array(z.string()).optional(),
});

export const voicePlanEdgeSchema = z.object({
  id: z.string().min(1),
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  edgeType: z.enum(Object.values(EdgeType)),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const voicePlanSchema = z.object({
  nameSuggestion: z.string().optional(),
  explanation: z.string().min(1),
  nodes: z.array(voicePlanNodeSchema).min(2),
  edges: z.array(voicePlanEdgeSchema).min(1),
});

export type VoicePlan = z.infer<typeof voicePlanSchema>;

export type VoicePlannerProvider = {
  kind: "groq-chat-json" | "openai-responses";
  apiKey: string;
  baseUrl: string;
  model: string;
};

export const supportedNodeTypes = [
  NodeType.MANUAL_TRIGGER,
  NodeType.WEBHOOK_TRIGGER,
  NodeType.SEND_EMAIL,
  NodeType.SEND_EMAIL_AND_AWAIT_REPLY,
  NodeType.HTTP_REQUEST,
  NodeType.DELAY,
  NodeType.FILTER,
  NodeType.EMPTY,
  NodeType.ADD_NODE,
] as const;

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string");
}

function readNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

const nodeTypeAliases: Record<string, NodeType> = {
  add: NodeType.ADD_NODE,
  add_node: NodeType.ADD_NODE,
  api: NodeType.HTTP_REQUEST,
  api_call: NodeType.HTTP_REQUEST,
  await_reply: NodeType.SEND_EMAIL_AND_AWAIT_REPLY,
  email: NodeType.SEND_EMAIL,
  empty: NodeType.EMPTY,
  follow_up_message: NodeType.HTTP_REQUEST,
  http: NodeType.HTTP_REQUEST,
  http_request: NodeType.HTTP_REQUEST,
  initial: NodeType.MANUAL_TRIGGER,
  mail: NodeType.SEND_EMAIL,
  manual: NodeType.MANUAL_TRIGGER,
  manual_trigger: NodeType.MANUAL_TRIGGER,
  message: NodeType.HTTP_REQUEST,
  slack: NodeType.HTTP_REQUEST,
  slack_message: NodeType.HTTP_REQUEST,
  discord: NodeType.HTTP_REQUEST,
  discord_message: NodeType.HTTP_REQUEST,
  delay: NodeType.DELAY,
  plus: NodeType.ADD_NODE,
  filter: NodeType.FILTER,
  send_email: NodeType.SEND_EMAIL,
  send_email_and_await_reply: NodeType.SEND_EMAIL_AND_AWAIT_REPLY,
  send_message: NodeType.HTTP_REQUEST,
  sms: NodeType.HTTP_REQUEST,
  step: NodeType.EMPTY,
  trigger: NodeType.MANUAL_TRIGGER,
  wait_for_reply: NodeType.SEND_EMAIL_AND_AWAIT_REPLY,
  whatsapp: NodeType.HTTP_REQUEST,
  whatsapp_message: NodeType.HTTP_REQUEST,
  webhook: NodeType.WEBHOOK_TRIGGER,
  webhook_trigger: NodeType.WEBHOOK_TRIGGER,
};

const edgeTypeAliases: Record<string, EdgeType> = {
  condition: EdgeType.IF,
  conditional: EdgeType.IF,
  default: EdgeType.STEP,
  if: EdgeType.IF,
  next: EdgeType.STEP,
  step: EdgeType.STEP,
};

function normalizeAliasKey(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeNodeType(...values: unknown[]) {
  const value = readString(...values);
  if (typeof value !== "string") {
    return NodeType.EMPTY;
  }
  const key = normalizeAliasKey(value);
  const nodeTypeValues = new Set<string>(Object.values(NodeType));
  if (nodeTypeAliases[key]) {
    return nodeTypeAliases[key];
  }
  if (nodeTypeValues.has(value)) {
    return value as NodeType;
  }
  return NodeType.EMPTY;
}

function normalizeEdgeType(...values: unknown[]) {
  const value = readString(...values);
  if (typeof value !== "string") {
    return EdgeType.STEP;
  }
  const key = normalizeAliasKey(value);
  const edgeTypeValues = new Set<string>(Object.values(EdgeType));
  if (edgeTypeAliases[key]) {
    return edgeTypeAliases[key];
  }
  if (edgeTypeValues.has(value)) {
    return value as EdgeType;
  }
  return EdgeType.STEP;
}

function getUniqueId(baseId: string, usedIds: Set<string>) {
  let id = baseId;
  let index = 2;
  while (usedIds.has(id)) {
    id = `${baseId}-${index}`;
    index += 1;
  }
  usedIds.add(id);
  return id;
}

function fillGraphDefaults(nodes: JsonObject[], edges: JsonObject[]) {
  const usedIds = new Set<string>();
  const normalizedNodes: JsonObject[] = nodes.map((node, index) => {
    const id = getUniqueId(readString(node.id) ?? `node-${index + 1}`, usedIds);
    return {
      ...node,
      id,
      positionX: readNumber(node.positionX) ?? index * 200,
      positionY: readNumber(node.positionY) ?? 0,
    };
  });

  const triggerTypes = new Set<string>([
    NodeType.MANUAL_TRIGGER,
    NodeType.WEBHOOK_TRIGGER,
  ]);
  const hasTrigger = normalizedNodes.some((node) =>
    triggerTypes.has(readString(node.nodeType) ?? ""),
  );
  if (!hasTrigger) {
    normalizedNodes.unshift({
      id: getUniqueId("trigger", usedIds),
      nodeType: NodeType.MANUAL_TRIGGER,
      positionX: 0,
      positionY: 0,
      metadata: {},
    });
  }

  const hasAddNode = normalizedNodes.some(
    (node) => node.nodeType === NodeType.ADD_NODE,
  );
  if (!hasAddNode) {
    normalizedNodes.push({
      id: getUniqueId("add", usedIds),
      nodeType: NodeType.ADD_NODE,
      positionX: normalizedNodes.length * 200,
      positionY: 0,
      metadata: {},
    });
  }

  const positionedNodes: JsonObject[] = normalizedNodes.map((node, index) => ({
    ...node,
    positionX: readNumber(node.positionX) ?? index * 200,
    positionY: readNumber(node.positionY) ?? 0,
  }));

  const completeEdges = edges.filter(
    (edge) => readString(edge.sourceNodeId) && readString(edge.targetNodeId),
  );
  for (const [index, node] of positionedNodes.slice(0, -1).entries()) {
    const target = positionedNodes[index + 1];
    if (!target) {
      continue;
    }
    const sourceId = readString(node.id);
    const targetId = readString(target.id);
    if (!sourceId || !targetId) {
      continue;
    }
    const exists = completeEdges.some(
      (edge) =>
        edge.sourceNodeId === sourceId && edge.targetNodeId === targetId,
    );
    if (!exists) {
      completeEdges.push({
        id: `${sourceId}-${targetId}`,
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        edgeType: EdgeType.STEP,
        metadata: {},
      });
    }
  }

  return {
    nodes: positionedNodes,
    edges: completeEdges,
  };
}

function normalizePlannerInput(input: unknown) {
  if (!isJsonObject(input)) {
    return input;
  }

  const rawNodes = Array.isArray(input.nodes) ? input.nodes : [];
  const rawEdges = Array.isArray(input.edges) ? input.edges : [];
  const normalizedNodes = rawNodes.map((rawNode, index) => {
    if (!isJsonObject(rawNode)) {
      return {
        id: `node-${index + 1}`,
        nodeType: NodeType.EMPTY,
        positionX: index * 200,
        positionY: 0,
        metadata: {},
      };
    }
    const position = isJsonObject(rawNode.position) ? rawNode.position : {};
    const positionArray = Array.isArray(rawNode.position)
      ? rawNode.position
      : [];
    return {
      ...rawNode,
      id: readString(rawNode.id) ?? `node-${index + 1}`,
      nodeType: normalizeNodeType(
        rawNode.nodeType,
        rawNode.type,
        rawNode.node_type,
        rawNode.kind,
      ),
      positionX: readNumber(
        rawNode.positionX,
        rawNode.x,
        position.x,
        positionArray[0],
      ),
      positionY: readNumber(
        rawNode.positionY,
        rawNode.y,
        position.y,
        positionArray[1],
      ),
      metadata: isJsonObject(rawNode.metadata)
        ? rawNode.metadata
        : isJsonObject(rawNode.data)
          ? rawNode.data
          : {},
    };
  });
  const normalizedEdges = rawEdges.map((rawEdge, index) => {
    if (!isJsonObject(rawEdge)) {
      return {
        id: `edge-${index + 1}`,
        edgeType: EdgeType.STEP,
        metadata: {},
      };
    }
    return {
      ...rawEdge,
      id: readString(rawEdge.id) ?? `edge-${index + 1}`,
      sourceNodeId: readString(
        rawEdge.sourceNodeId,
        rawEdge.source,
        rawEdge.from,
      ),
      targetNodeId: readString(
        rawEdge.targetNodeId,
        rawEdge.target,
        rawEdge.to,
      ),
      edgeType: normalizeEdgeType(rawEdge.edgeType, rawEdge.type),
      metadata: isJsonObject(rawEdge.metadata) ? rawEdge.metadata : {},
    };
  });

  return {
    ...input,
    ...fillGraphDefaults(normalizedNodes, normalizedEdges),
  };
}

export function normalizeVoicePlan(input: unknown): VoicePlan {
  const plan = voicePlanSchema.parse(normalizePlannerInput(input));
  const nodeIds = new Set(plan.nodes.map((node) => node.id));
  const triggerTypes = new Set<string>([
    NodeType.MANUAL_TRIGGER,
    NodeType.WEBHOOK_TRIGGER,
  ]);
  const hasTrigger = plan.nodes.some((node) => triggerTypes.has(node.nodeType));
  if (!hasTrigger) {
    throw new Error("voice plan must include a trigger node");
  }
  const hasAddNode = plan.nodes.some(
    (node) => node.nodeType === NodeType.ADD_NODE,
  );
  if (!hasAddNode) {
    throw new Error("voice plan must include an add node");
  }
  for (const edge of plan.edges) {
    if (!nodeIds.has(edge.sourceNodeId)) {
      throw new Error(`edge ${edge.id} references unknown node`);
    }
    if (!nodeIds.has(edge.targetNodeId)) {
      throw new Error(`edge ${edge.id} references unknown node`);
    }
  }
  return plan;
}

export function createFallbackVoicePlan(transcript: string): VoicePlan {
  const normalizedTranscript = normalizeAliasKey(transcript);
  const delayMatch = transcript.match(
    /(?:wait|delay|pause)\s+(?:for\s+)?(\d+)\s*(ms|millisecond|milliseconds|second|seconds|minute|minutes)?/i,
  );
  const delayAmount = delayMatch ? Number(delayMatch[1]) : undefined;
  const delayUnit = delayMatch?.[2]?.toLowerCase() ?? "seconds";
  const delayDurationMs =
    delayAmount === undefined
      ? undefined
      : delayUnit.startsWith("minute")
        ? delayAmount * 60_000
        : delayUnit.startsWith("ms") || delayUnit.startsWith("millisecond")
          ? delayAmount
          : delayAmount * 1_000;
  const wantsWebhookTrigger =
    normalizedTranscript.includes("start_from_a_webhook") ||
    normalizedTranscript.includes("webhook_trigger");
  const wantsReply =
    normalizedTranscript.includes("wait_for_reply") ||
    normalizedTranscript.includes("await_reply") ||
    normalizedTranscript.includes("reply_before");
  const wantsEmail =
    normalizedTranscript.includes("email") ||
    normalizedTranscript.includes("mail");
  const wantsSlack = normalizedTranscript.includes("slack");
  const wantsDiscord = normalizedTranscript.includes("discord");
  const wantsWhatsApp = normalizedTranscript.includes("whatsapp");
  const wantsDelay =
    normalizedTranscript.includes("delay") ||
    normalizedTranscript.includes("pause") ||
    normalizedTranscript.includes("wait");
  const wantsFilter =
    normalizedTranscript.includes("filter") ||
    normalizedTranscript.includes("only_continue_if") ||
    normalizedTranscript.includes("continue_if") ||
    normalizedTranscript.includes("if_");
  const wantsMessage =
    wantsWhatsApp ||
    wantsSlack ||
    wantsDiscord ||
    normalizedTranscript.includes("message") ||
    normalizedTranscript.includes("sms");
  const wantsHttp =
    wantsMessage ||
    normalizedTranscript.includes("http") ||
    normalizedTranscript.includes("api") ||
    normalizedTranscript.includes("crm") ||
    normalizedTranscript.includes("webhook");

  const nodes: VoicePlan["nodes"] = [
    {
      id: "trigger",
      nodeType: wantsWebhookTrigger
        ? NodeType.WEBHOOK_TRIGGER
        : NodeType.MANUAL_TRIGGER,
      positionX: 0,
      positionY: 0,
      metadata: {},
    },
  ];

  if (wantsEmail) {
    nodes.push({
      id: wantsReply ? "email-await-reply" : "send-email",
      nodeType: wantsReply
        ? NodeType.SEND_EMAIL_AND_AWAIT_REPLY
        : NodeType.SEND_EMAIL,
      positionX: nodes.length * 200,
      positionY: 0,
      metadata: {},
      needsConfig: true,
      missingFields: ["to", "subject", "body"],
    });
  }

  if (wantsDelay) {
    nodes.push({
      id: "delay",
      nodeType: NodeType.DELAY,
      positionX: nodes.length * 200,
      positionY: 0,
      metadata: {
        label: "Delay",
        appName: "Delay",
        integrationKey: "delay",
        ...(delayDurationMs === undefined ? {} : { durationMs: delayDurationMs }),
      },
      needsConfig: delayDurationMs === undefined,
      missingFields: delayDurationMs === undefined ? ["durationMs"] : [],
    });
  }

  if (wantsFilter) {
    nodes.push({
      id: "filter",
      nodeType: NodeType.FILTER,
      positionX: nodes.length * 200,
      positionY: 0,
      metadata: {
        label: "Filter",
        appName: "Filter",
        integrationKey: "filter",
      },
      needsConfig: true,
      missingFields: ["left", "operator", "right"],
    });
  }

  if (wantsHttp) {
    const messageMetadata = wantsSlack
      ? { label: "Send Slack message", integrationKey: "slack", appName: "Slack" }
      : wantsDiscord
        ? {
            label: "Send Discord message",
            integrationKey: "discord",
            appName: "Discord",
          }
        : wantsWhatsApp
          ? {
              label: "Send WhatsApp message",
              integrationKey: "whatsapp",
              appName: "WhatsApp",
            }
          : { label: "Send message", integrationKey: "http", appName: "HTTP" };
    const messageMissingFields = wantsWhatsApp
      ? ["accessToken", "phoneNumberId", "to", "message"]
      : wantsSlack || wantsDiscord
        ? ["webhookUrl", "message"]
        : ["endpoint", "body"];
    nodes.push({
      id: wantsMessage ? "send-message" : "http-request",
      nodeType: NodeType.HTTP_REQUEST,
      positionX: nodes.length * 200,
      positionY: 0,
      metadata: wantsMessage ? messageMetadata : {},
      needsConfig: true,
      missingFields: wantsMessage ? messageMissingFields : ["endpoint"],
    });
  }

  if (nodes.length === 1) {
    nodes.push({
      id: "step",
      nodeType: NodeType.EMPTY,
      positionX: 200,
      positionY: 0,
      metadata: {},
      needsConfig: true,
      missingFields: ["action"],
    });
  }

  nodes.push({
    id: "add",
    nodeType: NodeType.ADD_NODE,
    positionX: nodes.length * 200,
    positionY: 0,
    metadata: {},
  });

  return {
    nameSuggestion: "Voice workflow",
    explanation:
      "Created a safe draft from your transcript. Configure the missing fields before running it.",
    nodes,
    edges: nodes.flatMap((node, index) => {
      const target = nodes[index + 1];
      if (!target) {
        return [];
      }
      return {
        id: `${node.id}-${target.id}`,
        sourceNodeId: node.id,
        targetNodeId: target.id,
        edgeType: EdgeType.STEP,
        metadata: {},
      };
    }),
  };
}

export function getVoicePlannerPrompt(transcript: string) {
  return `
Convert this spoken workflow request into a workflow graph for this app.

Supported node types:
- MANUAL_TRIGGER
- WEBHOOK_TRIGGER
- SEND_EMAIL
- SEND_EMAIL_AND_AWAIT_REPLY
- HTTP_REQUEST
- DELAY
- FILTER
- EMPTY
- ADD_NODE

Rules:
- Return JSON only.
- Use exact node keys: id, nodeType, positionX, positionY, metadata, needsConfig, missingFields.
- Use exact edge keys: id, sourceNodeId, targetNodeId, edgeType, metadata.
- Do not use alias keys like type, source, target, or position.
- Always include exactly one trigger node unless the user explicitly asks for a webhook.
- Default trigger is MANUAL_TRIGGER.
- Always include one ADD_NODE at the end.
- Use STEP edges unless the user clearly asks for conditional logic.
- Use DELAY for wait, delay, or pause requests. Set metadata.durationMs when the duration is clear.
- Use FILTER for conditional requests like "only continue if". Mark missing condition fields if unclear.
- Use HTTP_REQUEST with metadata.integrationKey "slack", "discord", or "whatsapp" when the user names those apps.
- Never invent emails, URLs, credentials, secrets, or API keys.
- If required node fields are missing, keep metadata empty or blank, set needsConfig true, and list missingFields.
- Use positions from left to right, 200 pixels apart.

Spoken request:
${transcript}
`.trim();
}

export function getVoicePlannerProvider(
  env: NodeJS.ProcessEnv = process.env,
): VoicePlannerProvider {
  if (env.GROQ_API_KEY) {
    return {
      kind: "groq-chat-json",
      apiKey: env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
      model: env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    };
  }
  if (env.OPENAI_API_KEY) {
    return {
      kind: "openai-responses",
      apiKey: env.OPENAI_API_KEY,
      baseUrl: "https://api.openai.com/v1/responses",
      model: env.VOICE_PLANNER_MODEL ?? "gpt-5.1",
    };
  }
  const error = new Error(
    "GROQ_API_KEY or OPENAI_API_KEY is required for voice planning",
  );
  (error as Error & { status?: number }).status = 503;
  throw error;
}

export function buildPlannerRequestBody(
  provider: VoicePlannerProvider,
  transcript: string,
) {
  const systemPrompt =
    "You are a workflow planner. Convert user intent into valid JSON for the requested schema.";
  const prompt = getVoicePlannerPrompt(transcript);

  if (provider.kind === "groq-chat-json") {
    return {
      model: provider.model,
      messages: [
        {
          role: "system",
          content: `${systemPrompt} Return JSON only.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    };
  }

  return {
    model: provider.model,
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "voice_workflow_plan",
        schema: voicePlanJsonSchema,
      },
    },
  };
}

export function extractPlannerResponseText(response: unknown): string {
  const data = response as {
    output_text?: string;
    output?: Array<{
      content?: Array<{ text?: string; type?: string }>;
    }>;
    choices?: Array<{
      message?: { content?: string };
    }>;
  };
  if (data.output_text) {
    return data.output_text;
  }
  const content = data.output?.flatMap((item) => item.content ?? []) ?? [];
  const text = content.find((item) => typeof item.text === "string")?.text;
  if (text) {
    return text;
  }
  const chatText = data.choices?.[0]?.message?.content;
  if (chatText) {
    return chatText;
  }
  throw new Error("planner response did not include text");
}

export const voicePlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["explanation", "nodes", "edges"],
  properties: {
    nameSuggestion: { type: "string" },
    explanation: { type: "string" },
    nodes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "nodeType", "positionX", "positionY", "metadata"],
        properties: {
          id: { type: "string" },
          nodeType: { type: "string", enum: supportedNodeTypes },
          positionX: { type: "number" },
          positionY: { type: "number" },
          metadata: { type: "object", additionalProperties: true },
          needsConfig: { type: "boolean" },
          missingFields: { type: "array", items: { type: "string" } },
        },
      },
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "sourceNodeId", "targetNodeId", "edgeType"],
        properties: {
          id: { type: "string" },
          sourceNodeId: { type: "string" },
          targetNodeId: { type: "string" },
          edgeType: { type: "string", enum: [EdgeType.STEP, EdgeType.IF] },
          metadata: { type: "object", additionalProperties: true },
        },
      },
    },
  },
};
