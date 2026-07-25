import {
  EmptyNode,
  ManualTriggerNode,
  InitialNode,
  AddNode,
  EmailNode,
  SendEmailAndAwaitReplyNode,
  WebhookTriggerNode,
  HttpRequestNode,
  FlowControlNode,
} from "@/app/workflow/[id]/components/nodes/custom";
import { toast } from "sonner";
import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";
import { SetterFunction } from "./types";
import { v4 as uuidv4 } from "uuid";
import {
  CustomEdge,
  IfEdge,
} from "@/app/workflow/[id]/components/edges/custom";
import {
  addEmptyNodeToGraph,
  addIntegrationNodeToGraph,
  deleteNodeFromGraph,
  duplicateNodeInGraph,
  toggleNodeDisabledInGraph,
} from "@/lib/workflowGraph";
import {
  buildIntegrationNode,
  getIntegrationByKey,
} from "@/lib/integrationCatalog";
import {
  pushWorkflowHistory,
  redoWorkflowHistory,
  undoWorkflowHistory,
} from "@/lib/workflowHistory";
import type { WorkflowGraphSnapshot } from "@/lib/workflowHistory";

export enum NodeType {
  ADD_NODE = "ADD_NODE",
  INITIAL = "INITIAL",
  EMPTY = "EMPTY",
  SEND_EMAIL = "SEND_EMAIL",
  WEBHOOK_TRIGGER = "WEBHOOK_TRIGGER",
  MANUAL_TRIGGER = "MANUAL_TRIGGER",
  SEND_EMAIL_AND_AWAIT_REPLY = "SEND_EMAIL_AND_AWAIT_REPLY",
  HTTP_REQUEST = "HTTP_REQUEST",
  DELAY = "DELAY",
  FILTER = "FILTER",
}

export enum EdgeType {
  STEP = "STEP",
  IF = "IF",
}

export const WORKFLOW_GAP_X = 200;
export const WORKFLOW_GAP_Y = 160;

export const nodeTypes = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.EMPTY]: EmptyNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.ADD_NODE]: AddNode,
  [NodeType.WEBHOOK_TRIGGER]: WebhookTriggerNode,
  [NodeType.SEND_EMAIL]: EmailNode,
  [NodeType.SEND_EMAIL_AND_AWAIT_REPLY]: SendEmailAndAwaitReplyNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.DELAY]: FlowControlNode,
  [NodeType.FILTER]: FlowControlNode,
} as const;

export const edgeTypes = {
  [EdgeType.STEP]: CustomEdge,
  [EdgeType.IF]: IfEdge,
} as const;

export function createInitialWorkflowGraph() {
  const triggerId = uuidv4();
  const addNodeId = uuidv4();
  const nodes: Node[] = [
    {
      id: triggerId,
      position: { x: 0, y: 0 },
      type: NodeType.INITIAL,
      data: { label: "Node 1" },
    },
    {
      id: addNodeId,
      position: { x: 0, y: WORKFLOW_GAP_Y },
      type: NodeType.ADD_NODE,
      data: {},
    },
  ];
  const edges: Edge[] = [
    {
      id: `${triggerId}-${addNodeId}`,
      source: triggerId,
      target: addNodeId,
      type: EdgeType.STEP,
      data: {},
    },
  ];
  return { nodes, edges };
}

const initialGraph = createInitialWorkflowGraph();

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
  replaceGraph: (graph: WorkflowGraphSnapshot) => void;
  loadWorkflow: (input: {
    workflow: { name: string; id: string };
    graph: WorkflowGraphSnapshot;
  }) => void;
  historyPast: WorkflowGraphSnapshot[];
  historyFuture: WorkflowGraphSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
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
  addIntegrationStep: (integrationKey: string) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  toggleNodeDisabled: (nodeId: string) => void;
  updateNodeLabel: (input: { nodeId: string; label: string }) => void;
};

function withHistory(
  state: Pick<WorkflowState, "nodes" | "edges" | "historyPast" | "historyFuture">,
  graph: Partial<WorkflowGraphSnapshot>,
) {
  const history = pushWorkflowHistory({
    past: state.historyPast,
    future: state.historyFuture,
    current: { nodes: state.nodes, edges: state.edges },
  });
  return {
    ...graph,
    historyPast: history.past,
    historyFuture: history.future,
    canUndo: history.past.length > 0,
    canRedo: false,
  };
}

export const useWorkflow = create<WorkflowState>((set) => ({
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  historyPast: [],
  historyFuture: [],
  canUndo: false,
  canRedo: false,
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
    set((state) =>
      withHistory(state, {
        nodes: typeof nodes === "function" ? nodes(state.nodes) : nodes,
      }),
    ),

  setEdges: (edges) =>
    set((state) =>
      withHistory(state, {
        edges: typeof edges === "function" ? edges(state.edges) : edges,
      }),
    ),

  replaceGraph: ({ nodes, edges }) =>
    set({
      nodes,
      edges,
      historyPast: [],
      historyFuture: [],
      canUndo: false,
      canRedo: false,
    }),

  loadWorkflow: ({ workflow, graph }) =>
    set({
      workflow,
      nodes: graph.nodes,
      edges: graph.edges,
      historyPast: [],
      historyFuture: [],
      canUndo: false,
      canRedo: false,
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
    }),

  undo: () =>
    set((state) => {
      if (state.historyPast.length === 0) return {};
      const result = undoWorkflowHistory({
        past: state.historyPast,
        future: state.historyFuture,
        current: { nodes: state.nodes, edges: state.edges },
      });
      return {
        nodes: result.graph.nodes,
        edges: result.graph.edges,
        historyPast: result.past,
        historyFuture: result.future,
        canUndo: result.past.length > 0,
        canRedo: result.future.length > 0,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.historyFuture.length === 0) return {};
      const result = redoWorkflowHistory({
        past: state.historyPast,
        future: state.historyFuture,
        current: { nodes: state.nodes, edges: state.edges },
      });
      return {
        nodes: result.graph.nodes,
        edges: result.graph.edges,
        historyPast: result.past,
        historyFuture: result.future,
        canUndo: result.past.length > 0,
        canRedo: result.future.length > 0,
      };
    }),

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
        return {};
      }
      const updatedFoundEdge = {
        ...allEdges[foundEdgeIndex],
        ...(type && { type }),
        ...(metadata && { data: metadata }),
      };
      const allEdgesClone = [...allEdges];
      allEdgesClone[foundEdgeIndex] = updatedFoundEdge;
      return withHistory(s, { edges: allEdgesClone });
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
        return {};
      }
      const updatedFoundNode = {
        ...allNodes[foundNodeIndex],
        ...(type && { type }),
        ...(metadata && { data: metadata }),
      };
      const allNodesClone = [...allNodes];
      allNodesClone[foundNodeIndex] = updatedFoundNode;
      return withHistory(s, { nodes: allNodesClone });
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
      return withHistory(s, { nodes: allNodesClone });
    });
  },

  addNewEmptyNode: () => {
    set((s) => {
      const newNodeId = uuidv4();
      return withHistory(
        s,
        addEmptyNodeToGraph({
          nodes: s.nodes,
          edges: s.edges,
          newNodeId,
          newTriggerNodeId: uuidv4(),
          newAddNodeId: uuidv4(),
        }),
      );
    });
  },

  addIntegrationStep: (integrationKey: string) => {
    set((s) => {
      const integration = getIntegrationByKey(integrationKey);
      if (!integration || integration.status !== "enabled") {
        toast.error("Integration is not available yet");
        return {};
      }

      const newNodeId = uuidv4();
      return withHistory(
        s,
        addIntegrationNodeToGraph({
          nodes: s.nodes,
          edges: s.edges,
          integrationNode: buildIntegrationNode({
            integrationKey,
            nodeId: newNodeId,
            position: { x: 0, y: 0 },
          }),
          newTriggerNodeId: uuidv4(),
          newAddNodeId: uuidv4(),
        }),
      );
    });
  },

  deleteNode: (nodeId: string) => {
    set((s) =>
      withHistory(
        s,
        deleteNodeFromGraph({ nodes: s.nodes, edges: s.edges, nodeId }),
      ),
    );
  },

  duplicateNode: (nodeId: string) => {
    set((s) =>
      withHistory(
        s,
        duplicateNodeInGraph({
          nodes: s.nodes,
          edges: s.edges,
          nodeId,
          newNodeId: uuidv4(),
        }),
      ),
    );
  },

  toggleNodeDisabled: (nodeId: string) => {
    set((s) =>
      withHistory(s, {
        nodes: toggleNodeDisabledInGraph({ nodes: s.nodes, nodeId }),
      }),
    );
  },
}));
