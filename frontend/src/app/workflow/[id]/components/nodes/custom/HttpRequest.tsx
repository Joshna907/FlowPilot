import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./CustomNode";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function HttpRequestNode(node: NodeProps<Node<{ label: string }>>) {
  return (
    <CustomNode nodeId={node.id}>
      <Button>
        <Globe />
      </Button>
    </CustomNode>
  );
}
