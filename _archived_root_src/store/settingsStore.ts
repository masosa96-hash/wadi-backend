import { create } from "zustand";

type SettingsState = {
  open: boolean;
  sendOnEnter: boolean;
  language: "es" | "en";
  togglePanel: () => void;
  toggleSendMode: () => void;
  setLanguage: (lang: "es" | "en") => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  open: false,
  sendOnEnter: false,
  language: "es",
  togglePanel: () => set((s) => ({ open: !s.open })),
  toggleSendMode: () => set((s) => ({ sendOnEnter: !s.sendOnEnter })),
  setLanguage: (lang) => set({ language: lang }),
}));
