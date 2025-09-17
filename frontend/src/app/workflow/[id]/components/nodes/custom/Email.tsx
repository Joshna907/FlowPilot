import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./components/CustomNode";

export function EmailNode(node: NodeProps<Node<{ label: string }>>) {
  return <CustomNode nodeId={node.id}>Send Email</CustomNode>;
}
