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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NodeType } from "@/stores/useWorkflowStore";
import z from "zod";
import { useConfigPanel, useWorkflow } from "@/stores";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextAreaWithMention } from "@/components/TextAreaWithMentions";
import { api } from "@/lib/utils";
import { buildHttpRequestMetadata } from "./metadata";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import {
  type ApiCredential,
  CredentialType,
} from "@/lib/types/credential";
import { CreateCredentialDialog } from "@/components/credentials/CreateCredential";

const httpRequestFormSchema = z.object({
  endpoint: z.string().optional(),
  webhookUrl: z.string().optional(),
  accessToken: z.string().optional(),
  phoneNumberId: z.string().optional(),
  to: z.string().optional(),
  message: z.string().optional(),
  body: z.string().optional(),
  method: z.string().optional(),
});

type HttpRequestFormSchema = z.infer<typeof httpRequestFormSchema>;

const credentialTypeByIntegration: Record<string, CredentialType | undefined> = {
  slack: CredentialType.SLACK_WEBHOOK,
  discord: CredentialType.DISCORD_WEBHOOK,
  whatsapp: CredentialType.WHATSAPP_CLOUD,
};

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
      webhookUrl: data?.webhookUrl ?? "",
      accessToken: data?.accessToken ?? "",
      phoneNumberId: data?.phoneNumberId ?? "",
      to: data?.to ?? "",
      message: data?.message ?? "",
      body: data?.body ?? "",
      method: data?.method ?? "POST",
    },
  });

  const updateSelectedNode = useWorkflow((state) => state.updateSelectedNode);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);

  const testStep = useMutation({
    mutationFn: async (values: HttpRequestFormSchema) => {
      const metadata = buildHttpRequestMetadata(selectedNodeMetadata, values);
      updateSelectedNode({
        metadata,
        type: NodeType.HTTP_REQUEST,
      });
      const { data } = await api.post("/execution/test-step", {
        nodeType: NodeType.HTTP_REQUEST,
        metadata,
      });
      if (!data.success) {
        throw new Error(data.error ?? "Step test failed");
      }
      return data.data.result as { status: number; ok: boolean };
    },
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(`Step test passed (${result.status})`);
      } else {
        toast.error(`Step returned ${result.status}`);
      }
    },
    onError: (error) => {
      const responseError = (
        error as { response?: { data?: { error?: string } } }
      ).response?.data?.error;
      toast.error(
        responseError ??
          (error instanceof Error ? error.message : "Step test failed"),
      );
    },
  });

  function onSubmit(values: HttpRequestFormSchema) {
    updateSelectedNode({
      metadata: buildHttpRequestMetadata(selectedNodeMetadata, values),
      type: NodeType.HTTP_REQUEST,
    });
    closeConfigPanel();
  }

  function handleTextAreaValueChange(value: string) {
    form.setValue("body", value);
  }

  const integrationKey =
    typeof selectedNodeMetadata?.integrationKey === "string"
      ? selectedNodeMetadata.integrationKey
      : "http";
  const credentialType = credentialTypeByIntegration[integrationKey];
  const credentials = useQuery({
    queryKey: ["credentials", credentialType],
    enabled: Boolean(credentialType),
    queryFn: async () => {
      const { data } = await api.post("/credential/list", {
        filter: { credentialType: credentialType as CredentialType },
      });
      return data.data.credentials as ApiCredential[];
    },
  });

  function handleCredentialSelect(credentialId: string) {
    const credential = credentials.data?.find((item) => item.id === credentialId);
    if (!credential) return;
    if (
      credential.credentialType === CredentialType.SLACK_WEBHOOK ||
      credential.credentialType === CredentialType.DISCORD_WEBHOOK
    ) {
      form.setValue("webhookUrl", String(credential.metadata.webhookUrl ?? ""));
    }
    if (credential.credentialType === CredentialType.WHATSAPP_CLOUD) {
      form.setValue("accessToken", String(credential.metadata.accessToken ?? ""));
      form.setValue(
        "phoneNumberId",
        String(credential.metadata.phoneNumberId ?? ""),
      );
    }
  }

  const isWebhookApp = integrationKey === "slack" || integrationKey === "discord";
  const isWhatsApp = integrationKey === "whatsapp";
  const title =
    typeof selectedNodeMetadata?.appName === "string"
      ? selectedNodeMetadata.appName
      : "HTTP request";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="rounded-lg border border-[var(--flow-border)] bg-[var(--flow-bg)] p-3">
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-xs text-[var(--flow-muted)]">
            Add the details for this step, then test it.
          </p>
        </div>
        {credentialType && (
          <div className="rounded-lg border border-[var(--flow-border)] bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">Saved credential</div>
                <p className="text-xs text-[var(--flow-muted)]">
                  Pick one, or paste fields manually below.
                </p>
              </div>
              <CreateCredentialDialog
                credentialType={credentialType}
                onCreated={() => void credentials.refetch()}
              />
            </div>
            <Select
              disabled={credentials.isLoading || !credentials.data?.length}
              onValueChange={handleCredentialSelect}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    credentials.data?.length
                      ? "Choose credential"
                      : "No saved credential"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(credentials.data ?? []).map((credential) => (
                  <SelectItem key={credential.id} value={credential.id}>
                    {formatCredentialName(credential)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {isWebhookApp && (
          <>
            <TextInputField
              control={form.control}
              name="webhookUrl"
              label="Webhook URL"
            />
            <TextInputField
              control={form.control}
              name="message"
              label="Message"
            />
          </>
        )}
        {isWhatsApp && (
          <>
            <TextInputField
              control={form.control}
              name="accessToken"
              label="Meta access token"
            />
            <TextInputField
              control={form.control}
              name="phoneNumberId"
              label="Phone number ID"
            />
            <TextInputField control={form.control} name="to" label="Recipient" />
            <TextInputField
              control={form.control}
              name="message"
              label="Message"
            />
          </>
        )}
        {!isWebhookApp && !isWhatsApp && (
          <>
            <TextInputField
              control={form.control}
              name="endpoint"
              label="Endpoint"
            />
            <TextInputField control={form.control} name="method" label="Method" />
            <TextAreaWithMention
              defaultValue={data?.body}
              onResolvedChange={handleTextAreaValueChange}
              placeholder='{"message":"okay"}'
              className="resize-none"
            />
          </>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={testStep.isPending}
            onClick={form.handleSubmit((values) => testStep.mutate(values))}
          >
            {testStep.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Play />
            )}
            Test step
          </Button>
          <Button type="submit">Save config</Button>
        </div>
      </form>
    </Form>
  );
}

function formatCredentialName(credential: ApiCredential) {
  if (
    credential.credentialType === CredentialType.SLACK_WEBHOOK ||
    credential.credentialType === CredentialType.DISCORD_WEBHOOK
  ) {
    return String(credential.metadata.webhookUrl ?? credential.credentialType);
  }
  if (credential.credentialType === CredentialType.WHATSAPP_CLOUD) {
    return String(
      credential.metadata.phoneNumberId ?? credential.credentialType,
    );
  }
  return credential.credentialType.replaceAll("_", " ");
}

function TextInputField({
  control,
  name,
  label,
}: {
  control: ReturnType<typeof useForm<HttpRequestFormSchema>>["control"];
  name: keyof HttpRequestFormSchema;
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
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
