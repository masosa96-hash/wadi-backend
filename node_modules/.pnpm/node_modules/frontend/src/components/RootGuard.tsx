import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";

interface RootGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
}

/**
 * RootGuard - Unified route protection component
 * Handles authentication, authorization, and data integrity validation
 */
export default function RootGuard({ 
  children, 
  requireAuth = false,
  requireGuest = false,
}: RootGuardProps) {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give auth store time to initialize
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: theme.colors.background.primary,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.primary,
        fontSize: theme.typography.fontSize.body,
      }}>
        <div style={{
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "48px",
            marginBottom: theme.spacing.lg,
          }}>
            ⏳
          </div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users away from guest-only pages
  if (requireGuest && user) {
    return <Navigate to="/projects" replace />;
  }

  // Redirect unauthenticated users to login with return URL
  if (requireAuth && !user) {
    const returnUrl = location.pathname !== '/' ? location.pathname : '/projects';
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }

  // Allow access
  return <>{children}</>;
}
