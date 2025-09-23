import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCredentialsInput } from "./config";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CredentialType } from "@/lib/types/credential";

const formSchema = z.object({
  GMAIL_USER: z.email(),
  GMAIL_APP_PASSWORD: z.string(),
});

export function GmailCredentialsForm({
  onSubmit,
}: {
  onSubmit: (input: CreateCredentialsInput) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      GMAIL_USER: "",
      GMAIL_APP_PASSWORD: "",
    },
  });

  function handleSubmit() {
    onSubmit({
      credentialType: CredentialType.GMAIL,
      metadata: form.getValues(),
    });
  }
  return (
    <>
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="GMAIL_USER"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="GMAIL_APP_PASSWORD"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gmail App Password</FormLabel>
                <FormControl>
                  <Input placeholder="app password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleSubmit} type="submit">
          Create
        </Button>
      </DialogFooter>
    </>
  );
}
