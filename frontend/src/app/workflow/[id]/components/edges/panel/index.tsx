import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useConfigPanel } from "@/stores";
import { useWorkflow } from "@/stores/useWorkflowStore";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EdgeOption, getEdgeOptions } from "./config";

export function EdgesPanel() {
  const selectedEdge = useWorkflow((state) => {
    return state.edges.find((edge) => state.selectedEdgeId === edge.id);
  });
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);
  const currentConfigPanelEdgeForm = useConfigPanel(
    (state) => state.currentConfigPanelEdgeForm,
  );
  const isEdgeConfigPanelOpen = useConfigPanel(
    (state) => state.isEdgeConfigPanelOpen,
  );
  const isConfigPanelOpen = isEdgeConfigPanelOpen;

  const setCurrentConfigPanelNodeForm = useConfigPanel(
    (state) => state.setCurrentConfigPanelNodeForm,
  );
  function handleBack() {
    setCurrentConfigPanelNodeForm(undefined);
  }

  if (!selectedEdge) {
    return;
  }
  const selectedEdgeType = selectedEdge?.type;

  if (!selectedEdgeType)
    return <div>could not determine selected edge type</div>;

  const edgeOptions = getEdgeOptions();

  const openForm = edgeOptions.find((option) => {
    return option.edgeType === currentConfigPanelEdgeForm;
  })?.form;

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
          <SheetTitle>Select Edge Type</SheetTitle>
          <SheetDescription>Edge Type</SheetDescription>
        </SheetHeader>
        <div>
          {openForm
            ? openForm
            : edgeOptions.map((option, index) => {
                return (
                  <PanelItem
                    key={index}
                    edgeType={option.edgeType}
                    title={option.title}
                    description={option.description}
                    form={option.form}
                  />
                );
              })}
        </div>
        <SheetFooter>
          {currentConfigPanelEdgeForm && (
            <Button onClick={handleBack}>Back</Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PanelItem({ title, description, edgeType, form }: EdgeOption) {
  const updateSelectedEdge = useWorkflow((state) => state.updateSelectedEdge);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);
  const setCurrentConfigPanelEdgeForm = useConfigPanel(
    (state) => state.setCurrentConfigPanelEdgeForm,
  );

  function handleChangeSelectedEdgeType() {
    // if form provided , need to finish that before changing the edge type
    if (form) {
      return setCurrentConfigPanelEdgeForm(edgeType);
    }
    updateSelectedEdge({ type: edgeType });
    closeConfigPanel();
  }
  return (
    <div
      onClick={handleChangeSelectedEdgeType}
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
