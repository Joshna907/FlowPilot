"use client";
import { EdgeProps } from "@xyflow/react";
import { CustomEdge } from "./CustomEdge";
import { Funnel } from "lucide-react";

export function IfEdge(input: EdgeProps) {
  return (
    <CustomEdge {...input}>
      <Funnel size={10} />
    </CustomEdge>
  );
}
