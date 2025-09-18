import { ExecutionStatus } from "../backend/generated/prisma";
import { prisma } from "../backend/utils/db";
import { executableNodes } from "./nodes";
import type { WorkflowWithNodesAndEdges } from "./types";
import assert from "assert";

export class ExecutionManager {
  private workflow: WorkflowWithNodesAndEdges;
  private executionId: string;
  private output: Record<string, unknown> = {};

  constructor(workflow: WorkflowWithNodesAndEdges, executionId: string) {
    this.workflow = workflow;
    this.executionId = executionId;
  }

  public async intializeExecution() {
    const updatedExecution = await prisma.execution.update({
      where: { id: this.executionId },
      data: {
        status: ExecutionStatus.PROCESSING,
      },
    });
    return updatedExecution;
  }
  public async execute() {
    const triggerNode = this.workflow.nodes.shift();
    const addNode = this.workflow.nodes.pop();

    const stepNodes = this.workflow.nodes;

    while (stepNodes.length > 0) {
      const currentNode = stepNodes.shift();
      assert(currentNode);
      const result = await executableNodes[currentNode.nodeType]();
      this.output[currentNode.nodeType] = result;
    }
  }
}
