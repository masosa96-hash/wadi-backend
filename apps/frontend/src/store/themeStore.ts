import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal';

interface ThemeState {
    accentColor: AccentColor;
    setAccentColor: (color: AccentColor) => void;
}

export const accentColors: Record<AccentColor, string> = {
    blue: '#3B82F6',
    green: '#10B981',
    purple: '#8B5CF6',
    orange: '#F59E0B',
    pink: '#EC4899',
    teal: '#14B8A6',
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            accentColor: 'blue',
            setAccentColor: (color) => set({ accentColor: color }),
        }),
        {
            name: 'wadi-theme-storage',
        }
    )
);
