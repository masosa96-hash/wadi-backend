import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark" | "auto";

interface ThemeState {
    mode: ThemeMode;
    effectiveTheme: "light" | "dark";

    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

// Detect system preference
function getSystemPreference(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Calculate effective theme based on mode
function getEffectiveTheme(mode: ThemeMode): "light" | "dark" {
    if (mode === "auto") {
        return getSystemPreference();
    }
    return mode;
}

// Apply theme to document
function applyTheme(theme: "light" | "dark") {
    if (typeof document === "undefined") return;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => {
            // Listen for system preference changes
            if (typeof window !== "undefined") {
                window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
                    const { mode } = get();
                    if (mode === "auto") {
                        const newTheme = e.matches ? "dark" : "light";
                        set({ effectiveTheme: newTheme });
                        applyTheme(newTheme);
                    }
                });
            }

            const initialMode: ThemeMode = "auto";
            const initialTheme = getEffectiveTheme(initialMode);
            applyTheme(initialTheme);

            return {
                mode: initialMode,
                effectiveTheme: initialTheme,

                setMode: (mode) => {
                    const effectiveTheme = getEffectiveTheme(mode);
                    set({ mode, effectiveTheme });
                    applyTheme(effectiveTheme);
                },

                toggleTheme: () => {
                    const { effectiveTheme } = get();
                    const newMode = effectiveTheme === "light" ? "dark" : "light";
                    set({ mode: newMode, effectiveTheme: newMode });
                    applyTheme(newMode);
                },
            };
        },
        {
            name: "wadi-theme-storage",
            partialize: (state) => ({ mode: state.mode }),
        }
    )
);
