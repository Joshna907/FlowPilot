"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getPickerIntegrations } from "@/lib/integrationCatalog";
import { useWorkflow } from "@/stores";
import {
  ArrowRight,
  Grid2X2,
  Search,
} from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

export function IntegrationLibrary({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const addIntegrationStep = useWorkflow((state) => state.addIntegrationStep);

  const results = useMemo(() => {
    return getPickerIntegrations(query);
  }, [query]);

  function handleAdd(key: string, enabled: boolean) {
    if (!enabled) {
      toast.info("Coming soon");
      return;
    }
    addIntegrationStep(key);
    setOpen(false);
    toast.success("Step added");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Grid2X2 />
            Library
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <section className="overflow-hidden rounded-lg bg-white p-5">
          <DialogHeader>
            <DialogTitle>Add app</DialogTitle>
            <DialogDescription>
              Choose where this step should send a message.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--flow-border)] px-3">
            <Search className="size-4 text-[var(--flow-muted)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Email, Slack, WhatsApp, Discord"
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {results.map((integration) => (
              <button
                key={integration.key}
                className="group flex min-h-24 items-center gap-4 rounded-xl border border-[var(--flow-border)] bg-white p-4 text-left transition hover:border-[var(--flow-primary)] hover:shadow-sm"
                onClick={() => handleAdd(integration.key, true)}
              >
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-black text-white"
                  style={{ backgroundColor: integration.accent }}
                >
                  {integration.name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {integration.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--flow-muted)]">
                    {integration.description}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-[var(--flow-muted)] group-hover:text-[var(--flow-primary)]" />
              </button>
            ))}
          </div>
          {results.length === 0 && (
            <div className="mt-5 rounded-xl border border-dashed border-[var(--flow-border)] bg-[var(--flow-bg)] p-6 text-center text-sm text-[var(--flow-muted)]">
              No matching app. Try Email, Slack, WhatsApp, or Discord.
            </div>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}
