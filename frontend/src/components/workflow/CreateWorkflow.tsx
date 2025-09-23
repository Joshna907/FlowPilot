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
import { api } from "@/lib/utils";

export function CreateWorkflowDialog() {
  const router = useRouter();
  const [name, setName] = useState("");

  const createWorkflow = useMutation({
    mutationFn: (input: { name: string }) => {
      return api.post("/workflow/create", input);
    },
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("error creating");
      }
      toast.success("workflow created successfully");
      const workflowId = data.data.workflow.id;
      router.push(`/workflow/${workflowId}`);
    },
  });

  function handleSubmit() {
    createWorkflow.mutate({ name });
  }

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
            <DialogDescription>Create a new Workflow</DialogDescription>
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
            <Button onClick={handleSubmit} type="submit">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
