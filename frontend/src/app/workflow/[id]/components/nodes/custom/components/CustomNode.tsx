import { cn } from "@/lib/utils";
import { useConfigPanel, useWorkflow } from "@/stores";
import { Position, Handle } from "@xyflow/react";

export function CustomNode({
  children,
  nodeId,
  className,
  preventDefault = false,
}: {
  children: React.ReactNode;
  nodeId: string;
  className?: string;
  preventDefault?: boolean;
}) {
  const setSelectedNodeId = useWorkflow((state) => state.setSelectedNodeId);
  const openConfigPanel = useConfigPanel((state) => state.openConfigPanel);

  function handleSelectNodeId() {
    if (preventDefault) return;
    setSelectedNodeId(nodeId);
  }

  return (
    <div
      className={cn(
        "bg-white flex justify-center items-center shadow-md rounded p-2 border",
        className,
      )}
    >
      <Handle type="target" position={Position.Left} />
      <div
        className="flex justify-center items-center"
        onClick={handleSelectNodeId}
        onDoubleClick={() => {
          if (preventDefault) return;
          openConfigPanel();
        }}
      >
        {children}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
