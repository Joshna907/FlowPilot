import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./components/CustomNode";

export function ManualTriggerNode(node: NodeProps<Node<{ label: string }>>) {
  console.log({ node });
  return <CustomNode nodeId={node.id}>{node.data.label}</CustomNode>;
}
