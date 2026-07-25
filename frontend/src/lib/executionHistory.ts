export type ExecutionHistoryItem = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  startedAt?: string | null;
  output?: unknown;
};

export function mergeExecutionHistory(
  history: ExecutionHistoryItem[],
  execution: ExecutionHistoryItem,
  limit = 10,
) {
  return [
    execution,
    ...history.filter((item) => item.id !== execution.id),
  ].slice(0, limit);
}

export function getExecutionFailedNodeId(output: unknown) {
  if (!output || typeof output !== "object") return undefined;
  const record = output as Record<string, unknown>;
  const summary = record.__summary;
  if (summary && typeof summary === "object") {
    const failedNodeId = (summary as Record<string, unknown>).failedNodeId;
    if (typeof failedNodeId === "string") return failedNodeId;
  }
  const error = record.__error;
  if (error && typeof error === "object") {
    const failedNodeId = (error as Record<string, unknown>).failedNodeId;
    if (typeof failedNodeId === "string") return failedNodeId;
  }
  return undefined;
}

export function getExecutionOutputEntries(output: unknown) {
  if (!output || typeof output !== "object") return [];
  return Object.entries(output as Record<string, unknown>).filter(
    ([nodeId]) => !nodeId.startsWith("__"),
  );
}

export function getFriendlyExecutionStatus(status: string) {
  const normalizedStatus = status.toUpperCase();
  const labels: Record<string, string> = {
    QUEUED: "Starting",
    PROCESSING: "Running",
    SUCCEEDED: "Sent successfully",
    FAILED: "Could not run",
  };

  return labels[normalizedStatus] ?? "Run updated";
}

export function getFriendlyRunLabel(index: number) {
  if (index === 0) return "Latest run";
  if (index === 1) return "Previous run";
  return "Older run";
}

export function getFriendlyExecutionTime(createdAt: string, now = new Date()) {
  const createdAtDate = new Date(createdAt);
  const diffInMs = now.getTime() - createdAtDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  if (createdAtDate.toDateString() === now.toDateString()) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (createdAtDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return createdAtDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
