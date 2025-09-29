import { EdgeType } from "@/stores/useWorkflowStore";
import { IfEdgeForm } from "./If";

export const edgesFormConfig: Record<EdgeType, React.ReactNode> = {
  [EdgeType.IF]: <IfEdgeForm />,
  [EdgeType.STEP]: undefined,
};
