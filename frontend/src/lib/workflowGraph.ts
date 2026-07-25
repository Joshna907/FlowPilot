import { Edge, Node } from "@xyflow/react";

const WORKFLOW_GAP_X = 200;
const WORKFLOW_GAP_Y = 160;
const STEP_EDGE = "STEP";
const NODE_TYPE = {
  ADD_NODE: "ADD_NODE",
  INITIAL: "INITIAL",
  EMPTY: "EMPTY",
  WEBHOOK_TRIGGER: "WEBHOOK_TRIGGER",
  MANUAL_TRIGGER: "MANUAL_TRIGGER",
  DELAY: "DELAY",
  FILTER: "FILTER",
} as const;

type NodeType = (typeof NODE_TYPE)[keyof typeof NODE_TYPE];

export type WorkflowGraph = {
  nodes: Node[];
  edges: Edge[];
};

export type WorkflowIssue = {
  code:
    | "missing_trigger"
    | "missing_config"
    | "disconnected_node"
    | "empty_action";
  nodeId?: string;
  message: string;
};

const triggerTypes = new Set<NodeType>([
  NODE_TYPE.INITIAL,
  NODE_TYPE.MANUAL_TRIGGER,
  NODE_TYPE.WEBHOOK_TRIGGER,
]);

const placeholderTypes = new Set<NodeType>([
  NODE_TYPE.ADD_NODE,
  NODE_TYPE.INITIAL,
]);

function isTrigger(node: Node) {
  return triggerTypes.has(node.type as NodeType);
}

function isPlaceholder(node: Node) {
  return placeholderTypes.has(node.type as NodeType);
}

function stepEdge(source: string, target: string): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    type: STEP_EDGE,
    data: {},
  };
}

export function addEmptyNodeToGraph({
  nodes,
  edges,
  newNodeId,
  newTriggerNodeId,
  newAddNodeId,
}: WorkflowGraph & {
  newNodeId: string;
  newTriggerNodeId: string;
  newAddNodeId: string;
}): WorkflowGraph {
  if (nodes.length === 0) {
    return {
      nodes: [
        {
          id: newTriggerNodeId,
          position: { x: 0, y: 0 },
          type: NODE_TYPE.INITIAL,
          data: { label: "Choose trigger" },
        },
        {
          id: newNodeId,
          position: { x: 0, y: WORKFLOW_GAP_Y },
          type: NODE_TYPE.EMPTY,
          data: { label: "Node" },
        },
        {
          id: newAddNodeId,
          position: { x: 0, y: WORKFLOW_GAP_Y * 2 },
          type: NODE_TYPE.ADD_NODE,
          data: {},
        },
      ],
      edges: [
        stepEdge(newTriggerNodeId, newNodeId),
        stepEdge(newNodeId, newAddNodeId),
      ],
    };
  }

  const nextNodes: Node[] = nodes.map((node) => ({
    ...node,
    data: { ...node.data },
    position: { ...node.position },
  }));
  const addIndex = nextNodes.findIndex((node) => node.type === NODE_TYPE.ADD_NODE);
  const existingAddNode = addIndex === -1 ? undefined : nextNodes[addIndex];
  const insertIndex = addIndex === -1 ? nextNodes.length : addIndex;
  const previousNode = nextNodes[insertIndex - 1];
  const inferredX = previousNode ? (previousNode.position?.x ?? 0) : 0;
  const inferredY = previousNode
    ? (previousNode.position?.y ?? 0) + WORKFLOW_GAP_Y
    : 0;
  const targetAddNode: Node = existingAddNode
    ? {
        ...existingAddNode,
        position: { x: inferredX, y: inferredY + WORKFLOW_GAP_Y },
      }
    : {
        id: newAddNodeId,
        position: { x: inferredX, y: inferredY + WORKFLOW_GAP_Y },
        type: NODE_TYPE.ADD_NODE,
        data: {},
      };

  const emptyNode: Node = {
    id: newNodeId,
    position: { x: inferredX, y: inferredY },
    type: NODE_TYPE.EMPTY,
    data: { label: "Node" },
  };

  const nextEdges = edges.filter(
    (edge) => !existingAddNode || edge.target !== existingAddNode.id,
  );
  if (previousNode) {
    nextEdges.push(stepEdge(previousNode.id, newNodeId));
  }
  nextEdges.push(stepEdge(newNodeId, targetAddNode.id));

  if (existingAddNode)
    nextNodes.splice(insertIndex, 1, emptyNode, targetAddNode);
  else nextNodes.push(emptyNode, targetAddNode);

  return { nodes: nextNodes, edges: nextEdges };
}

export function addIntegrationNodeToGraph({
  nodes,
  edges,
  integrationNode,
  newTriggerNodeId,
  newAddNodeId,
}: WorkflowGraph & {
  integrationNode: Node;
  newTriggerNodeId: string;
  newAddNodeId: string;
}): WorkflowGraph {
  if (nodes.length === 0) {
    const triggerNode: Node = {
      id: newTriggerNodeId,
      position: { x: 0, y: 0 },
      type: NODE_TYPE.INITIAL,
      data: { label: "Choose trigger" },
    };
    const actionNode: Node = {
      ...integrationNode,
      position: { x: 0, y: WORKFLOW_GAP_Y },
    };
    const addNode: Node = {
      id: newAddNodeId,
      position: { x: 0, y: WORKFLOW_GAP_Y * 2 },
      type: NODE_TYPE.ADD_NODE,
      data: {},
    };

    return {
      nodes: [triggerNode, actionNode, addNode],
      edges: [stepEdge(triggerNode.id, actionNode.id), stepEdge(actionNode.id, addNode.id)],
    };
  }

  const nextNodes: Node[] = nodes.map((node) => ({
    ...node,
    data: { ...node.data },
    position: { ...node.position },
  }));
  const addIndex = nextNodes.findIndex((node) => node.type === NODE_TYPE.ADD_NODE);
  const existingAddNode = addIndex === -1 ? undefined : nextNodes[addIndex];
  const insertIndex = addIndex === -1 ? nextNodes.length : addIndex;
  const previousNode = nextNodes[insertIndex - 1];
  const inferredX = previousNode ? (previousNode.position?.x ?? 0) : 0;
  const inferredY = previousNode
    ? (previousNode.position?.y ?? 0) + WORKFLOW_GAP_Y
    : 0;
  const targetAddNode: Node = existingAddNode
    ? {
        ...existingAddNode,
        position: { x: inferredX, y: inferredY + WORKFLOW_GAP_Y },
      }
    : {
        id: newAddNodeId,
        position: { x: inferredX, y: inferredY + WORKFLOW_GAP_Y },
        type: NODE_TYPE.ADD_NODE,
        data: {},
      };
  const actionNode: Node = {
    ...integrationNode,
    position: { x: inferredX, y: inferredY },
  };

  const nextEdges = edges.filter(
    (edge) => !existingAddNode || edge.target !== existingAddNode.id,
  );
  if (previousNode) {
    nextEdges.push(stepEdge(previousNode.id, actionNode.id));
  }
  nextEdges.push(stepEdge(actionNode.id, targetAddNode.id));

  if (existingAddNode)
    nextNodes.splice(insertIndex, 1, actionNode, targetAddNode);
  else nextNodes.push(actionNode, targetAddNode);

  return { nodes: nextNodes, edges: nextEdges };
}

export function deleteNodeFromGraph({
  nodes,
  edges,
  nodeId,
}: WorkflowGraph & { nodeId: string }): WorkflowGraph {
  const nodeToDelete = nodes.find((node) => node.id === nodeId);
  if (!nodeToDelete || nodeToDelete.type === NODE_TYPE.ADD_NODE) {
    return { nodes, edges };
  }

  const triggerCount = nodes.filter(isTrigger).length;
  if (isTrigger(nodeToDelete) && triggerCount <= 1) {
    return {
      nodes: nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              type: NODE_TYPE.INITIAL,
              data: { label: "Choose trigger" },
            }
          : node,
      ),
      edges,
    };
  }

  const incoming = edges.filter((edge) => edge.target === nodeId);
  const outgoing = edges.filter((edge) => edge.source === nodeId);
  const remainingEdges = edges.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId,
  );

  const reconnectEdges = incoming.flatMap((incomingEdge) =>
    outgoing
      .filter((outgoingEdge) => incomingEdge.source !== outgoingEdge.target)
      .map((outgoingEdge) => stepEdge(incomingEdge.source, outgoingEdge.target)),
  );

  const dedupedEdges = [...remainingEdges];
  for (const edge of reconnectEdges) {
    const exists = dedupedEdges.some(
      (item) => item.source === edge.source && item.target === edge.target,
    );
    if (!exists) dedupedEdges.push(edge);
  }

  return {
    nodes: nodes.filter((node) => node.id !== nodeId),
    edges: dedupedEdges,
  };
}

export function duplicateNodeInGraph({
  nodes,
  edges,
  nodeId,
  newNodeId,
}: WorkflowGraph & { nodeId: string; newNodeId: string }): WorkflowGraph {
  const sourceNode = nodes.find((node) => node.id === nodeId);
  if (!sourceNode || sourceNode.type === NODE_TYPE.ADD_NODE) {
    return { nodes, edges };
  }

  const label =
    typeof sourceNode.data?.label === "string"
      ? `${sourceNode.data.label} copy`
      : "Step copy";

  return {
    nodes: [
      ...nodes,
      {
        ...sourceNode,
        id: newNodeId,
        position: {
          x: (sourceNode.position?.x ?? 0) + WORKFLOW_GAP_X,
          y: (sourceNode.position?.y ?? 0) + 80,
        },
        data: {
          ...sourceNode.data,
          label,
          needsConfig: true,
          missingFields: sourceNode.data?.missingFields ?? [],
          voiceGenerated: false,
        },
      },
    ],
    edges,
  };
}

export function toggleNodeDisabledInGraph({
  nodes,
  nodeId,
}: {
  nodes: Node[];
  nodeId: string;
}) {
  return nodes.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          data: {
            ...node.data,
            disabled: !Boolean(node.data?.disabled),
          },
        }
      : node,
  );
}

export function validateWorkflowGraph({ nodes, edges }: WorkflowGraph) {
  const issues: WorkflowIssue[] = [];
  const activeNodes = nodes.filter((node) => !node.data?.disabled);
  const hasTrigger = activeNodes.some(
    (node) =>
      node.type === NODE_TYPE.MANUAL_TRIGGER ||
      node.type === NODE_TYPE.WEBHOOK_TRIGGER,
  );

  if (!hasTrigger) {
    issues.push({
      code: "missing_trigger",
      message: "Choose a manual or webhook trigger before running.",
    });
  }

  for (const node of activeNodes) {
    if (node.data?.needsConfig) {
      issues.push({
        code: "missing_config",
        nodeId: node.id,
        message: `${String(node.data.label ?? "Step")} needs configuration.`,
      });
    }
    if (node.type === NODE_TYPE.EMPTY) {
      issues.push({
        code: "empty_action",
        nodeId: node.id,
        message: "Select an action for every empty step.",
      });
    }
    if (!isTrigger(node) && !isPlaceholder(node)) {
      const connected = edges.some(
        (edge) => edge.source === node.id || edge.target === node.id,
      );
      if (!connected) {
        issues.push({
          code: "disconnected_node",
          nodeId: node.id,
          message: `${String(node.data.label ?? "Step")} is disconnected.`,
        });
      }
    }
  }

  return issues;
}
