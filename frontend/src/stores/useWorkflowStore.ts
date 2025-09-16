import {
  EmptyNode,
  ManualTriggerNode,
  InitialNode,
  AddNode,
} from "@/app/workflow/[id]/components/nodes/custom";
import { toast } from "sonner";
import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";
import { SetterFunction } from "./types";

export enum NodeType {
  INITIAL = "INITIAL",
  EMPTY = "EMPTY",
  MANUAL = "MANUAL",
  ADD = "ADD",
}

export const WORKFLOW_GAP_X = 200;

export const nodeTypes = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.EMPTY]: EmptyNode,
  [NodeType.MANUAL]: ManualTriggerNode,
  [NodeType.ADD]: AddNode,
} as const;

type WorkflowState = {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: SetterFunction<Node[]>) => void;
  setEdges: (edges: SetterFunction<Edge[]>) => void;
  selectedNodeId: string | undefined;
  setSelectedNodeId: (nodeId: string) => void;
  changeSelectedNodeType: (type: NodeType) => void;
};

const initialNodes: Node[] = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    type: NodeType.INITIAL,
    data: { label: "Node 1" },
  },
  {
    id: "nE",
    position: { x: 0 + WORKFLOW_GAP_X, y: 6 },
    type: NodeType.ADD,
    data: {},
  },
];

const initialEdges: Edge[] = [
  {
    id: "n1-nE",
    source: "n1",
    target: "nE",
    type: "step",
  },
];

export const useWorkflow = create<WorkflowState>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  setNodes: (nodes) =>
    set((state) => ({
      nodes: typeof nodes === "function" ? nodes(state.nodes) : nodes,
    })),
  setEdges: (edges) =>
    set((state) => ({
      edges: typeof edges === "function" ? edges(state.edges) : edges,
    })),
  selectedNodeId: undefined,
  setSelectedNodeId: (nodeId: string) =>
    set({
      selectedNodeId: nodeId,
    }),
  changeSelectedNodeType: (type: NodeType) => {
    set((s) => {
      const allNodes = s.nodes;
      const foundNodeIndex = allNodes.findIndex(
        (node) => node.id === s.selectedNodeId,
      );
      if (foundNodeIndex === -1) {
        toast.error("unable to find selected node Id");
      }
      const updatedFoundNode = { ...allNodes[foundNodeIndex], type };
      const allNodesClone = [...allNodes];
      allNodesClone[foundNodeIndex] = updatedFoundNode;
      return { nodes: allNodesClone };
    });
  },
}));
