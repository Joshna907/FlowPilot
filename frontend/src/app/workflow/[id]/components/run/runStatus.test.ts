import test from "node:test";
import assert from "node:assert/strict";
import { getRunStatusCopy } from "./runStatus";

test("returns idle copy before a workflow run", () => {
  assert.deepEqual(getRunStatusCopy("idle"), {
    title: "Ready to run",
    body: "Start this workflow when the setup looks good.",
  });
});

test("returns queued copy after execution request succeeds", () => {
  assert.deepEqual(getRunStatusCopy("queued"), {
    title: "Run started",
    body: "FlowPilot is running the latest saved version.",
  });
});

test("returns failed copy when execution request fails", () => {
  assert.deepEqual(getRunStatusCopy("failed"), {
    title: "Could not run",
    body: "Check setup and try again.",
  });
});
