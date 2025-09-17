"use client";

import {
  MoreHorizontal,
  Play,
  Copy,
  Archive,
  Edit3,
  Clock,
} from "lucide-react";
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

export function WorkflowCard({ workflow }: { workflow: ApiWorkflow }) {
  const router = useRouter();
  const isArchived = workflow.archivedAt !== null;
  const timeSince = getTimeSince(workflow.updatedAt);

  const handleEdit = () => {
    console.log("Edit workflow:", workflow.id);
  };

  const handleDuplicate = () => {
    console.log("Duplicate workflow:", workflow.id);
  };

  const handleArchive = () => {
    console.log("Archive workflow:", workflow.id);
  };

  const handleExplore = () => {
    router.push(`workflow/${workflow.id}`);
  };

  return (
    <div className="workflow-card group animate-scale-in">
      <div className="absolute top-4 right-4">
        <Badge
          variant={isArchived ? "secondary" : "default"}
          className={
            isArchived ? "workflow-status-archived" : "workflow-status-active"
          }
        >
          {isArchived ? "Archived" : "Active"}
        </Badge>
      </div>

      {/* Workflow content */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-card-foreground group-hover:gradient-text transition-all duration-300">
            {workflow.name}
          </h3>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Updated {timeSince}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className={`flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            {!isArchived && (
              <Button
                size="sm"
                onClick={handleExplore}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <Play className="h-4 w-4 mr-1" />
                Explore
              </Button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="workflow-action-btn">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleArchive}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="mr-2 h-4 w-4" />
                {isArchived ? "Unarchive" : "Archive"}
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
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else {
    return "Less than an hour ago";
  }
}
