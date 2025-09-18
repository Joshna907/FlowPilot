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

enum NodeCategory {
  TRIGGER = "TRIGGER",
  CHORE = "CHORE",
}

const nodeCategories = new Map<NodeCategory, NodeType[]>([
  [
    NodeCategory.TRIGGER,
    [NodeType.WEBHOOK_TRIGGER, NodeType.MANUAL_TRIGGER, NodeType.INITIAL],
  ],
  [NodeCategory.CHORE, [NodeType.SEND_EMAIL, NodeType.EMPTY]],
]);

function getNodeOptions(nodeType: NodeType) {
  if (nodeCategories.get(NodeCategory.TRIGGER)?.includes(nodeType)) {
    return [
      {
        nodeType: NodeType.MANUAL_TRIGGER,
        title: "Manual",
        description: "Run Manually upon clicking the Trigger.",
      },
      {
        nodeType: NodeType.WEBHOOK_TRIGGER,
        title: "Webhook",
        description: "Run when a webhook is hit.",
      },
    ];
  } else if (nodeCategories.get(NodeCategory.CHORE)?.includes(nodeType)) {
    return [
      {
        nodeType: NodeType.SEND_EMAIL,
        title: "Email",
        description: "Email",
      },
    ];
  } else {
    return [];
  }
}

function getPanelTitle(nodeType: NodeType) {
  if (nodeType === NodeType.INITIAL || nodeType === NodeType.MANUAL_TRIGGER) {
    return "What triggers this workflow?";
  }
  return "What does this Node Do ?";
}

function getPanelDescription(nodeType: NodeType) {
  if (nodeType === NodeType.INITIAL || nodeType === NodeType.MANUAL_TRIGGER) {
    return "A trigger is a step that starts your workflow";
  }
  return "Choose what step you want this node to perform.";
}

export function NodesPanel() {
  const isConfigPanelOpen = useConfigPanel((state) => state.isConfigPanelOpen);
  const closeConfigPanel = useConfigPanel((state) => state.closeConfigPanel);

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
        {nodeOptions.map((option, index) => {
          return (
            <PanelItem
              key={index}
              nodeType={option.nodeType}
              title={option.title}
              description={option.description}
            />
          );
        })}
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
