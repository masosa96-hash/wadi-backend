import { useEffect, useState } from "react";
import { theme } from "../styles/theme";

export default function ConnectionIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: isOnline 
          ? "rgba(34, 197, 94, 0.95)" 
          : "rgba(239, 68, 68, 0.95)",
        color: "#FFFFFF",
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        borderRadius: theme.borderRadius.full,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        boxShadow: theme.shadows.lg,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.sm,
        animation: "slideUp 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "16px" }}>
        {isOnline ? "🟢" : "🔴"}
      </span>
      {isOnline ? "Conexión restaurada" : "Sin conexión a internet"}
      
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
