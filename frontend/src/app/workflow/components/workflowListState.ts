import type { ApiWorkflow } from "../types";

export function replaceWorkflowById(
  workflows: ApiWorkflow[],
  updatedWorkflow: ApiWorkflow,
) {
  return workflows.map((workflow) =>
    workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow,
  );
}

export function removeWorkflowById(workflows: ApiWorkflow[], workflowId: string) {
  return workflows.filter((workflow) => workflow.id !== workflowId);
}
