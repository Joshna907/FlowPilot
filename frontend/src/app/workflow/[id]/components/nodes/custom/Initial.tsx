import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./CustomNode";
import { Button } from "@/components/ui/button";

export function InitialNode(node: NodeProps<Node<{ label: string }>>) {
  return (
    <CustomNode nodeId={node.id}>
      <Button size="sm" variant="ghost">
        Select A Trigger
      </Button>
    </CustomNode>
  );
}
