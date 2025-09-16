"use client";

import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  EdgeChange,
  Connection,
  NodeChange,
  Node,
  applyNodeChanges,
  addEdge,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "@/stores";
import { NodesPanel } from "./components/panel";
import { nodeTypes } from "@/stores/useWorkflowStore";
import { useCallback } from "react";

export default function App() {
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const setNodes = useWorkflow((state) => state.setNodes);
  const setEdges = useWorkflow((state) => state.setEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nds: Node[]) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
        <div className="flex justify-end">
          <NodesPanel />
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          fitView
        />
        <Controls />
        <Background />
      </div>
    </>
  );
}
