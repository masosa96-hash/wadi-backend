// WADI Theme Hook - Dynamic theme with user customization
import { useMemo } from 'react';
import { theme as baseTheme } from '../styles/theme';
import { useThemeStore, accentColors } from '../store/themeStore';

export function useTheme() {
    const { accentColor } = useThemeStore();

    return useMemo(() => ({
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            accent: {
                ...baseTheme.colors.accent,
                highlight: accentColors[accentColor], // Dynamic accent color
            },
        },
    }), [accentColor]);
}
