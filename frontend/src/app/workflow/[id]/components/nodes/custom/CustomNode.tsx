"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useConfigPanel, useWorkflow } from "@/stores";
import { Handle, Position } from "@xyflow/react";
import {
  AlertTriangle,
  Check,
  Copy,
  Power,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
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
  const selectedNode = useWorkflow((state) =>
    state.nodes.find((node) => node.id === nodeId),
  );
  const openNodeConfigPanel = useConfigPanel(
    (state) => state.openNodeConfigPanel,
  );
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const needsConfig = Boolean(selectedNode?.data?.needsConfig);
  const voiceGenerated = Boolean(selectedNode?.data?.voiceGenerated);
  const disabled = Boolean(selectedNode?.data?.disabled);
  const showActions = selectedNode?.type !== "ADD_NODE";
  const deleteNode = useWorkflow((state) => state.deleteNode);
  const duplicateNode = useWorkflow((state) => state.duplicateNode);
  const toggleNodeDisabled = useWorkflow((state) => state.toggleNodeDisabled);

  function handleSelectNodeId() {
    setSelectedNodeId(nodeId);
  }

  function handleOpenNodeConfig() {
    handleSelectNodeId();
    if (preventDefault) return;
    openNodeConfigPanel();
  }

  function handleClick() {
    handleSelectNodeId();
    if (!onClick) return;
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
        "flow-builder-node group relative flex min-w-44 items-center gap-3 rounded-lg border bg-white px-3 py-2 shadow-sm transition",
        needsConfig && "flow-builder-node-warning",
        voiceGenerated && "flow-builder-node-voice",
        disabled && "opacity-50 grayscale",
        className,
      )}
    >
      {showActions && (
        <div className="absolute -top-8 right-2 z-20 hidden items-center gap-1 rounded-full border border-[var(--flow-border)] bg-white p-1 shadow-sm group-hover:flex">
          <button
            aria-label="Duplicate node"
            className="rounded-full p-1 text-[var(--flow-muted)] hover:bg-[var(--flow-bg)] hover:text-[var(--flow-ink)]"
            onClick={(event) => {
              event.stopPropagation();
              duplicateNode(nodeId);
            }}
          >
            <Copy className="size-3.5" />
          </button>
          <button
            aria-label={disabled ? "Enable node" : "Disable node"}
            className="rounded-full p-1 text-[var(--flow-muted)] hover:bg-[var(--flow-bg)] hover:text-[var(--flow-ink)]"
            onClick={(event) => {
              event.stopPropagation();
              toggleNodeDisabled(nodeId);
            }}
          >
            <Power className="size-3.5" />
          </button>
          <button
            aria-label="Delete node"
            className="rounded-full p-1 text-[var(--flow-muted)] hover:bg-red-50 hover:text-red-600"
            onClick={(event) => {
              event.stopPropagation();
              deleteNode(nodeId);
            }}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
      <Handle type="target" position={Position.Left} />
      <div
        className="flex flex-1 items-center gap-3"
        onClick={handleClick}
        onDoubleClick={() => {
          if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
          }
          handleOpenNodeConfig();
        }}
      >
        <div className="flex flex-col gap-1">
          <EditNodeLabel nodeId={nodeId} />
          {needsConfig && (
            <button
              type="button"
              className="nodrag inline-flex items-center gap-1 text-left text-xs font-medium text-[#9A5B00] underline-offset-2 hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                handleOpenNodeConfig();
              }}
            >
              <AlertTriangle className="size-3" />
              Needs setup
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center">{children}</div>
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
    <div ref={ref} className="flex items-center gap-1">
      {isEditing ? (
        <Input
          className="h-7 min-w-28"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
      ) : (
        <span className="max-w-32 truncate text-sm font-semibold">
          {nodeLabel}
        </span>
      )}
      <div className="flex opacity-0 transition group-hover:opacity-100">
        {isEditing ? (
          <div className="flex gap-1">
            <Check onClick={handleUpdateNodeLabel} size={12} />
            <X onClick={handleStopEditing} size={12} />
          </div>
        ) : (
          <SquarePen onClick={handleStartEditing} size={12} />
        )}
      </div>
    </div>
  );
}
