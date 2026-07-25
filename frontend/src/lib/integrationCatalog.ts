import { Node } from "@xyflow/react";

const NODE_TYPE = {
  EMPTY: "EMPTY",
  SEND_EMAIL: "SEND_EMAIL",
  WEBHOOK_TRIGGER: "WEBHOOK_TRIGGER",
  MANUAL_TRIGGER: "MANUAL_TRIGGER",
  HTTP_REQUEST: "HTTP_REQUEST",
  DELAY: "DELAY",
  FILTER: "FILTER",
} as const;

export type IntegrationStatus = "enabled" | "coming_soon";
export type IntegrationCategory = "apps" | "ai" | "flow" | "utilities" | "custom";

export type IntegrationDefinition = {
  key: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  nodeType: string;
  actionLabel: string;
  missingFields: string[];
  tags: string[];
  accent: string;
  priority?: number;
};

export const integrationCatalog: IntegrationDefinition[] = [
  {
    key: "email",
    name: "Email",
    description: "Send Gmail messages.",
    category: "apps",
    status: "enabled",
    nodeType: NODE_TYPE.SEND_EMAIL,
    actionLabel: "Send email",
    missingFields: ["from", "to", "subject", "body"],
    tags: ["gmail", "mail", "message"],
    accent: "#2563eb",
    priority: 40,
  },
  {
    key: "slack",
    name: "Slack",
    description: "Send a Slack channel message using an incoming webhook.",
    category: "apps",
    status: "enabled",
    nodeType: NODE_TYPE.HTTP_REQUEST,
    actionLabel: "Send Slack message",
    missingFields: ["webhookUrl", "message"],
    tags: ["chat", "message", "team"],
    accent: "#611f69",
    priority: 100,
  },
  {
    key: "discord",
    name: "Discord",
    description: "Post a Discord message using a webhook URL.",
    category: "apps",
    status: "enabled",
    nodeType: NODE_TYPE.HTTP_REQUEST,
    actionLabel: "Send Discord message",
    missingFields: ["webhookUrl", "message"],
    tags: ["chat", "message", "community"],
    accent: "#5865f2",
    priority: 99,
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    description: "Send a WhatsApp Cloud API text message.",
    category: "apps",
    status: "enabled",
    nodeType: NODE_TYPE.HTTP_REQUEST,
    actionLabel: "Send WhatsApp message",
    missingFields: ["accessToken", "phoneNumberId", "to", "message"],
    tags: ["message", "customer", "meta"],
    accent: "#22c55e",
    priority: 98,
  },
  {
    key: "http",
    name: "HTTP Request",
    description: "Call any API endpoint.",
    category: "utilities",
    status: "enabled",
    nodeType: NODE_TYPE.HTTP_REQUEST,
    actionLabel: "HTTP request",
    missingFields: ["endpoint"],
    tags: ["api", "webhook", "request"],
    accent: "#0f766e",
  },
  {
    key: "webhook",
    name: "Webhook",
    description: "Start from an external URL.",
    category: "utilities",
    status: "enabled",
    nodeType: NODE_TYPE.WEBHOOK_TRIGGER,
    actionLabel: "Webhook trigger",
    missingFields: ["endpointId"],
    tags: ["trigger", "api"],
    accent: "#7c3aed",
  },
  {
    key: "manual",
    name: "Manual",
    description: "Start when you click run.",
    category: "flow",
    status: "enabled",
    nodeType: NODE_TYPE.MANUAL_TRIGGER,
    actionLabel: "Manual trigger",
    missingFields: [],
    tags: ["trigger", "test"],
    accent: "#1d57f7",
  },
  {
    key: "webhook-site",
    name: "Webhook.site",
    description: "Demo-friendly HTTP target.",
    category: "utilities",
    status: "enabled",
    nodeType: NODE_TYPE.HTTP_REQUEST,
    actionLabel: "Send test request",
    missingFields: ["endpoint", "body"],
    tags: ["demo", "test", "webhook"],
    accent: "#0ea5e9",
  },
  {
    key: "delay",
    name: "Delay",
    description: "Pause the workflow. Demo placeholder.",
    category: "flow",
    status: "enabled",
    nodeType: NODE_TYPE.DELAY,
    actionLabel: "Delay",
    missingFields: ["durationMs"],
    tags: ["wait", "pause"],
    accent: "#f59e0b",
  },
  {
    key: "filter",
    name: "Filter",
    description: "Continue only when conditions pass. Demo placeholder.",
    category: "flow",
    status: "enabled",
    nodeType: NODE_TYPE.FILTER,
    actionLabel: "Filter",
    missingFields: ["left", "operator", "right"],
    tags: ["if", "condition", "flow"],
    accent: "#14b8a6",
  },
  {
    key: "ai-by-flowpilot",
    name: "AI by FlowPilot",
    description: "Transform text with AI. Coming soon.",
    category: "ai",
    status: "coming_soon",
    nodeType: NODE_TYPE.EMPTY,
    actionLabel: "AI transform",
    missingFields: [],
    tags: ["ai", "llm"],
    accent: "#8b5cf6",
  },
  ...[
    "Google Sheets",
    "Notion",
    "Google Calendar",
    "Google Drive",
    "HubSpot",
    "Stripe",
    "Airtable",
    "Telegram",
  ].map((name) => ({
    key: name.toLowerCase().replaceAll(" ", "-"),
    name,
    description: "Catalog preview. Native integration coming soon.",
    category: "apps" as IntegrationCategory,
    status: "coming_soon" as IntegrationStatus,
    nodeType: NODE_TYPE.EMPTY,
    actionLabel: `${name} action`,
    missingFields: [],
    tags: ["app", "message", name.toLowerCase()],
    accent: "#64748b",
  })),
];

export const pickerIntegrationKeys = [
  "email",
  "slack",
  "whatsapp",
  "discord",
] as const;

export function getPickerIntegrations(query = "") {
  const allowed = new Set<string>(pickerIntegrationKeys);
  const source = query ? searchIntegrations(query) : integrationCatalog;
  const matches = source.filter((integration) => allowed.has(integration.key));
  return [...matches].sort(
    (a, b) =>
      pickerIntegrationKeys.indexOf(
        a.key as (typeof pickerIntegrationKeys)[number],
      ) -
      pickerIntegrationKeys.indexOf(
        b.key as (typeof pickerIntegrationKeys)[number],
      ),
  );
}

export function getIntegrationByKey(key: string) {
  return integrationCatalog.find((integration) => integration.key === key);
}

export function searchIntegrations(query: string, category?: IntegrationCategory) {
  const normalized = query.trim().toLowerCase();
  return integrationCatalog
    .filter((integration) => !category || integration.category === category)
    .filter((integration) => {
      if (!normalized) return true;
      return [
        integration.name,
        integration.description,
        integration.actionLabel,
        ...integration.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    })
    .sort((a, b) => {
      const status = Number(b.status === "enabled") - Number(a.status === "enabled");
      if (status !== 0) return status;
      const priority = (b.priority ?? 0) - (a.priority ?? 0);
      if (priority !== 0) return priority;
      return a.name.localeCompare(b.name);
    });
}

export function buildIntegrationNode({
  integrationKey,
  nodeId,
  position,
}: {
  integrationKey: string;
  nodeId: string;
  position: { x: number; y: number };
}): Node {
  const integration = getIntegrationByKey(integrationKey);
  if (!integration) {
    throw new Error(`Unknown integration: ${integrationKey}`);
  }
  return {
    id: nodeId,
    type: integration.nodeType,
    position,
    data: {
      integrationKey,
      appName: integration.name,
      label: integration.actionLabel,
      accent: integration.accent,
      needsConfig: integration.missingFields.length > 0,
      missingFields: integration.missingFields,
    },
  };
}
