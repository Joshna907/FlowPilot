import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import {
  ApiEdge,
  ApiEdgeInput,
  ApiNode,
  ApiNodeInput,
} from "@/app/workflow/types";
import { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/stores/useWorkflowStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const api = axios.create({
  baseURL: process.env.API_BASE || "http://localhost:3001",
});

export function convertApiNodeToState(node: ApiNode): Node {
  return {
    id: node.id,
    position: { x: node.positionX, y: node.positionY },
    type: node.nodeType,
    data: node.metadata,
  };
}

export function convertApiEdgeToState(edge: ApiEdge): Edge {
  return {
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    type: "step",
  };
}

export function convertStateToApiNode(node: Node): ApiNodeInput {
  return {
    id: node.id,
    nodeType: node.type as NodeType,
    positionX: node.position.x,
    positionY: node.position.y,
    metadata: node.data,
  };
}

export function convertStateToApiEdge(edge: Edge): ApiEdgeInput {
  return {
    id: edge.id,
    sourceNodeId: edge.source,
    targetNodeId: edge.target,
    edgeType: edge.type ?? "step",
  };
}
