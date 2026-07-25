import { EdgeType, NodeType } from "@/stores/useWorkflowStore";
import type { ApiEdgeInput, ApiNodeInput } from "@/app/workflow/types";
import { v4 as uuidv4 } from "uuid";

type TemplateStep = {
  nodeType: NodeType;
  metadata: Record<string, unknown>;
};

export type WorkflowTemplate = {
  key: string;
  name: string;
  description: string;
  prompt: string;
  steps: TemplateStep[];
};

export const workflowTemplates: WorkflowTemplate[] = [
  {
    key: "webhook-to-slack",
    name: "Webhook to Slack",
    description: "Receive an external event and post it into Slack.",
    prompt: "When a webhook arrives, send a Slack message.",
    steps: [
      {
        nodeType: NodeType.WEBHOOK_TRIGGER,
        metadata: {
          label: "Webhook",
          integrationKey: "webhook",
          appName: "Webhook",
          needsConfig: true,
          missingFields: ["endpointId"],
        },
      },
      {
        nodeType: NodeType.HTTP_REQUEST,
        metadata: {
          label: "Send Slack message",
          integrationKey: "slack",
          appName: "Slack",
          needsConfig: true,
          missingFields: ["webhookUrl"],
          message: "New webhook event received",
        },
      },
    ],
  },
  {
    key: "manual-to-whatsapp",
    name: "Manual to WhatsApp",
    description: "Click run and send a WhatsApp Cloud API message.",
    prompt: "When I run manually, send a WhatsApp message.",
    steps: [
      {
        nodeType: NodeType.MANUAL_TRIGGER,
        metadata: { label: "Manual", integrationKey: "manual" },
      },
      {
        nodeType: NodeType.HTTP_REQUEST,
        metadata: {
          label: "Send WhatsApp message",
          integrationKey: "whatsapp",
          appName: "WhatsApp",
          needsConfig: true,
          missingFields: ["accessToken", "phoneNumberId", "to"],
          message: "okay",
        },
      },
    ],
  },
  {
    key: "email-follow-up",
    name: "Email follow-up",
    description: "Manually send a follow-up email and wait for reply.",
    prompt: "When I run manually, send a follow-up email and await reply.",
    steps: [
      {
        nodeType: NodeType.MANUAL_TRIGGER,
        metadata: { label: "Manual", integrationKey: "manual" },
      },
      {
        nodeType: NodeType.SEND_EMAIL_AND_AWAIT_REPLY,
        metadata: {
          label: "Send email and await reply",
          needsConfig: true,
          missingFields: ["from", "to", "subject", "body"],
        },
      },
    ],
  },
  {
    key: "api-to-discord",
    name: "API to Discord",
    description: "Call an API, then notify Discord.",
    prompt: "Run manually, call an API, then send a Discord message.",
    steps: [
      {
        nodeType: NodeType.MANUAL_TRIGGER,
        metadata: { label: "Manual", integrationKey: "manual" },
      },
      {
        nodeType: NodeType.HTTP_REQUEST,
        metadata: {
          label: "Call API",
          integrationKey: "http",
          appName: "HTTP Request",
          needsConfig: true,
          missingFields: ["endpoint"],
          method: "GET",
        },
      },
      {
        nodeType: NodeType.HTTP_REQUEST,
        metadata: {
          label: "Send Discord message",
          integrationKey: "discord",
          appName: "Discord",
          needsConfig: true,
          missingFields: ["webhookUrl"],
          message: "API workflow completed",
        },
      },
    ],
  },
];

export function buildTemplateCreatePayload(template: WorkflowTemplate): {
  name: string;
  nodes: ApiNodeInput[];
  edges: ApiEdgeInput[];
} {
  const addNodeId = uuidv4();
  const nodes = template.steps.map((step, index) => ({
    id: uuidv4(),
    nodeType: step.nodeType,
    positionX: 0,
    positionY: index * 160,
    metadata: step.metadata,
  }));
  nodes.push({
    id: addNodeId,
    nodeType: NodeType.ADD_NODE,
    positionX: 0,
    positionY: nodes.length * 160,
    metadata: {},
  });

  const edges = nodes.slice(0, -1).map((node, index) => ({
    id: `${node.id}-${nodes[index + 1].id}`,
    sourceNodeId: node.id,
    targetNodeId: nodes[index + 1].id,
    edgeType: EdgeType.STEP,
    metadata: {},
  }));

  return {
    name: template.name,
    nodes,
    edges,
  };
}
