import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { theme } from "../styles/theme";

export interface ToastProps {
  message: string;
  variant?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ 
  message, 
  variant = "info", 
  duration = 5000,
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300); // Match animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const variantStyles: Record<typeof variant, CSSProperties> = {
    success: {
      backgroundColor: "#10b981",
      borderColor: "#059669",
    },
    error: {
      backgroundColor: "#ef4444",
      borderColor: "#dc2626",
    },
    warning: {
      backgroundColor: "#f59e0b",
      borderColor: "#d97706",
    },
    info: {
      backgroundColor: theme.colors.accent.primary,
      borderColor: theme.colors.accent.secondary,
    },
  };

  const containerStyle: CSSProperties = {
    position: "fixed",
    top: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 9999,
    minWidth: "300px",
    maxWidth: "500px",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    border: `1px solid ${variantStyles[variant].borderColor}`,
    backgroundColor: variantStyles[variant].backgroundColor,
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.body,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? "translateX(400px)" : "translateX(0)",
    transition: "all 0.3s ease-in-out",
  };

  const closeButtonStyle: CSSProperties = {
    background: "transparent",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "20px",
    padding: "0",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  };

  return (
    <div style={containerStyle}>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            onClose?.();
          }, 300);
        }}
        style={closeButtonStyle}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
