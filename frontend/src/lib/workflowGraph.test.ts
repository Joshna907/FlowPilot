import test from "node:test";
import assert from "node:assert/strict";
import { Edge, Node } from "@xyflow/react";
import { EdgeType, NodeType } from "@/stores/useWorkflowStore";
import {
  addEmptyNodeToGraph,
  addIntegrationNodeToGraph,
  deleteNodeFromGraph,
  duplicateNodeInGraph,
  toggleNodeDisabledInGraph,
  validateWorkflowGraph,
} from "./workflowGraph";

function node(id: string, type: NodeType, data: Record<string, unknown> = {}): Node {
  return { id, type, position: { x: 0, y: 0 }, data };
}

function edge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target, type: EdgeType.STEP };
}

test("deleteNodeFromGraph reconnects previous node to next node", () => {
  const result = deleteNodeFromGraph({
    nodes: [
      node("trigger", NodeType.MANUAL_TRIGGER),
      node("middle", NodeType.HTTP_REQUEST),
      node("add", NodeType.ADD_NODE),
    ],
    edges: [edge("trigger", "middle"), edge("middle", "add")],
    nodeId: "middle",
  });

  assert.deepEqual(
    result.nodes.map((item) => item.id),
    ["trigger", "add"],
  );
  assert.equal(result.edges.length, 1);
  assert.equal(result.edges[0]?.source, "trigger");
  assert.equal(result.edges[0]?.target, "add");
});

test("addEmptyNodeToGraph rebuilds a usable canvas from zero nodes", () => {
  const result = addEmptyNodeToGraph({
    nodes: [],
    edges: [],
    newTriggerNodeId: "trigger",
    newNodeId: "step",
    newAddNodeId: "add",
  });

  assert.deepEqual(
    result.nodes.map((item) => [item.id, item.type]),
    [
      ["trigger", NodeType.INITIAL],
      ["step", NodeType.EMPTY],
      ["add", NodeType.ADD_NODE],
    ],
  );
  assert.deepEqual(
    result.edges.map((item) => [item.source, item.target]),
    [
      ["trigger", "step"],
      ["step", "add"],
    ],
  );
});

test("addEmptyNodeToGraph inserts a blank step before the add placeholder", () => {
  const result = addEmptyNodeToGraph({
    nodes: [node("trigger", NodeType.MANUAL_TRIGGER), node("add", NodeType.ADD_NODE)],
    edges: [edge("trigger", "add")],
    newTriggerNodeId: "unused",
    newNodeId: "step",
    newAddNodeId: "new-add",
  });

  assert.deepEqual(
    result.nodes.map((item) => item.id),
    ["trigger", "step", "add"],
  );
  assert.deepEqual(
    result.edges.map((item) => [item.source, item.target]),
    [
      ["trigger", "step"],
      ["step", "add"],
    ],
  );
});

test("addIntegrationNodeToGraph inserts an app node without adding an extra blank step", () => {
  const result = addIntegrationNodeToGraph({
    nodes: [],
    edges: [],
    integrationNode: node("slack", NodeType.HTTP_REQUEST, {
      integrationKey: "slack",
    }),
    newTriggerNodeId: "trigger",
    newAddNodeId: "add",
  });

  assert.deepEqual(
    result.nodes.map((item) => [item.id, item.type]),
    [
      ["trigger", NodeType.INITIAL],
      ["slack", NodeType.HTTP_REQUEST],
      ["add", NodeType.ADD_NODE],
    ],
  );
  assert.deepEqual(
    result.edges.map((item) => [item.source, item.target]),
    [
      ["trigger", "slack"],
      ["slack", "add"],
    ],
  );
});

test("deleteNodeFromGraph turns the only trigger into a trigger placeholder", () => {
  const result = deleteNodeFromGraph({
    nodes: [node("trigger", NodeType.MANUAL_TRIGGER), node("add", NodeType.ADD_NODE)],
    edges: [edge("trigger", "add")],
    nodeId: "trigger",
  });

  assert.equal(result.nodes[0]?.id, "trigger");
  assert.equal(result.nodes[0]?.type, NodeType.INITIAL);
  assert.equal(result.nodes[0]?.data.label, "Choose trigger");
  assert.equal(result.edges.length, 1);
});

test("duplicateNodeInGraph creates an unconfigured copy next to the source node", () => {
  const result = duplicateNodeInGraph({
    nodes: [node("send", NodeType.HTTP_REQUEST, { label: "Send Slack message" })],
    edges: [],
    nodeId: "send",
    newNodeId: "copy",
  });

  assert.equal(result.nodes.length, 2);
  assert.equal(result.nodes[1]?.id, "copy");
  assert.equal(result.nodes[1]?.type, NodeType.HTTP_REQUEST);
  assert.equal(result.nodes[1]?.data.label, "Send Slack message copy");
  assert.equal(result.nodes[1]?.data.needsConfig, true);
});

test("toggleNodeDisabledInGraph toggles disabled metadata", () => {
  const disabled = toggleNodeDisabledInGraph({
    nodes: [node("send", NodeType.HTTP_REQUEST)],
    nodeId: "send",
  });
  assert.equal(disabled[0]?.data.disabled, true);

  const enabled = toggleNodeDisabledInGraph({
    nodes: disabled,
    nodeId: "send",
  });
  assert.equal(enabled[0]?.data.disabled, false);
});

test("validateWorkflowGraph blocks missing config and disconnected action nodes", () => {
  const issues = validateWorkflowGraph({
    nodes: [
      node("trigger", NodeType.MANUAL_TRIGGER),
      node("send", NodeType.HTTP_REQUEST, { needsConfig: true }),
      node("lonely", NodeType.HTTP_REQUEST),
    ],
    edges: [edge("trigger", "send")],
  });

  assert.deepEqual(
    issues.map((issue) => issue.code),
    ["missing_config", "disconnected_node"],
  );
});
