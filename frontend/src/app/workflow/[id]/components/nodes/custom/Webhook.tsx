import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./components/CustomNode";

export function WebhookNode(node: NodeProps<Node<{ label: string }>>) {
  return <CustomNode nodeId={node.id}>Webhook Trigger</CustomNode>;
}
