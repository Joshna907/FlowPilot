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
import { Textarea } from "@/components/ui/textarea";
import { useConfigPanel, useWorkflow } from "@/stores";
import { NodeType } from "@/stores/useWorkflowStore";
import { useGetUserGoogleAccounts } from "./hook";
import { GoogleIntegration } from "@/components/integrations";
import { useGetDefaultNodeLabel } from "@/hooks/useGetNewNodeLabel";

const sendEmailFormSchema = z.object({
  from: z.string(),
  to: z.email(),
  subject: z.string(),
  body: z.string(),
});

type SendEmailFormSchema = z.infer<typeof sendEmailFormSchema>;

export function SendEmailForm({ nodeType }: { nodeType: NodeType }) {
  const selectedNodeMetadata = useWorkflow((state) => {
    return state.nodes.find((node) => {
      return node.id === state.selectedNodeId;
    })?.data;
  });

  const { data: parsedNodeMetadata, success } =
    sendEmailFormSchema.safeParse(selectedNodeMetadata);

  const defaultValues: Partial<SendEmailFormSchema> = success
    ? parsedNodeMetadata
    : {
        from: undefined,
        to: "",
        subject: "",
        body: "",
      };

  const form = useForm<SendEmailFormSchema>({
    resolver: zodResolver(sendEmailFormSchema),
    defaultValues,
  });

  const data = useGetUserGoogleAccounts();
  const updateSelectedNode = useWorkflow((state) => state.updateSelectedNode);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);
  const getDefaultLabel = useGetDefaultNodeLabel(nodeType);

  function onSubmit(values: SendEmailFormSchema) {
    updateSelectedNode({
      metadata: { ...values, label: getDefaultLabel() },
      type: nodeType,
    });
    closeConfigPanel();
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="panel-form">
        <FormField
          control={form.control}
          name="from"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between items-end">
                From
                <GoogleIntegration />
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a verified email to send email from" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {data?.map((account) => {
                      return (
                        <SelectItem key={account.id} value={account.id}>
                          {account.id}
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
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <Textarea placeholder="" className="resize-none" {...field} />
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
