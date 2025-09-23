import { CredentialType } from "@/lib/types/credential";
import { GmailCredentialsForm } from "./Gmail";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/utils";
import { toast } from "sonner";

export type CreateCredentialsInput = {
  credentialType: CredentialType;
  metadata: Record<string, unknown>;
};

export function useCredentialsFormConfig() {
  const createCredentials = useMutation({
    mutationFn: (input: CreateCredentialsInput) => {
      return api.post("/credential/create", input);
    },
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("error creating credentials");
      }
      toast.success("credentials created successfully");
    },
  });

  function handleSubmit(input: CreateCredentialsInput) {
    createCredentials.mutate(input);
  }
  return {
    [CredentialType.GMAIL]: <GmailCredentialsForm onSubmit={handleSubmit} />,
  };
}
