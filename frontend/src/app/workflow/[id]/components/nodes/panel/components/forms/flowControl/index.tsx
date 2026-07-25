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

const flowControlSchema = z.object({
  durationMs: z.coerce.number().optional(),
  left: z.string().optional(),
  operator: z.string().optional(),
  right: z.string().optional(),
});

type FlowControlInput = z.input<typeof flowControlSchema>;
type FlowControlOutput = z.output<typeof flowControlSchema>;

export function FlowControlForm({ nodeType }: { nodeType: NodeType }) {
  const selectedNodeMetadata = useWorkflow((state) => {
    return state.nodes.find((node) => {
      return node.id === state.selectedNodeId;
    })?.data;
  });
  const updateSelectedNode = useWorkflow((state) => state.updateSelectedNode);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);
  const { data } = flowControlSchema.safeParse(selectedNodeMetadata);

  const form = useForm<FlowControlInput, unknown, FlowControlOutput>({
    resolver: zodResolver(flowControlSchema),
    defaultValues: {
      durationMs: data?.durationMs ?? 1000,
      left: data?.left ?? "",
      operator: data?.operator ?? "equals",
      right: data?.right ?? "",
    },
  });

  function onSubmit(values: FlowControlOutput) {
    updateSelectedNode({
      type: nodeType,
      metadata: {
        ...selectedNodeMetadata,
        ...values,
        label: nodeType === NodeType.FILTER ? "Filter" : "Delay",
        appName: nodeType === NodeType.FILTER ? "Filter" : "Delay",
        integrationKey: nodeType === NodeType.FILTER ? "filter" : "delay",
        needsConfig: false,
        missingFields: [],
      },
    });
    closeConfigPanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {nodeType === NodeType.DELAY ? (
          <TextInputField
            control={form.control}
            name="durationMs"
            label="Duration in ms"
          />
        ) : (
          <>
            <TextInputField control={form.control} name="left" label="Left" />
            <TextInputField
              control={form.control}
              name="operator"
              label="Operator"
            />
            <TextInputField control={form.control} name="right" label="Right" />
          </>
        )}
        <Button type="submit">Save config</Button>
      </form>
    </Form>
  );
}

function TextInputField({
  control,
  name,
  label,
}: {
  control: ReturnType<
    typeof useForm<FlowControlInput, unknown, FlowControlOutput>
  >["control"];
  name: keyof FlowControlInput;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value == null ? "" : String(field.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
