"use client";

import { useConfigPanel, useWorkflow } from "@/stores";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  children,
}: EdgeProps & { children?: React.ReactNode }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const openEdgeConfigPanel = useConfigPanel(
    (state) => state.openEdgeConfigPanel,
  );

  const setSelectedEdgeId = useWorkflow((state) => state.setSelectedEdgeId);

  function handleSelectEdgeId() {
    setSelectedEdgeId(id);
  }

  function handleClick() {
    handleSelectEdgeId();
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="button-edge__label nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <button
            className="button-edge__button flex justify-center items-center"
            onClick={handleClick}
            onDoubleClick={openEdgeConfigPanel}
          >
            {children}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
