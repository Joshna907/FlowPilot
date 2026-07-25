import { ApiEdgeInput, ApiNodeInput } from "@/app/workflow/types";
import { Button } from "@/components/ui/button";
import { api, convertStateToApiEdge, convertStateToApiNode } from "@/lib/utils";
import { useWorkflow } from "@/stores";
import { useMutation } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { assertWorkflowEditorReady } from "../run/runWorkflowPayload";

const WORKFLOW_NOT_READY_MESSAGE =
  "This workflow is not ready to save. Refresh and try again.";

function getSaveErrorMessage(error: unknown) {
  const response = (
    error as { response?: { status?: number; data?: { error?: string } } }
  ).response;

  if (response?.status === 422) {
    return WORKFLOW_NOT_READY_MESSAGE;
  }

  return (
    response?.data?.error ??
    (error instanceof Error ? error.message : "Error updating workflow")
  );
}

export function UpdateWorkflowButton({
  className,
  workflowId,
}: {
  className?: string;
  workflowId: string;
}) {
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const activeWorkflowId = useWorkflow((state) => state.workflow.id);

  const updateWorkflow = useMutation({
    mutationFn: (input: { nodes: ApiNodeInput[]; edges: ApiEdgeInput[] }) => {
      return api.put(`/workflow/update/${workflowId}`, input);
    },
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("Error updating workflow");
        return;
      }
      const savedNodes = data.data?.nodes?.length ?? 0;
      const savedEdges = data.data?.edges?.length ?? 0;
      if (savedNodes === 0) {
        toast.error("Save wrote 0 steps. Refresh and rebuild this workflow.");
        return;
      }
      toast.success(`Workflow saved (${savedNodes} steps, ${savedEdges} links)`);
    },
    onError: (error) => {
      toast.error(getSaveErrorMessage(error));
    },
  });

  function handleSave() {
    try {
      assertWorkflowEditorReady({
        expectedWorkflowId: workflowId,
        activeWorkflowId,
        nodes,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Editor is not ready");
      return;
    }
    const nodesApiInput = nodes.map(convertStateToApiNode);
    const edgesApiInput = edges.map(convertStateToApiEdge);
    updateWorkflow.mutate({ nodes: nodesApiInput, edges: edgesApiInput });
  }

  return (
    <Button
      className={className}
      disabled={
        updateWorkflow.isPending || !workflowId || activeWorkflowId !== workflowId
      }
      onClick={handleSave}
    >
      <Save />
      {updateWorkflow.isPending ? "Saving" : "Save"}
    </Button>
  );
}
