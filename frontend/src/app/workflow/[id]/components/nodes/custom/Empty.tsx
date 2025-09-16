import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./components/CustomNode";
import { Button } from "@/components/ui/button";

export function EmptyNode(node: NodeProps<Node<{ label: string }>>) {
  return (
    <CustomNode nodeId={node.id}>
      <Button variant="ghost">Select Node Type</Button>
    </CustomNode>
  );
}
