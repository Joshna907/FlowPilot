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
import _ from "lodash";

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
  addNewEmptyNode: () => void;
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
  addNewEmptyNode: () => {
    set((s) => {
      const lastNodeId = s.nodes[s.nodes.length - 1].id;
      const newNodeId = `n${Math.random().toString(36).slice(2, 10)}`;

      // update nodes
      const nextNodes = _.cloneDeep(s.nodes);
      const addIndex = nextNodes.findIndex((n) => n.id === lastNodeId);
      const insertIndex =
        addIndex === -1 ? Math.max(nextNodes.length - 1, 0) : addIndex;

      const previousNode = nextNodes[insertIndex - 1];
      const inferredX = previousNode
        ? (previousNode.position?.x ?? 0) + WORKFLOW_GAP_X
        : 0;
      const inferredY = previousNode ? (previousNode.position?.y ?? 0) : 0;

      nextNodes.splice(insertIndex, 0, {
        id: newNodeId,
        position: { x: inferredX, y: inferredY },
        type: NodeType.EMPTY,
        data: { label: "Node" },
      });

      // update positioning
      const addNode = nextNodes[insertIndex + 1];
      if (addNode) {
        addNode.position = {
          x: inferredX + WORKFLOW_GAP_X,
          y: inferredY,
        };
      }

      // update egdes
      let nextEdges = _.cloneDeep(s.edges);
      const edgeToAdd = nextEdges.find((e) => e.target === lastNodeId);
      // edged without old connections
      nextEdges = edgeToAdd
        ? nextEdges.filter((e) => e.id !== edgeToAdd.id)
        : nextEdges;

      const prevSourceId = edgeToAdd?.source;
      if (prevSourceId) {
        nextEdges.push({
          id: `${prevSourceId}-${newNodeId}`,
          source: prevSourceId,
          target: newNodeId,
          type: "step",
        });
      }
      nextEdges.push({
        id: `${newNodeId}-${lastNodeId}`,
        source: newNodeId,
        target: lastNodeId,
        type: "step",
      });
      return { edges: nextEdges, nodes: nextNodes };
    });
  },
}));
