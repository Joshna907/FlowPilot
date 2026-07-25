import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./CustomNode";
import { Button } from "@/components/ui/button";
import { Globe, MessageCircle } from "lucide-react";

export function HttpRequestNode(
  node: NodeProps<
    Node<{
      label: string;
      integrationKey?: string;
      appName?: string;
      accent?: string;
    }>
  >,
) {
  const isMessagingApp = ["slack", "discord", "whatsapp"].includes(
    node.data.integrationKey ?? "",
  );

  return (
    <CustomNode nodeId={node.id}>
      <Button
        className="flow-node-icon"
        variant="ghost"
        size="icon"
        style={{
          color: node.data.accent,
        }}
        title={node.data.appName ?? "HTTP request"}
      >
        {isMessagingApp ? <MessageCircle /> : <Globe />}
      </Button>
    </CustomNode>
  );
}
