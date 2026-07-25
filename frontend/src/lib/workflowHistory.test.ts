import assert from "node:assert/strict";
import test from "node:test";
import type { Edge, Node } from "@xyflow/react";
import {
  pushWorkflowHistory,
  redoWorkflowHistory,
  undoWorkflowHistory,
} from "./workflowHistory";

const firstGraph = {
  nodes: [{ id: "one", position: { x: 0, y: 0 }, data: {} }] as Node[],
  edges: [] as Edge[],
};

const secondGraph = {
  nodes: [
    { id: "one", position: { x: 0, y: 0 }, data: {} },
    { id: "two", position: { x: 0, y: 160 }, data: {} },
  ] as Node[],
  edges: [{ id: "one-two", source: "one", target: "two" }] as Edge[],
};

test("pushes previous graph and clears redo stack", () => {
  const history = pushWorkflowHistory({
    past: [],
    future: [firstGraph],
    current: firstGraph,
  });

  assert.equal(history.past.length, 1);
  assert.equal(history.future.length, 0);
});

test("undo returns previous graph and stores current for redo", () => {
  const result = undoWorkflowHistory({
    past: [firstGraph],
    future: [],
    current: secondGraph,
  });

  assert.equal(result.graph.nodes.length, 1);
  assert.equal(result.past.length, 0);
  assert.equal(result.future.length, 1);
});

test("redo restores graph from future stack", () => {
  const result = redoWorkflowHistory({
    past: [],
    future: [secondGraph],
    current: firstGraph,
  });

  assert.equal(result.graph.nodes.length, 2);
  assert.equal(result.past.length, 1);
  assert.equal(result.future.length, 0);
});
