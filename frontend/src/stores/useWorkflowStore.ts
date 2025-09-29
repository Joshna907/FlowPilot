import {
  EmptyNode,
  ManualTriggerNode,
  InitialNode,
  AddNode,
  EmailNode,
  SendEmailAndAwaitReplyNode,
  WebhookTriggerNode,
  HttpRequestNode,
} from "@/app/workflow/[id]/components/nodes/custom";
import { toast } from "sonner";
import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";
import { SetterFunction } from "./types";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import {
  CustomEdge,
  IfEdge,
} from "@/app/workflow/[id]/components/edges/custom";

export enum NodeType {
  ADD_NODE = "ADD_NODE",
  INITIAL = "INITIAL",
  EMPTY = "EMPTY",
  SEND_EMAIL = "SEND_EMAIL",
  WEBHOOK_TRIGGER = "WEBHOOK_TRIGGER",
  MANUAL_TRIGGER = "MANUAL_TRIGGER",
  SEND_EMAIL_AND_AWAIT_REPLY = "SEND_EMAIL_AND_AWAIT_REPLY",
  HTTP_REQUEST = "HTTP_REQUEST",
}

export enum EdgeType {
  STEP = "STEP",
  IF = "IF",
}

export const WORKFLOW_GAP_X = 200;

export const nodeTypes = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.EMPTY]: EmptyNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.ADD_NODE]: AddNode,
  [NodeType.WEBHOOK_TRIGGER]: WebhookTriggerNode,
  [NodeType.SEND_EMAIL]: EmailNode,
  [NodeType.SEND_EMAIL_AND_AWAIT_REPLY]: SendEmailAndAwaitReplyNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
} as const;

export const edgeTypes = {
  [EdgeType.STEP]: CustomEdge,
  [EdgeType.IF]: IfEdge,
} as const;

const initialNodes: Node[] = [
  {
    id: uuidv4(),
    position: { x: 0, y: 0 },
    type: NodeType.INITIAL,
    data: { label: "Node 1" },
  },
  {
    id: uuidv4(),
    position: { x: 0 + WORKFLOW_GAP_X, y: 6 },
    type: NodeType.ADD_NODE,
    data: {},
  },
];

const initialEdges: Edge[] = [
  {
    id: `${initialNodes[0].id}-${initialNodes[1].id}`,
    source: initialNodes[0].id,
    target: initialNodes[1].id,
    type: EdgeType.STEP,
    data: {},
  },
];

type WorkflowState = {
  workflow: {
    name: string;
    id: string;
  };
  setWorkflow: (input: { name: string; id: string }) => void;
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: SetterFunction<Node[]>) => void;
  setEdges: (edges: SetterFunction<Edge[]>) => void;
  selectedNodeId: string | undefined;
  selectedEdgeId: string | undefined;
  setSelectedEdgeId: (edgeId: string) => void;
  setSelectedNodeId: (edgeId: string) => void;
  updateSelectedEdge: (input: {
    type?: EdgeType;
    metadata?: Record<string, unknown>;
  }) => void;
  updateSelectedNode: (input: {
    type?: NodeType;
    metadata?: Record<string, unknown>;
  }) => void;
  addNewEmptyNode: () => void;
  updateNodeLabel: (input: { nodeId: string; label: string }) => void;
};

export const useWorkflow = create<WorkflowState>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: undefined,
  selectedEdgeId: undefined,

  workflow: {
    id: "",
    name: "",
  },

  setWorkflow: (input: { name: string; id: string }) => {
    set({ workflow: input });
  },

  setNodes: (nodes) =>
    set((state) => ({
      nodes: typeof nodes === "function" ? nodes(state.nodes) : nodes,
    })),

  setEdges: (edges) =>
    set((state) => ({
      edges: typeof edges === "function" ? edges(state.edges) : edges,
    })),

  setSelectedNodeId: (nodeId: string) =>
    set({
      selectedNodeId: nodeId,
    }),

  setSelectedEdgeId: (edgeId: string) =>
    set({
      selectedEdgeId: edgeId,
    }),

  updateSelectedEdge: ({
    type,
    metadata,
  }: {
    type?: EdgeType;
    metadata?: Record<string, unknown>;
  }) => {
    set((s) => {
      const allEdges = s.edges;
      const foundEdgeIndex = allEdges.findIndex(
        (edge) => edge.id === s.selectedEdgeId,
      );
      if (foundEdgeIndex === -1) {
        toast.error("unable to find selected edge Id");
      }
      const updatedFoundEdge = {
        ...allEdges[foundEdgeIndex],
        ...(type && { type }),
        ...(metadata && { data: metadata }),
      };
      const allEdgesClone = [...allEdges];
      allEdgesClone[foundEdgeIndex] = updatedFoundEdge;
      return { edges: allEdgesClone };
    });
  },
  updateSelectedNode: ({
    type,
    metadata,
  }: {
    type?: NodeType;
    metadata?: Record<string, unknown>;
  }) => {
    set((s) => {
      const allNodes = s.nodes;
      const foundNodeIndex = allNodes.findIndex(
        (node) => node.id === s.selectedNodeId,
      );
      if (foundNodeIndex === -1) {
        toast.error("unable to find selected node Id");
      }
      const updatedFoundNode = {
        ...allNodes[foundNodeIndex],
        ...(type && { type }),
        ...(metadata && { data: metadata }),
      };
      const allNodesClone = [...allNodes];
      allNodesClone[foundNodeIndex] = updatedFoundNode;
      return { nodes: allNodesClone };
    });
  },

  updateNodeLabel: ({ nodeId, label }: { nodeId: string; label: string }) => {
    set((s) => {
      const allNodes = s.nodes;
      const foundNodeIndex = allNodes.findIndex((node) => node.id === nodeId);
      if (foundNodeIndex === -1) {
        toast.error("unable to find given node Id");
        return {};
      }
      // find if other node has the same label
      const foundLabel = allNodes.find((n) => {
        return n.data.label === label;
      });
      if (foundLabel) {
        toast.error("same label exists , please use a different label");
        return {};
      }
      const updatedFoundNode = {
        ...allNodes[foundNodeIndex],
        data: { ...allNodes[foundNodeIndex].data, label },
      };
      const allNodesClone = [...allNodes];
      allNodesClone[foundNodeIndex] = updatedFoundNode;
      return { nodes: allNodesClone };
    });
  },

  addNewEmptyNode: () => {
    set((s) => {
      const lastNodeId = s.nodes[s.nodes.length - 1].id;
      const newNodeId = uuidv4();

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
      console.log({ edges: nextEdges, nodes: nextNodes });
      return { edges: nextEdges, nodes: nextNodes };
    });
  },
}));
