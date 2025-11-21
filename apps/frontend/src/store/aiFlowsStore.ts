import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AIPreset, SYSTEM_PRESETS } from "../types/aiFlows";

interface AIFlowsState {
    presets: AIPreset[];
    selectedPreset: AIPreset | null;

    // Actions
    createPreset: (preset: Omit<AIPreset, "id">) => void;
    deletePreset: (id: string) => void;
    selectPreset: (id: string | null) => void;
}

export const useAIFlowsStore = create<AIFlowsState>()(
    persist(
        (set, get) => ({
            presets: [...SYSTEM_PRESETS],
            selectedPreset: null,

            createPreset: (presetData) => {
                const newPreset: AIPreset = {
                    ...presetData,
                    id: `preset_${Date.now()}`,
                };
                set((state) => ({ presets: [...state.presets, newPreset] }));
            },

            deletePreset: (id) => {
                // Don't delete system presets
                if (SYSTEM_PRESETS.some(p => p.id === id)) return;

                set((state) => ({
                    presets: state.presets.filter((p) => p.id !== id),
                }));
            },

            selectPreset: (id) => {
                if (!id) {
                    set({ selectedPreset: null });
                    return;
                }
                const preset = get().presets.find((p) => p.id === id) || null;
                set({ selectedPreset: preset });
            },
        }),
        {
            name: "wadi-aiflows-storage",
        }
    )
);
