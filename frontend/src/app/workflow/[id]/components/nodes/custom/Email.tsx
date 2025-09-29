import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./CustomNode";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function EmailNode(node: NodeProps<Node<{ label: string }>>) {
  return (
    <CustomNode nodeId={node.id}>
      <Button>
        <Mail />
      </Button>
    </CustomNode>
  );
}
