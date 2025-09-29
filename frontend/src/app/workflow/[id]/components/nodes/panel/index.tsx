import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { Button } from "@/components/ui/button";

export function NodesPanel() {
  const selectedNode = useWorkflow((state) => {
    return state.nodes.find((node) => state.selectedNodeId === node.id);
  });

  const isNodeConfigPanelOpen = useConfigPanel(
    (state) => state.isNodeConfigPanelOpen,
  );

  const isConfigPanelOpen = isNodeConfigPanelOpen;

  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);
  const currentConfigPanelNodeForm = useConfigPanel(
    (state) => state.currentConfigPanelNodeForm,
  );
  const setCurrentConfigPanelNodeForm = useConfigPanel(
    (state) => state.setCurrentConfigPanelNodeForm,
  );
  function handleBack() {
    setCurrentConfigPanelNodeForm(undefined);
  }

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
        <div>
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
        </div>
        <SheetFooter>
          {currentConfigPanelNodeForm && (
            <Button onClick={handleBack}>Back</Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PanelItem({ title, description, nodeType, form }: NodeOption) {
  const updateSelectedNode = useWorkflow((state) => state.updateSelectedNode);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);
  const setCurrentConfigPanelNodeForm = useConfigPanel(
    (state) => state.setCurrentConfigPanelNodeForm,
  );

  function handleChangeSelectedNodeType() {
    // if form provided , need to finish that before changing the node type
    if (form) {
      return setCurrentConfigPanelNodeForm(nodeType);
    }
    updateSelectedNode({ type: nodeType });
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
