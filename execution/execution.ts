import { ExecutionStatus, NodeType, Prisma } from "../backend/generated/prisma";
import { prisma } from "../backend/utils/db";
import { executableNodes } from "./nodes";
import type {
  NodeWithIncomingAndOutgoingEdges,
  WorkflowWithNodesAndEdges,
} from "./types";
import assert from "assert";

export enum NodeCategory {
  TRIGGER = "TRIGGER",
  STEP = "STEP",
}

export const nodeCategories: Record<NodeCategory, NodeType[]> = {
  [NodeCategory.TRIGGER]: [
    NodeType.WEBHOOK_TRIGGER,
    NodeType.MANUAL_TRIGGER,
    NodeType.INITIAL,
  ],
  [NodeCategory.STEP]: [
    NodeType.SEND_EMAIL,
    NodeType.EMPTY,
    NodeType.SEND_EMAIL_AND_AWAIT_REPLY,
  ],
};

export class ExecutionManager {
  private workflow: WorkflowWithNodesAndEdges;
  private executionId: string;
  private output: Record<string, unknown> = {};
  private executionStack: NodeWithIncomingAndOutgoingEdges[] = [];

  constructor(workflow: WorkflowWithNodesAndEdges, executionId: string) {
    this.workflow = workflow;
    this.executionId = executionId;
  }

  public async intializeExecution() {
    const updatedExecution = await prisma.execution.update({
      where: { id: this.executionId },
      data: {
        status: ExecutionStatus.PROCESSING,
        startedAt: new Date(),
      },
    });
    return updatedExecution;
  }

  private async concludeExecution({ success }: { success: boolean }) {
    const updatedExecution = await prisma.execution.update({
      where: { id: this.executionId },
      data: {
        status: success ? ExecutionStatus.SUCCEEDED : ExecutionStatus.FAILED,
        output: this.output as Prisma.InputJsonValue,
      },
    });
    return updatedExecution;
  }

  private getOutgoingNodes(
    node: NodeWithIncomingAndOutgoingEdges,
  ): NodeWithIncomingAndOutgoingEdges[] {
    const outgoingEdgesIdMap = new Map(
      node.outgoingEdges.map((edge) => {
        return [edge.id, true];
      }),
    );

    const outgoingNodes = this.workflow.nodes.filter((node) => {
      const nodeHasIncomigEdge = node.incomingEdges.find((edge) => {
        return outgoingEdgesIdMap.has(edge.id);
      });
      return nodeHasIncomigEdge;
    });
    return outgoingNodes;
  }

  private removeNodeFromWorkflow(node: NodeWithIncomingAndOutgoingEdges) {
    const nodeIndex = this.workflow.nodes.findIndex((n) => {
      return node.id === n.id;
    });
    if (nodeIndex === -1) {
      throw new Error("No nodeIndex found");
    }
    const [removedNode] = this.workflow.nodes.splice(nodeIndex, 1);
    if (!removedNode) {
      throw new Error("No node removed");
    }
    return removedNode;
  }

  public async execute() {
    try {
      // find trigger node based on the type
      const triggerNodeIndex = this.workflow.nodes.findIndex((node) => {
        return nodeCategories[NodeCategory.TRIGGER].includes(node.nodeType);
      });
      if (triggerNodeIndex === -1) {
        throw new Error("No trigger node found");
      }
      const [triggerNode] = this.workflow.nodes.splice(triggerNodeIndex, 1);

      if (!triggerNode) {
        throw new Error("No trigger node found");
      }
      const outgoingTriggerNodes = this.getOutgoingNodes(triggerNode);
      outgoingTriggerNodes.forEach((node) => {
        this.removeNodeFromWorkflow(node);
      });

      const addNodeIndex = this.workflow.nodes.findIndex((node) => {
        return node.nodeType === NodeType.ADD_NODE;
      });
      if (addNodeIndex === -1) {
        throw new Error();
      }
      this.workflow.nodes.splice(addNodeIndex, 1);

      this.executionStack.unshift(...outgoingTriggerNodes);

      while (this.executionStack.length > 0) {
        const currentNode = this.executionStack.pop();
        assert(currentNode);

        const executor = executableNodes[currentNode.nodeType];
        if (executor) {
          const metadata = currentNode.metadata;
          const result = await executor(metadata as Record<string, unknown>);
          this.output[currentNode.id] = result;
        }

        const outgoingNodesFromCurrentNode = this.getOutgoingNodes(currentNode);
        outgoingNodesFromCurrentNode.forEach((node) => {
          this.removeNodeFromWorkflow(node);
        });
        this.executionStack.unshift(...outgoingNodesFromCurrentNode);
      }
      await this.concludeExecution({ success: true });
    } catch (error) {
      console.error({ error });
      await this.concludeExecution({ success: false });
    }
  }
}
