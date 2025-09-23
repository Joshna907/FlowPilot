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

export function CreateCredentialDialog({
  credentialType,
}: {
  credentialType: CredentialType;
}) {
  const credentialsFormConfig = useCredentialsFormConfig();
  return (
    <Dialog>
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
        {credentialsFormConfig[credentialType]}
      </DialogContent>
    </Dialog>
  );
}
