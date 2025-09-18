import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useConfigPanel } from "@/stores";
import { NodeType, useWorkflow } from "@/stores/useWorkflowStore";
import { ArrowRight } from "lucide-react";
import {
  getNodeOptions,
  getPanelDescription,
  getPanelTitle,
  NodeOption,
} from "./config";
import { nodesFormConfig } from "./components/forms";

export function NodesPanel() {
  const isConfigPanelOpen = useConfigPanel((state) => state.isConfigPanelOpen);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);
  const currentConfigPanelNodeForm = useConfigPanel(
    (state) => state.currentConfigPanelNodeForm,
  );

  const selectedNodeId = useWorkflow((state) => state.selectedNodeId);
  const nodes = useWorkflow((state) => state.nodes);
  const selectedNode = nodes.find((node) => selectedNodeId === node.id);

  if (!selectedNode) {
    return;
  }
  const selectedNodeType = selectedNode?.type as NodeType;

  if (!selectedNodeType)
    return <div>could not determine selected node type</div>;

  const nodeOptions = getNodeOptions(selectedNodeType);

  return (
    <Sheet
      open={isConfigPanelOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeConfigPanel();
        }
      }}
    >
      <SheetContent className="p-4">
        <SheetHeader>
          <SheetTitle>{getPanelTitle(selectedNodeType)}</SheetTitle>
          <SheetDescription>
            {getPanelDescription(selectedNodeType)}
          </SheetDescription>
        </SheetHeader>
        {currentConfigPanelNodeForm
          ? nodesFormConfig[currentConfigPanelNodeForm]
          : nodeOptions.map((option, index) => {
              return (
                <PanelItem
                  key={index}
                  nodeType={option.nodeType}
                  title={option.title}
                  description={option.description}
                  form={option.form}
                />
              );
            })}
      </SheetContent>
    </Sheet>
  );
}

function PanelItem({ title, description, nodeType, form }: NodeOption) {
  const changeSelectedNodeType = useWorkflow(
    (state) => state.changeSelectedNodeType,
  );
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);
  const setCurrentConfigPanelNodeForm = useConfigPanel(
    (state) => state.setCurrentConfigPanelNodeForm,
  );

  function handleChangeSelectedNodeType() {
    console.log({ form });
    // if form provided , need to finish that before changing the node type
    if (form) {
      return setCurrentConfigPanelNodeForm(nodeType);
    }
    changeSelectedNodeType(nodeType);
    closeConfigPanel();
  }
  return (
    <div
      onClick={handleChangeSelectedNodeType}
      className="flex hover:cursor-pointer p-4 justify-between items-center"
    >
      <div>
        <SheetTitle className="text-left">{title}</SheetTitle>
        <SheetDescription>{description}</SheetDescription>
      </div>
      <ArrowRight />
    </div>
  );
}
