import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./CustomNode";
import { Button } from "@/components/ui/button";
import { Funnel, Timer } from "lucide-react";
import { NodeType } from "@/stores/useWorkflowStore";

export function FlowControlNode(
  node: NodeProps<
    Node<{
      appName?: string;
      accent?: string;
    }>
  >,
) {
  const isFilter = node.type === NodeType.FILTER;
  return (
    <CustomNode nodeId={node.id}>
      <Button
        className="flow-node-icon"
        variant="ghost"
        size="icon"
        style={{ color: node.data.accent }}
        title={node.data.appName ?? (isFilter ? "Filter" : "Delay")}
      >
        {isFilter ? <Funnel /> : <Timer />}
      </Button>
    </CustomNode>
  );
}
