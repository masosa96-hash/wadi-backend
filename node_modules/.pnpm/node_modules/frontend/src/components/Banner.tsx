import type { CSSProperties } from "react";
import { theme } from "../styles/theme";

export interface BannerProps {
  message: string;
  variant?: "error" | "warning" | "info";
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Banner({ message, variant = "info", onClose, action }: BannerProps) {
  const variantStyles: Record<typeof variant, CSSProperties> = {
    error: {
      backgroundColor: "#7f1d1d",
      borderColor: "#991b1b",
      color: "#fecaca",
    },
    warning: {
      backgroundColor: "#78350f",
      borderColor: "#92400e",
      color: "#fde68a",
    },
    info: {
      backgroundColor: "#1e3a5f",
      borderColor: "#1e40af",
      color: "#bfdbfe",
    },
  };

  const containerStyle: CSSProperties = {
    width: "100%",
    padding: theme.spacing.md,
    borderLeft: `4px solid ${variantStyles[variant].borderColor}`,
    backgroundColor: variantStyles[variant].backgroundColor,
    color: variantStyles[variant].color,
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.body,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.lg,
  };

  const actionsStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.md,
  };

  const buttonStyle: CSSProperties = {
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    border: "1px solid currentColor",
    borderRadius: theme.borderRadius.small,
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: theme.typography.fontSize.bodySmall,
    fontWeight: theme.typography.fontWeight.medium,
    whiteSpace: "nowrap",
  };

  const closeButtonStyle: CSSProperties = {
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontSize: "20px",
    padding: "0",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  };

  return (
    <div style={containerStyle} role="alert">
      <span style={{ flex: 1 }}>{message}</span>
      <div style={actionsStyle}>
        {action && (
          <button onClick={action.onClick} style={buttonStyle}>
            {action.label}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
