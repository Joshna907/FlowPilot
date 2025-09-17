import { ApiEdgeInput, ApiNodeInput } from "@/app/workflow/types";
import { Button } from "@/components/ui/button";
import { api, convertStateToApiEdge, convertStateToApiNode } from "@/lib/utils";
import { useWorkflow } from "@/stores";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function UpdateWorkflowButton() {
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const workflow = useWorkflow((state) => state.workflow);

  const updateWorkflow = useMutation({
    mutationFn: (input: { nodes: ApiNodeInput[]; edges: ApiEdgeInput[] }) => {
      return api.put(`/workflow/update/${workflow.id}`, input);
    },
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("error updating workflow");
      }
      toast.success("workflow updated successfully");
    },
  });

  function handleSave() {
    // check if any changes have happened
    const nodesApiInput = nodes.map(convertStateToApiNode);
    const edgesApiInput = edges.map(convertStateToApiEdge);

    updateWorkflow.mutate({ nodes: nodesApiInput, edges: edgesApiInput });
  }
  return <Button onClick={handleSave}>Save</Button>;
}
