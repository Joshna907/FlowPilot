import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./components/CustomNode";
import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/stores";
import { NodeType, WORKFLOW_GAP_X } from "@/stores/useWorkflowStore";
import _ from "lodash";

export function AddNode(node: NodeProps<Node<{ label: string }>>) {
  const setNodes = useWorkflow((state) => state.setNodes);
  const setEdges = useWorkflow((state) => state.setEdges);

  function handleAddEmptyNode() {
    const currentNodeId = node.id;
    const newNodeId = `n${Math.random().toString(36).slice(2, 10)}`;

    setNodes((prev) => {
      const nextNodes = _.cloneDeep(prev);
      const addIndex = nextNodes.findIndex((n) => n.id === currentNodeId);
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

      // keep Add node at a fixed gap from the newly inserted node
      const addNode = nextNodes[insertIndex + 1];
      if (addNode) {
        addNode.position = {
          x: inferredX + WORKFLOW_GAP_X,
          y: inferredY,
        };
      }
      return nextNodes;
    });

    setEdges((prev) => {
      const nextEdges = _.cloneDeep(prev);
      const edgeToAdd = nextEdges.find((e) => e.target === currentNodeId);
      // edged without old connections
      const updatedEdges = edgeToAdd
        ? nextEdges.filter((e) => e.id !== edgeToAdd.id)
        : nextEdges;

      const prevSourceId = edgeToAdd?.source;
      if (prevSourceId) {
        updatedEdges.push({
          id: `${prevSourceId}-${newNodeId}`,
          source: prevSourceId,
          target: newNodeId,
          type: "step",
        });
      }
      updatedEdges.push({
        id: `${newNodeId}-${currentNodeId}`,
        source: newNodeId,
        target: currentNodeId,
        type: "step",
      });
      return updatedEdges;
    });
  }
  return (
    <CustomNode className="size-6" nodeId={node.id}>
      <Button
        size="icon-xs"
        className="text-xs"
        onClick={handleAddEmptyNode}
        variant="ghost"
      >
        +
      </Button>
    </CustomNode>
  );
}
