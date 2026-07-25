import { ApiEdgeInput, ApiNodeInput } from "@/app/workflow/types";
import { convertStateToApiEdge, convertStateToApiNode } from "@/lib/utils";
import { Edge, Node } from "@xyflow/react";

export function assertWorkflowEditorReady({
  expectedWorkflowId,
  activeWorkflowId,
  nodes,
}: {
  expectedWorkflowId: string;
  activeWorkflowId: string;
  nodes: Node[];
}) {
  if (activeWorkflowId !== expectedWorkflowId) {
    throw new Error("Editor is still switching workflows. Refresh and try again.");
  }
  if (nodes.length === 0) {
    throw new Error("Canvas is empty. Add a trigger before saving.");
  }
}

export function buildWorkflowSavePayload(
  nodes: Node[],
  edges: Edge[],
): { nodes: ApiNodeInput[]; edges: ApiEdgeInput[] } {
  return {
    nodes: nodes.map(convertStateToApiNode),
    edges: edges.map(convertStateToApiEdge),
  };
}
