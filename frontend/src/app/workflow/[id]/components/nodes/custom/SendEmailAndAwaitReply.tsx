import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./components/CustomNode";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";

export function SendEmailAndAwaitReplyNode(
  node: NodeProps<Node<{ label: string }>>,
) {
  return (
    <CustomNode nodeId={node.id}>
      <Button>
        <MailCheck />
      </Button>
    </CustomNode>
  );
}
