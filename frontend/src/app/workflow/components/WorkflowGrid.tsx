"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AudioLines,
  Filter,
  Grid,
  List,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WorkflowCard } from "./WorkflowCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiWorkflow } from "../types";
import { CreateWorkflowDialog } from "@/components/workflow/CreateWorkflow";
import {
  buildTemplateCreatePayload,
  workflowTemplates,
  type WorkflowTemplate,
} from "@/lib/workflowTemplates";
import { api } from "@/lib/utils";
import { removeWorkflowById, replaceWorkflowById } from "./workflowListState";

export function WorkflowGrid({ workflows }: { workflows: ApiWorkflow[] }) {
  const router = useRouter();
  const [workflowItems, setWorkflowItems] = useState(workflows);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setWorkflowItems(workflows);
  }, [workflows]);

  const filteredWorkflows = workflowItems.filter((workflow) => {
    const matchesSearch = workflow.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && !workflow.archivedAt) ||
      (filterStatus === "archived" && workflow.archivedAt);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--flow-border)] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(29,87,247,0.12)] px-3 py-1 text-sm font-medium text-[var(--flow-primary)]">
              <AudioLines className="size-4" />
              Voice-first automation
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">
                Workflow cockpit
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--flow-muted)]">
                Build, inspect, and run automations. Start from a blank canvas
                or create a workflow first, then let Voice Builder draft the
                steps.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <CreateWorkflowDialog buttonLabel="Create with voice" startWithVoice />
            <CreateWorkflowDialog
              buttonLabel="New workflow"
              buttonVariant="outline"
            />
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-[var(--flow-border)] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Start from a template</h2>
            <p className="mt-1 text-sm text-[var(--flow-muted)]">
              Interview-ready flows with real config checkpoints.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workflowTemplates.map((template) => (
            <TemplateCard
              key={template.key}
              template={template}
              onCreated={(workflowId) => router.push(`/workflow/${workflowId}`)}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center space-x-4 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50 border-border/50"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 bg-background/50 border-border/50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border bg-background/50 p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredWorkflows.length} workflow
        {filteredWorkflows.length !== 1 ? "s" : ""} found
      </div>

      {/* Workflow grid */}
      {filteredWorkflows.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredWorkflows.map((workflow, index) => (
            <div
              key={workflow.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <WorkflowCard
                workflow={workflow}
                onChanged={(updatedWorkflow) =>
                  setWorkflowItems((items) =>
                    replaceWorkflowById(items, updatedWorkflow),
                  )
                }
                onDeleted={(workflowId) =>
                  setWorkflowItems((items) =>
                    removeWorkflowById(items, workflowId),
                  )
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--flow-border)] bg-white py-14 space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--flow-canvas)]">
            <Workflow className="h-10 w-10 text-[var(--flow-primary)]" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No workflows yet</h3>
            <p className="text-muted-foreground max-w-sm">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Create one, open the editor, and ask Voice Builder to draft the first automation."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-[var(--flow-muted)]">
            {["Send a follow-up email", "Call my CRM webhook", "Wait for a reply"].map(
              (prompt) => (
                <span
                  key={prompt}
                  className="rounded-full border border-[var(--flow-border)] px-3 py-1"
                >
                  <Sparkles className="mr-1 inline size-3" />
                  {prompt}
                </span>
              ),
            )}
          </div>
          {!searchTerm && filterStatus === "all" && (
            <CreateWorkflowDialog buttonLabel="Create with voice" startWithVoice />
          )}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onCreated,
}: {
  template: WorkflowTemplate;
  onCreated: (workflowId: string) => void;
}) {
  const createWorkflow = useMutation({
    mutationFn: () => api.post("/workflow/create", buildTemplateCreatePayload(template)),
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("Unable to create template");
        return;
      }
      toast.success("Template created");
      onCreated(data.data.workflow.id);
    },
    onError: () => toast.error("Unable to create template"),
  });

  return (
    <button
      className="rounded-lg border border-[var(--flow-border)] bg-[var(--flow-bg)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--flow-primary)] hover:bg-white hover:shadow-sm"
      disabled={createWorkflow.isPending}
      onClick={() => createWorkflow.mutate()}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4 text-[var(--flow-primary)]" />
        {template.name}
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--flow-muted)]">
        {template.description}
      </p>
      <div className="mt-3 rounded-md bg-white px-2 py-1 text-xs text-[var(--flow-muted)]">
        {template.prompt}
      </div>
    </button>
  );
}
