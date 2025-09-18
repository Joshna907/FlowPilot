"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { ApiCredential, CredentialType } from "@/lib/types/credential";

const formSchema = z.object({
  from: z.string(),
  to: z.email(),
  subject: z.string(),
  body: z.string(),
});

export function SendEmailForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: undefined,
      to: "",
      subject: "",
      body: "",
    },
  });

  const { data }: UseQueryResult<ApiCredential[], Error> = useQuery({
    queryKey: ["user-email-credentials"],
    queryFn: async () => {
      const { data } = await api.post("/credential/list", {
        filter: {
          credentialType: CredentialType.GMAIL,
        },
      });
      if (!data.success) {
        toast.error("error loading credentials");
        return [];
      }
      return data.data.credentials;
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="panel-form">
        <FormField
          control={form.control}
          name="from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {data?.map((credential) => {
                      return (
                        <SelectItem key={credential.id} value={credential.id}>
                          {credential.id}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To</FormLabel>
              <FormControl>
                <Input placeholder="john@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
