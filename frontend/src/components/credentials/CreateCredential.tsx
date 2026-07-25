import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { CredentialType } from "@/lib/types/credential";
import { useCredentialsFormConfig } from "./forms/config";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/utils";
import { toast } from "sonner";

export function CreateCredentialDialog({
  credentialType,
  onCreated,
}: {
  credentialType: CredentialType;
  onCreated?: () => void;
}) {
  const credentialsFormConfig = useCredentialsFormConfig();
  const credentialConfig = credentialsFormConfig[credentialType];
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const createCredential = useMutation({
    mutationFn: () =>
      api.post("/credential/create", {
        credentialType,
        metadata,
      }),
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("Unable to save credential");
        return;
      }
      toast.success("Credential saved");
      setMetadata({});
      setOpen(false);
      onCreated?.();
    },
    onError: () => toast.error("Unable to save credential"),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missingField = credentialConfig.fields.find(
      (field) => !metadata[field.key]?.trim(),
    );
    if (missingField) {
      toast.error(`${missingField.label} is required`);
      return;
    }
    createCredential.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="xs"
          className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Credentials</DialogTitle>
          <DialogDescription>
            Please add your credentials below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-[var(--flow-border)] bg-[var(--flow-bg)] p-4">
            <div className="text-sm font-semibold">{credentialConfig.title}</div>
            <p className="mt-1 text-sm text-[var(--flow-muted)]">
              {credentialConfig.body}
            </p>
          </div>
          {credentialConfig.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type ?? "text"}
                value={metadata[field.key] ?? ""}
                onChange={(event) =>
                  setMetadata((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
              />
            </div>
          ))}
          <Button disabled={createCredential.isPending} type="submit">
            {createCredential.isPending ? "Saving" : "Save credential"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
