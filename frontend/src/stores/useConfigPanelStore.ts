import { create } from "zustand";

type ConfigPanelState = {
  isConfigPanelOpen: boolean;
  openConfigPanel: () => void;
  closeConfigPanel: () => void;
};

export const useConfigPanel = create<ConfigPanelState>((set) => ({
  isConfigPanelOpen: false,
  openConfigPanel: () => {
    set({ isConfigPanelOpen: true });
  },
  closeConfigPanel: () => {
    set({ isConfigPanelOpen: false });
  },
}));
