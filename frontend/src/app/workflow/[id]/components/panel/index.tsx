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
export function NodesPanel() {
  const isConfigPanelOpen = useConfigPanel((state) => state.isConfigPanelOpen);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);

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
          <SheetTitle>What triggers this workflow?</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow
          </SheetDescription>
        </SheetHeader>
        <PanelItem
          nodeType={NodeType.MANUAL}
          title="Manual"
          description="Run Manually"
        />
      </SheetContent>
    </Sheet>
  );
}

function PanelItem({
  title,
  description,
  nodeType,
}: {
  title: string;
  description: string;
  nodeType: NodeType;
}) {
  const changeSelectedNodeType = useWorkflow(
    (state) => state.changeSelectedNodeType,
  );
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);

  function handleChangeSelectedNodeType() {
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
