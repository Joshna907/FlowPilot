"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/utils";
import { useWorkflow } from "@/stores";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getRunStatusCopy, RunStatus } from "./runStatus";
import {
  assertWorkflowEditorReady,
  buildWorkflowSavePayload,
} from "./runWorkflowPayload";
import { validateWorkflowGraph } from "@/lib/workflowGraph";

const WORKFLOW_NOT_READY_MESSAGE =
  "This workflow is not ready to run. Save or refresh and try again.";

function getRunErrorMessage(error: unknown) {
  const response = (
    error as { response?: { status?: number; data?: { error?: string } } }
  ).response;

  if (response?.status === 422) {
    return WORKFLOW_NOT_READY_MESSAGE;
  }

  return (
    response?.data?.error ??
    (error instanceof Error ? error.message : "Unable to start workflow")
  );
}

export function RunWorkflowButton({
  workflowId,
  status,
  onStatusChange,
  compact = false,
  onQueued,
}: {
  workflowId: string;
  status: RunStatus;
  onStatusChange: (status: RunStatus) => void;
  compact?: boolean;
  onQueued?: (execution: { id: string; status: string; createdAt: string }) => void;
}) {
  const activeWorkflowId = useWorkflow((state) => state.workflow.id);
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);

  const runWorkflow = useMutation({
    mutationFn: async () => {
      assertWorkflowEditorReady({
        expectedWorkflowId: workflowId,
        activeWorkflowId,
        nodes,
      });
      const issues = validateWorkflowGraph({ nodes, edges });
      if (issues.length > 0) {
        throw new Error(issues[0]?.message ?? "Workflow is not ready");
      }
      const saveResponse = await api.put(
        `/workflow/update/${workflowId}`,
        buildWorkflowSavePayload(nodes, edges),
      );
      if (!saveResponse.data.success) {
        throw new Error(saveResponse.data.error ?? "Unable to save workflow");
      }
      const savedNodes = saveResponse.data.data?.nodes?.length ?? 0;
      if (savedNodes === 0) {
        throw new Error("Refresh and rebuild this workflow before running.");
      }
      return api.post(`/execution/execute/${workflowId}`);
    },
    onMutate: () => onStatusChange("queueing"),
    onSuccess: ({ data }) => {
      if (!data.success) {
        onStatusChange("failed");
        toast.error(data.error ?? "Unable to start workflow");
        return;
      }
      onStatusChange("queued");
      if (data.data?.execution) {
        onQueued?.(data.data.execution);
      }
      toast.success("Run started");
    },
    onError: (error) => {
      onStatusChange("failed");
      toast.error(getRunErrorMessage(error));
    },
  });

  const copy = getRunStatusCopy(status);

  return (
    <div
      className={
        compact
          ? ""
          : "rounded-lg border border-[var(--flow-border)] bg-[var(--flow-bg)] p-3"
      }
    >
      {!compact && (
      <div className="mb-3">
        <div className="text-sm font-semibold">{copy.title}</div>
        <p className="mt-1 text-xs leading-5 text-[var(--flow-muted)]">
          {copy.body}
        </p>
      </div>
      )}
      <Button
        className={compact ? "hidden md:inline-flex" : "w-full"}
        disabled={
          runWorkflow.isPending || !workflowId || activeWorkflowId !== workflowId
        }
        onClick={() => runWorkflow.mutate()}
        variant={status === "failed" ? "outline" : "default"}
      >
        {runWorkflow.isPending ? (
          <Loader2 className="animate-spin" />
        ) : status === "failed" ? (
          <RotateCcw />
        ) : (
          <Play />
        )}
        {runWorkflow.isPending
          ? "Starting"
          : status === "failed"
            ? "Try again"
            : "Run workflow"}
      </Button>
    </div>
  );
}
