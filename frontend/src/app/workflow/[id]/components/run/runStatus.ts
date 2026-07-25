export type RunStatus = "idle" | "queueing" | "queued" | "failed";

export function getRunStatusCopy(status: RunStatus) {
  const copy: Record<RunStatus, { title: string; body: string }> = {
    idle: {
      title: "Ready to run",
      body: "Start this workflow when the setup looks good.",
    },
    queueing: {
      title: "Starting run",
      body: "FlowPilot is saving the latest version before it starts.",
    },
    queued: {
      title: "Run started",
      body: "FlowPilot is running the latest saved version.",
    },
    failed: {
      title: "Could not run",
      body: "Check setup and try again.",
    },
  };
  return copy[status];
}
