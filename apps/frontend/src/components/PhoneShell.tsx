import type { ReactNode } from "react";
import { theme } from "../styles/theme";

interface PhoneShellProps {
  children: ReactNode;
  showBackgroundOrbs?: boolean; // Kept for compatibility but unused
}

/**
 * PhoneShell -> AppLayout
 * A responsive layout wrapper for the application.
 */
export default function PhoneShell({ children }: PhoneShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.primary,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "100%", // Full width
          margin: "0 auto",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}
