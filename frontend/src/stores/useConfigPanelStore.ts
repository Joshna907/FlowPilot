import { create } from "zustand";
import type { NodeType } from "./useWorkflowStore";

type ConfigPanelState = {
  isConfigPanelOpen: boolean;
  currentConfigPanelNodeForm: NodeType | undefined;

  setCurrentConfigPanelNodeForm: (nodeType: NodeType) => void;
  openConfigPanel: () => void;
  closeConfigPanel: () => void;
};

export const useConfigPanel = create<ConfigPanelState>((set) => ({
  isConfigPanelOpen: false,
  currentConfigPanelNodeForm: undefined,

  setCurrentConfigPanelNodeForm: (nodeType: NodeType) => {
    set({ currentConfigPanelNodeForm: nodeType });
  },
  openConfigPanel: () => {
    set({ isConfigPanelOpen: true });
  },
  closeConfigPanel: () => {
    set({ isConfigPanelOpen: false, currentConfigPanelNodeForm: undefined });
  },
}));
