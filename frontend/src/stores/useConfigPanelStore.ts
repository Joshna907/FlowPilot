import { create } from "zustand";
import type { EdgeType, NodeType } from "./useWorkflowStore";

type ConfigPanelState = {
  isNodeConfigPanelOpen: boolean;
  isEdgeConfigPanelOpen: boolean;
  currentConfigPanelNodeForm: NodeType | undefined;
  currentConfigPanelEdgeForm: EdgeType | undefined;

  setCurrentConfigPanelNodeForm: (nodeType: NodeType | undefined) => void;
  setCurrentConfigPanelEdgeForm: (edgeType: EdgeType | undefined) => void;
  openNodeConfigPanel: () => void;
  openEdgeConfigPanel: () => void;
  closeConfigPanel: () => void;
};

export const useConfigPanel = create<ConfigPanelState>((set) => ({
  isNodeConfigPanelOpen: false,
  isEdgeConfigPanelOpen: false,
  currentConfigPanelNodeForm: undefined,
  currentConfigPanelEdgeForm: undefined,

  setCurrentConfigPanelNodeForm: (nodeType: NodeType | undefined) => {
    set({ currentConfigPanelNodeForm: nodeType });
  },
  setCurrentConfigPanelEdgeForm: (edgeType: EdgeType | undefined) => {
    set({ currentConfigPanelEdgeForm: edgeType });
  },
  openNodeConfigPanel: () => {
    set({ isNodeConfigPanelOpen: true });
  },
  openEdgeConfigPanel: () => {
    set({ isEdgeConfigPanelOpen: true });
  },
  closeConfigPanel: () => {
    set({
      isNodeConfigPanelOpen: false,
      isEdgeConfigPanelOpen: false,
      currentConfigPanelNodeForm: undefined,
      currentConfigPanelEdgeForm: undefined,
    });
  },
}));
