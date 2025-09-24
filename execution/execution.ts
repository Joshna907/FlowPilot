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

  private resolveTemplatesInString(
    template: string,
    outputs: Record<string, unknown>,
  ): string {
    return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, expr) => {
      const pathParts = String(expr).trim().split(".");
      const nodeId = pathParts.shift();
      if (!nodeId) return "";
      const nodeOutput = outputs[nodeId as string];
      if (nodeOutput === undefined || nodeOutput === null) return "";
      let current: any = nodeOutput as any;
      for (const segment of pathParts) {
        if (current == null) return "";
        current = (current as any)[segment];
      }
      if (typeof current === "string") return current;
      try {
        return JSON.stringify(current);
      } catch {
        return String(current ?? "");
      }
    });
  }

  private resolveAtMentionsInString(
    template: string,
    outputs: Record<string, unknown>,
  ): string {
    return template.replace(
      /@([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9_]+)*)\b/g,
      (match, expr) => {
        const pathParts = String(expr).trim().split(".");
        const nodeId = pathParts.shift();
        if (!nodeId) return match;
        // Only resolve when nodeId exists in outputs to avoid replacing emails/usernames
        if (!(nodeId in outputs)) return match;
        let current: any = outputs[nodeId as string] as any;
        for (const segment of pathParts) {
          if (current == null) return "";
          current = (current as any)[segment];
        }
        if (typeof current === "string") return current;
        try {
          return JSON.stringify(current);
        } catch {
          return String(current ?? "");
        }
      },
    );
  }

  private resolveMetadataValues(value: unknown): unknown {
    if (typeof value === "string") {
      const withAt = this.resolveAtMentionsInString(value, this.output);
      return this.resolveTemplatesInString(withAt, this.output);
    }
    if (Array.isArray(value)) {
      return value.map((v) => this.resolveMetadataValues(v));
    }
    if (value && typeof value === "object") {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        result[k] = this.resolveMetadataValues(v);
      }
      return result;
    }
    return value;
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
        console.log("currently executing -", currentNode);
        const executor = executableNodes[currentNode.nodeType];
        if (executor) {
          const metadata = currentNode.metadata;
          const resolvedMetadata = this.resolveMetadataValues(
            metadata,
          ) as Record<string, unknown>;
          const result = await executor(resolvedMetadata);
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
