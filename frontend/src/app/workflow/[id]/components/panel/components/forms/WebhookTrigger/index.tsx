"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useConfigPanel, useWorkflow } from "@/stores";
import { Button } from "@/components/ui/button";
import { NodeType } from "@/stores/useWorkflowStore";
import { v4 as uuidv4 } from "uuid";
import useCopy from "@/hooks/useCopy";

const webhookTriggerFormSchema = z.object({
  endpointId: z.string(),
});

type WebhookTriggerFormSchema = z.infer<typeof webhookTriggerFormSchema>;

export function WebhookTriggerForm() {
  const selectedNodeMetadata = useWorkflow((state) => {
    return state.nodes.find((node) => {
      return node.id === state.selectedNodeId;
    })?.data;
  });

  const { data: parsedNodeMetadata, success } =
    webhookTriggerFormSchema.safeParse(selectedNodeMetadata);

  const defaultValues: Partial<WebhookTriggerFormSchema> = success
    ? parsedNodeMetadata
    : {
        endpointId: uuidv4(),
      };

  const form = useForm<WebhookTriggerFormSchema>({
    resolver: zodResolver(webhookTriggerFormSchema),
    defaultValues,
  });

  const endpoint = `${process.env.NEXT_PUBLIC_API_BASE}/webhook/${defaultValues.endpointId}`;
  const copy = useCopy(endpoint);

  const updateSelectedNode = useWorkflow((state) => state.updateSelectedNode);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);

  function onSubmit() {
    updateSelectedNode({
      metadata: form.getValues(),
      type: NodeType.WEBHOOK_TRIGGER,
    });
    closeConfigPanel();
  }

  return (
    <div className="px-4">
      <div
        onClick={copy}
        className="flex text-sm hover:underline hover:cursor-copy"
      >
        {endpoint}
      </div>
      <Button onClick={onSubmit} type="submit">
        Submit
      </Button>
    </div>
  );
}
