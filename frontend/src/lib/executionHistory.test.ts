import assert from "node:assert/strict";
import test from "node:test";
import {
  getExecutionFailedNodeId,
  getFriendlyExecutionStatus,
  getFriendlyExecutionTime,
  getFriendlyRunLabel,
  mergeExecutionHistory,
} from "./executionHistory";

test("merges queued execution without duplicates", () => {
  const merged = mergeExecutionHistory(
    [
      {
        id: "one",
        status: "QUEUED",
        createdAt: "2026-07-24T00:00:00.000Z",
      },
    ],
    {
      id: "one",
      status: "PROCESSING",
      createdAt: "2026-07-24T00:00:00.000Z",
    },
  );

  assert.equal(merged.length, 1);
  assert.equal(merged[0].status, "PROCESSING");
});

test("reads failed node id from persisted execution output", () => {
  const failedNodeId = getExecutionFailedNodeId({
    __summary: { failedNodeId: "node-2" },
  });

  assert.equal(failedNodeId, "node-2");
});

test("maps execution status to user-facing labels", () => {
  assert.equal(getFriendlyExecutionStatus("QUEUED"), "Starting");
  assert.equal(getFriendlyExecutionStatus("PROCESSING"), "Running");
  assert.equal(getFriendlyExecutionStatus("SUCCEEDED"), "Sent successfully");
  assert.equal(getFriendlyExecutionStatus("FAILED"), "Could not run");
});

test("labels recent runs without showing ids", () => {
  assert.equal(getFriendlyRunLabel(0), "Latest run");
  assert.equal(getFriendlyRunLabel(1), "Previous run");
  assert.equal(getFriendlyRunLabel(2), "Older run");
});

test("formats run time in plain language", () => {
  const now = new Date("2026-07-25T10:10:00.000Z");

  assert.equal(
    getFriendlyExecutionTime("2026-07-25T10:09:30.000Z", now),
    "Just now",
  );
  assert.equal(
    getFriendlyExecutionTime("2026-07-25T10:05:00.000Z", now),
    "5 min ago",
  );
  assert.equal(
    getFriendlyExecutionTime("2026-07-25T08:00:00.000Z", now),
    "Today",
  );
});
