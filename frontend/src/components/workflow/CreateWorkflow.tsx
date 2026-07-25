"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { api, cn } from "@/lib/utils";

export function CreateWorkflowDialog({
  buttonLabel = "New Workflow",
  buttonVariant = "default",
  startWithVoice = false,
}: {
  buttonLabel?: string;
  buttonVariant?: "default" | "outline";
  startWithVoice?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");

  const createWorkflow = useMutation({
    mutationFn: (input: { name: string }) => {
      return api.post("/workflow/create", input);
    },
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("Could not create workflow");
        return;
      }
      toast.success("Workflow created");
      const workflowId = data.data.workflow.id;
      router.push(`/workflow/${workflowId}${startWithVoice ? "?voice=1" : ""}`);
    },
    onError: () => {
      toast.error("Could not create workflow. Check that the app is running.");
    },
  });

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Add a workflow name");
      return;
    }
    createWorkflow.mutate({ name });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant={buttonVariant}
          className={cn(
            "shadow-lg transition-all duration-200 hover:shadow-xl",
            buttonVariant === "default" &&
              "bg-primary hover:bg-primary/90",
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Create workflow</DialogTitle>
            <DialogDescription>
              Name it now. You can build it from voice in the editor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input
                onChange={(e) => {
                  setName(e.target.value);
                }}
                id="name"
                name="name"
                value={name}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={createWorkflow.isPending}
              type="submit"
            >
              {createWorkflow.isPending ? "Creating" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
