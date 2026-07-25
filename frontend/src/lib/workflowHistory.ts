import type { Edge, Node } from "@xyflow/react";

export type WorkflowGraphSnapshot = {
  nodes: Node[];
  edges: Edge[];
};

export type WorkflowHistoryState = {
  past: WorkflowGraphSnapshot[];
  future: WorkflowGraphSnapshot[];
};

export function cloneWorkflowGraph(
  graph: WorkflowGraphSnapshot,
): WorkflowGraphSnapshot {
  return {
    nodes: graph.nodes.map((node) => ({
      ...node,
      position: { ...node.position },
      data: { ...(node.data ?? {}) },
    })),
    edges: graph.edges.map((edge) => ({
      ...edge,
      data: { ...(edge.data ?? {}) },
    })),
  };
}

export function pushWorkflowHistory({
  past,
  current,
}: WorkflowHistoryState & { current: WorkflowGraphSnapshot }) {
  return {
    past: [...past, cloneWorkflowGraph(current)].slice(-50),
    future: [],
  };
}

export function undoWorkflowHistory({
  past,
  future,
  current,
}: WorkflowHistoryState & { current: WorkflowGraphSnapshot }) {
  const graph = past[past.length - 1] ?? cloneWorkflowGraph(current);
  return {
    graph: cloneWorkflowGraph(graph),
    past: past.slice(0, -1),
    future: [cloneWorkflowGraph(current), ...future].slice(0, 50),
  };
}

export function redoWorkflowHistory({
  past,
  future,
  current,
}: WorkflowHistoryState & { current: WorkflowGraphSnapshot }) {
  const graph = future[0] ?? cloneWorkflowGraph(current);
  return {
    graph: cloneWorkflowGraph(graph),
    past: [...past, cloneWorkflowGraph(current)].slice(-50),
    future: future.slice(1),
  };
}
