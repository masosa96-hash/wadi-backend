import type { CSSProperties } from "react";
import { theme } from "../styles/theme";

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  style?: CSSProperties;
}

export default function Card({ children, onClick, hoverable = false, style = {} }: CardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      style={{
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.subtle}`,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.xl,
        cursor: isClickable ? 'pointer' : 'default',
        transition: theme.transitions.fast,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverable || isClickable) {
          e.currentTarget.style.borderColor = theme.colors.accent.primary;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || isClickable) {
          e.currentTarget.style.borderColor = style?.borderColor as string || theme.colors.border.subtle;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
}
