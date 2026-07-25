import Link from "next/link";
import { api } from "@/lib/utils";
import {
  getExecutionFailedNodeId,
  getExecutionOutputEntries,
} from "@/lib/executionHistory";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; executionId: string }>;
}) {
  const { id, executionId } = await params;
  const { data } = await api.get(`/execution/${executionId}`);

  if (!data.success) {
    return <div className="p-6">Execution not found</div>;
  }

  const execution = data.data.execution;
  const failedNodeId = getExecutionFailedNodeId(execution.output);
  const outputEntries = getExecutionOutputEntries(execution.output);

  return (
    <main className="min-h-screen bg-[var(--flow-bg)] p-6 text-[var(--flow-ink)]">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/workflow/${id}`}
          className="text-sm font-semibold text-[var(--flow-primary)]"
        >
          Back to workflow
        </Link>
        <div className="mt-4 rounded-lg border border-[var(--flow-border)] bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-[var(--flow-muted)]">
            Execution
          </div>
          <h1 className="mt-1 break-all text-2xl font-semibold">
            {execution.id}
          </h1>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <DetailBox label="Status" value={execution.status} />
            <DetailBox
              label="Created"
              value={new Date(execution.createdAt).toLocaleString()}
            />
            <DetailBox label="Failed node" value={failedNodeId ?? "None"} />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {outputEntries.length === 0 ? (
            <div className="rounded-lg border border-[var(--flow-border)] bg-white p-5 text-sm text-[var(--flow-muted)]">
              No per-node output stored yet.
            </div>
          ) : (
            outputEntries.map(([nodeId, output]) => (
              <div
                key={nodeId}
                className="rounded-lg border border-[var(--flow-border)] bg-white p-5 shadow-sm"
              >
                <div className="text-sm font-semibold">{nodeId}</div>
                <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-[var(--flow-bg)] p-3 text-xs">
                  {JSON.stringify(output, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--flow-border)] bg-[var(--flow-bg)] p-3">
      <div className="text-xs text-[var(--flow-muted)]">{label}</div>
      <div className="mt-1 break-all font-semibold">{value}</div>
    </div>
  );
}
