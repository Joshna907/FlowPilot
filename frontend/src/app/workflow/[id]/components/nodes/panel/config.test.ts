import test from "node:test";
import assert from "node:assert/strict";
import { NodeType } from "@/stores/useWorkflowStore";
import {
  getDirectNodeFormType,
  getPanelDescription,
  getPanelTitle,
} from "./config";

test("opens HTTP request nodes directly in their config form", () => {
  assert.equal(
    getDirectNodeFormType(NodeType.HTTP_REQUEST),
    NodeType.HTTP_REQUEST,
  );
  assert.equal(getPanelTitle(NodeType.HTTP_REQUEST), "Set up this step");
  assert.equal(
    getPanelDescription(NodeType.HTTP_REQUEST),
    "Add the details this step needs before running.",
  );
});

test("keeps empty nodes in the step chooser", () => {
  assert.equal(getDirectNodeFormType(NodeType.EMPTY), undefined);
  assert.equal(getPanelTitle(NodeType.EMPTY), "Choose a step type");
});
