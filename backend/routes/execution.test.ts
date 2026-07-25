import test from "node:test";
import assert from "node:assert/strict";
import { NodeType } from "../generated/prisma";
import { validateExecutableWorkflow } from "./execution";

test("validateExecutableWorkflow rejects an empty saved graph", () => {
  assert.equal(
    validateExecutableWorkflow({ nodes: [] }),
    "Workflow has no saved steps. Save the canvas before running.",
  );
});

test("validateExecutableWorkflow rejects a graph without a real trigger", () => {
  assert.equal(
    validateExecutableWorkflow({
      nodes: [{ nodeType: NodeType.HTTP_REQUEST }],
    }),
    "Workflow needs a manual or webhook trigger before running.",
  );
});

test("validateExecutableWorkflow accepts a graph with a real trigger", () => {
  assert.equal(
    validateExecutableWorkflow({
      nodes: [
        { nodeType: NodeType.MANUAL_TRIGGER },
        { nodeType: NodeType.HTTP_REQUEST },
      ],
    }),
    undefined,
  );
});
