import { type NodeProps, type Node } from "@xyflow/react";
import { CustomNode } from "./components/CustomNode";
import { useMutation } from "@tanstack/react-query";
import { useWorkflow } from "@/stores";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MousePointerClick } from "lucide-react";
import { api } from "@/lib/utils";

export function ManualTriggerNode(node: NodeProps<Node<{ label: string }>>) {
  const workflowId = useWorkflow((state) => state.workflow.id);

  const executeWorkflow = useMutation({
    mutationFn: () => {
      return api.post(`execution/execute/${workflowId}`);
    },
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error(data.error);
      }
      toast.success(data.data);
    },
  });

  function handleExecuteWorkflow() {
    console.log("execute");
    executeWorkflow.mutate();
  }

  return (
    <CustomNode onClick={handleExecuteWorkflow} nodeId={node.id}>
      <Button>
        <MousePointerClick />
      </Button>
    </CustomNode>
  );
}
