"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useConfigPanel, useWorkflow } from "@/stores";
import { Position, Handle } from "@xyflow/react";
import { Check, SquarePen, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useClickAway } from "@uidotdev/usehooks";

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
  const openNodeConfigPanel = useConfigPanel(
    (state) => state.openNodeConfigPanel,
  );
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
        className="flex gap-1 justify-center items-center"
        onClick={handleClick}
        onDoubleClick={() => {
          if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
          }
          if (preventDefault) return;
          openNodeConfigPanel();
        }}
      >
        <EditNodeLabel nodeId={nodeId} />
        {children}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function EditNodeLabel({ nodeId }: { nodeId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const ref = useClickAway<HTMLDivElement>(() => {
    handleStopEditing();
  });

  const nodeLabel = useWorkflow((state) => {
    return state.nodes.find((n) => n.id === nodeId);
  })?.data.label as string;

  const updateNodeLabel = useWorkflow((state) => {
    return state.updateNodeLabel;
  });

  function handleUpdateNodeLabel() {
    updateNodeLabel({ nodeId, label: inputValue });
    handleStopEditing();
  }

  function handleStopEditing() {
    setIsEditing(false);
  }

  function handleStartEditing() {
    setIsEditing(true);
  }

  useEffect(() => {
    setInputValue(nodeLabel);
  }, [nodeLabel, isEditing]);

  if (!nodeLabel) {
    return;
  }

  return (
    <div ref={ref} className="flex group gap-1">
      {isEditing ? (
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
      ) : (
        nodeLabel
      )}
      <div className="opacity-0 flex hover:cursor-pointer group-hover:opacity-100">
        {isEditing ? (
          <div className="flex gap-1">
            <Check onClick={handleUpdateNodeLabel} size={8}></Check>
            <X onClick={handleStopEditing} size={8}></X>
          </div>
        ) : (
          <SquarePen onClick={handleStartEditing} size={8} />
        )}
      </div>
    </div>
  );
}
