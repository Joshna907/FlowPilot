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
import { edgeTypes, nodeTypes } from "@/stores/useWorkflowStore";
import { useCallback, useEffect } from "react";
import _ from "lodash";
import { convertApiEdgeToState, convertApiNodeToState } from "@/lib/utils";
import { UpdateWorkflowButton } from "./components/buttons/UpdateWorkflow";
import { ApiWorkflow } from "../types";
import { NodesPanel } from "./components/nodes/panel";
import { EdgesPanel } from "./components/edges/panel";

export default function Playground({ workflow }: { workflow: ApiWorkflow }) {
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const setNodes = useWorkflow((state) => state.setNodes);
  const setEdges = useWorkflow((state) => state.setEdges);
  const setWorkflow = useWorkflow((state) => state.setWorkflow);

  console.log({ nodes, edges, workflow });

  useEffect(() => {
    const apiNodes = workflow.nodes;
    if (!_.isEmpty(apiNodes)) {
      const convertedNodes = apiNodes.map(convertApiNodeToState);
      setNodes(convertedNodes);
    }
    const apiEdges = workflow.edges;
    if (!_.isEmpty(apiEdges)) {
      const convertedEdges = apiEdges.map(convertApiEdgeToState);
      setEdges(convertedEdges);
    }

    setWorkflow({
      id: workflow.id,
      name: workflow.name,
    });
  }, [workflow, setEdges, setNodes, setWorkflow]);

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
          <UpdateWorkflowButton />
        </div>
        <div className="flex justify-end">
          <NodesPanel />
          <EdgesPanel />
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onConnect={onConnect}
          fitView
        />
        <Controls />
        <Background />
      </div>
    </>
  );
}
