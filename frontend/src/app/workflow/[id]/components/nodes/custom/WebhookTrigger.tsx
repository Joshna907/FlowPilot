import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./components/CustomNode";
import { Button } from "@/components/ui/button";
import { Webhook } from "lucide-react";

export function WebhookTriggerNode(node: NodeProps<Node<{ label: string }>>) {
  return (
    <CustomNode nodeId={node.id}>
      <Button>
        <Webhook />
      </Button>
    </CustomNode>
  );
}
