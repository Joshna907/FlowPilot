import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NodeType } from "@/stores/useWorkflowStore";
import z from "zod";
import { useConfigPanel, useWorkflow } from "@/stores";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";

const httpRequestFormSchema = z.object({
  endpoint: z.string(),
  body: z.string(),
});

type HttpRequestFormSchema = z.infer<typeof httpRequestFormSchema>;

export function HttpRequestForm() {
  const selectedNodeMetadata = useWorkflow((state) => {
    return state.nodes.find((node) => {
      return node.id === state.selectedNodeId;
    })?.data;
  });

  const { data } = httpRequestFormSchema.safeParse(selectedNodeMetadata);

  const form = useForm<HttpRequestFormSchema>({
    resolver: zodResolver(httpRequestFormSchema),
    defaultValues: {
      endpoint: data?.endpoint ?? "",
      body: data?.body ?? "",
    },
  });

  const updateSelectedNode = useWorkflow((state) => state.updateSelectedNode);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);

  function onSubmit(values: HttpRequestFormSchema) {
    updateSelectedNode({ metadata: values, type: NodeType.HTTP_REQUEST });
    closeConfigPanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="endpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endpoint</FormLabel>
              <FormControl>
                <Input {...field} />
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
