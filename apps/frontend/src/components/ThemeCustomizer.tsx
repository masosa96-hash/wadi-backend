import { motion } from 'framer-motion';
import { theme } from '../styles/theme';
import { useThemeStore, accentColors, type AccentColor } from '../store/themeStore';

export default function ThemeCustomizer() {
    const { accentColor, setAccentColor } = useThemeStore();

    const colors: { name: string; value: AccentColor; hex: string }[] = [
        { name: 'Azul', value: 'blue', hex: accentColors.blue },
        { name: 'Verde', value: 'green', hex: accentColors.green },
        { name: 'Violeta', value: 'purple', hex: accentColors.purple },
        { name: 'Naranja', value: 'orange', hex: accentColors.orange },
        { name: 'Rosa', value: 'pink', hex: accentColors.pink },
        { name: 'Turquesa', value: 'teal', hex: accentColors.teal },
    ];

    return (
        <div style={{
            padding: theme.spacing.lg,
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border.subtle}`,
        }}>
            <h3 style={{
                margin: `0 0 ${theme.spacing.md} 0`,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
            }}>
                Color de Acento
            </h3>
            <p style={{
                margin: `0 0 ${theme.spacing.lg} 0`,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
            }}>
                Personaliza el color principal de la interfaz
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: theme.spacing.md,
            }}>
                {colors.map((color) => (
                    <motion.button
                        key={color.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAccentColor(color.value)}
                        style={{
                            padding: theme.spacing.md,
                            background: accentColor === color.value
                                ? theme.colors.background.tertiary
                                : 'transparent',
                            border: `2px solid ${accentColor === color.value ? color.hex : theme.colors.border.subtle}`,
                            borderRadius: theme.borderRadius.md,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                            transition: theme.transitions.default,
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: color.hex,
                            boxShadow: accentColor === color.value
                                ? `0 0 0 3px ${color.hex}33`
                                : 'none',
                        }} />
                        <span style={{
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.text.primary,
                            fontWeight: accentColor === color.value
                                ? theme.typography.fontWeight.semibold
                                : theme.typography.fontWeight.normal,
                        }}>
                            {color.name}
                        </span>
                    </motion.button>
                ))}
            </div>

            {accentColor && (
                <div style={{
                    marginTop: theme.spacing.lg,
                    padding: theme.spacing.md,
                    background: theme.colors.background.tertiary,
                    borderRadius: theme.borderRadius.md,
                    borderLeft: `4px solid ${accentColors[accentColor]}`,
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.secondary,
                    }}>
                        💡 El color seleccionado se aplicará a botones, enlaces y elementos destacados
                    </p>
                </div>
            )}
        </div>
    );
}
