import assert from "node:assert/strict";
import test from "node:test";
import type { ApiWorkflow } from "../types";
import { removeWorkflowById, replaceWorkflowById } from "./workflowListState";

const baseWorkflow: ApiWorkflow = {
  id: "one",
  name: "One",
  createdAt: "2026-07-25T00:00:00.000Z",
  updatedAt: "2026-07-25T00:00:00.000Z",
  publishedAt: null,
  archivedAt: null,
  nodes: [],
  edges: [],
};

test("replaces workflow by id", () => {
  const workflows = [
    baseWorkflow,
    { ...baseWorkflow, id: "two", name: "Two" },
  ];

  const updated = { ...baseWorkflow, name: "Archived", archivedAt: "now" };

  assert.deepEqual(replaceWorkflowById(workflows, updated), [
    updated,
    workflows[1],
  ]);
});

test("removes workflow by id", () => {
  const workflows = [
    baseWorkflow,
    { ...baseWorkflow, id: "two", name: "Two" },
  ];

  assert.deepEqual(removeWorkflowById(workflows, "one"), [workflows[1]]);
});
