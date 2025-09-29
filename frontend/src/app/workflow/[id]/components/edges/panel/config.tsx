import { EdgeType } from "@/stores/useWorkflowStore";
import { IfEdgeForm } from "./components/forms/If";

export type EdgeOption = {
  edgeType: EdgeType;
  title: string;
  description: string;
  form?: React.ReactNode;
};

export function getEdgeOptions(): EdgeOption[] {
  return [
    {
      edgeType: EdgeType.STEP,
      title: "Basic Edge Type",
      description: "Basic",
    },
    {
      edgeType: EdgeType.IF,
      title: "If Logic",
      description: "If",
      form: <IfEdgeForm />,
    },
  ];
}
