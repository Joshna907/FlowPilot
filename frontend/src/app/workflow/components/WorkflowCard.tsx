"use client";

import {
  Archive,
  ArrowRight,
  Clock,
  Copy,
  Edit3,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  Workflow,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ApiWorkflow } from "../types";
import { useRouter } from "next/navigation";
import { api } from "@/lib/utils";

export function WorkflowCard({
  workflow,
  onChanged,
  onDeleted,
}: {
  workflow: ApiWorkflow;
  onChanged?: (workflow: ApiWorkflow) => void;
  onDeleted?: (workflowId: string) => void;
}) {
  const router = useRouter();
  const isArchived = workflow.archivedAt !== null;
  const isPublished = workflow.publishedAt !== null;
  const timeSince = getTimeSince(workflow.updatedAt);

  const handleExplore = () => {
    router.push(`workflow/${workflow.id}`);
  };

  const archiveWorkflow = useMutation({
    mutationFn: async () => {
      const action = isArchived ? "unarchive" : "archive";
      return api.post(`/workflow/${action}/${workflow.id}`);
    },
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("Unable to update workflow");
        return;
      }
      onChanged?.(data.data.workflow);
      toast.success(isArchived ? "Workflow restored" : "Workflow archived");
    },
    onError: () => toast.error("Unable to update workflow"),
  });

  const deleteWorkflow = useMutation({
    mutationFn: async () => api.delete(`/workflow/${workflow.id}`),
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("Unable to delete workflow");
        return;
      }
      onDeleted?.(workflow.id);
      toast.success("Workflow deleted");
    },
    onError: () => toast.error("Unable to delete workflow"),
  });

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${workflow.name}" forever? This cannot be undone.`,
    );
    if (confirmed) {
      deleteWorkflow.mutate();
    }
  };

  const actionsDisabled = archiveWorkflow.isPending || deleteWorkflow.isPending;

  return (
    <div className="workflow-card group animate-scale-in">
      <div className="absolute right-4 top-4">
        <div className="flex gap-2">
          {isPublished && <Badge variant="secondary">Published</Badge>}
          <Badge
            variant={isArchived ? "secondary" : "default"}
            className={
              isArchived ? "workflow-status-archived" : "workflow-status-active"
            }
          >
            {isArchived ? "Archived" : "Active"}
          </Badge>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-3 pr-20">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--flow-canvas)] text-[var(--flow-primary)]">
            <Workflow className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground transition-colors group-hover:text-[var(--flow-primary)]">
              {workflow.name}
            </h3>
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated {timeSince}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {!isArchived ? (
            <Button
              size="sm"
              onClick={handleExplore}
              className="bg-primary/10 text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
            >
              Open
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">Archived</span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="workflow-action-btn"
                disabled={actionsDisabled}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => toast.info("Rename is coming soon")}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("Duplicate is coming soon")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={actionsDisabled}
                onClick={() => archiveWorkflow.mutate()}
              >
                {isArchived ? (
                  <RotateCcw className="mr-2 h-4 w-4" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                {isArchived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={actionsDisabled}
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete forever
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function getTimeSince(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }
  return "Less than an hour ago";
}
