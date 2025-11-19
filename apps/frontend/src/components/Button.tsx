import type { CSSProperties, ReactNode } from "react";
import { theme } from "../styles/theme";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
  style = {},
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semibold,
    borderRadius: theme.borderRadius.small,
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: theme.transitions.fast,
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      background: disabled ? theme.colors.text.tertiary : theme.gradients.accent,
      color: disabled ? theme.colors.text.secondary : '#000',
    },
    secondary: {
      background: theme.colors.background.tertiary,
      border: `1px solid ${theme.colors.border.subtle}`,
      color: theme.colors.text.primary,
    },
    ghost: {
      background: 'transparent',
      border: `1px solid ${theme.colors.border.subtle}`,
      color: theme.colors.text.primary,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.filter = 'brightness(1.1)';
          } else {
            e.currentTarget.style.borderColor = theme.colors.border.accent;
            e.currentTarget.style.background = theme.colors.background.secondary;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.filter = 'none';
          if (variant === 'secondary') {
            e.currentTarget.style.borderColor = theme.colors.border.subtle;
            e.currentTarget.style.background = theme.colors.background.tertiary;
          } else if (variant === 'ghost') {
            e.currentTarget.style.borderColor = theme.colors.border.subtle;
            e.currentTarget.style.background = 'transparent';
          }
        }
      }}
    >
      {children}
    </button>
  );
}
