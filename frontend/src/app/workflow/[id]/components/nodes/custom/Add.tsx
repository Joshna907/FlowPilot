import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./components/CustomNode";
import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/stores";

export function AddNode(node: NodeProps<Node<{ label: string }>>) {
  const addNewEmptyNode = useWorkflow((state) => state.addNewEmptyNode);
  return (
    <CustomNode preventDefault className="size-6" nodeId={node.id}>
      <Button
        size="icon-xs"
        className="text-xs"
        onClick={addNewEmptyNode}
        variant="ghost"
      >
        +
      </Button>
    </CustomNode>
  );
}
