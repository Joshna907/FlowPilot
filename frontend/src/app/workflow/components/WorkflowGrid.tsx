"use client";

import { useState } from "react";
import { Search, Filter, Grid, List, Zap } from "lucide-react";
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
import { CreateWorkflowDialog } from "@/components/workflow/dialog/Create";
import { ApiWorkflow } from "../types";

export function WorkflowGrid({ workflows }: { workflows: ApiWorkflow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredWorkflows = workflows.filter((workflow) => {
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
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Workflows</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and automate your processes with beautiful workflows
        </p>
      </div>

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

          <CreateWorkflowDialog />
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
              <WorkflowCard workflow={workflow} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
            <Zap className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No workflows found</h3>
            <p className="text-muted-foreground max-w-sm">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first workflow automation."}
            </p>
          </div>
          {!searchTerm && filterStatus === "all" && <CreateWorkflowDialog />}
        </div>
      )}
    </div>
  );
}
