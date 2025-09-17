import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { ApiEdge, ApiNode } from "@/app/workflow/types";
import { Node, Edge } from "@xyflow/react";

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
    type: node.nodeType.name,
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

export function convertStateToApiNode(node: Node): ApiNode {
  return {
    id: node.id,
    nodeTypeId: string,
    nodeType: {
      id: string,
      name: string,
    },
    positionX: number,
    positionY: number,
    metadata: Record<string, unknown>,
  };
}

export function convertStateToApiEdge(node: Node): ApiNode {}
