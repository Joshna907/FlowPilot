import { cn } from "@/lib/utils";
import { useConfigPanel, useWorkflow } from "@/stores";
import { Position, Handle } from "@xyflow/react";
import { useRef } from "react";

export function CustomNode({
  children,
  nodeId,
  className,
  preventDefault = false,
  onClick,
}: {
  children: React.ReactNode;
  nodeId: string;
  className?: string;
  preventDefault?: boolean;
  onClick?: () => void;
}) {
  const setSelectedNodeId = useWorkflow((state) => state.setSelectedNodeId);
  const openConfigPanel = useConfigPanel((state) => state.openConfigPanel);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSelectNodeId() {
    setSelectedNodeId(nodeId);
  }

  function handleClick() {
    handleSelectNodeId();
    if (!onClick) return;
    // don't run onClick upon double click
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    clickTimeoutRef.current = setTimeout(() => {
      onClick();
      clickTimeoutRef.current = null;
    }, 250);
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
        onClick={handleClick}
        onDoubleClick={() => {
          if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
          }
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
