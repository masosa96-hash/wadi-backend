import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";
import { useAuthStore } from "../store/authStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { useState } from "react";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <PhoneShell>
      <div
        style={{
          padding: theme.spacing.xl,
          minHeight: "100vh",
          paddingBottom: "100px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: theme.spacing['2xl'],
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              marginRight: theme.spacing.md,
            }}
          >
            ←
          </motion.button>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: theme.typography.fontWeight.bold,
              background: theme.gradients.primary,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Ajustes
          </h1>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(16px) saturate(180%)",
            border: "1px solid rgba(214, 225, 242, 0.5)",
            borderRadius: theme.borderRadius.large,
            padding: theme.spacing.xl,
            marginBottom: theme.spacing.lg,
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gradient accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: theme.gradients.primary,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                margin: 0,
                marginBottom: theme.spacing.lg,
                fontSize: theme.typography.fontSize.h3,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
              }}
            >
              Tu perfil
            </h2>

            {/* User Avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.lg,
                marginBottom: theme.spacing.xl,
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: theme.gradients.button,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "24px",
                  fontWeight: theme.typography.fontWeight.bold,
                  boxShadow: "0 0 24px rgba(37, 95, 245, 0.3)",
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.h3,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {user?.user_metadata?.display_name || "Usuario"}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.bodySmall,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.md,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.caption,
                    color: theme.colors.text.tertiary,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  Email
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.body,
                    color: theme.colors.text.primary,
                  }}
                >
                  {user?.email}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.caption,
                    color: theme.colors.text.tertiary,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  Usuario desde
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.body,
                    color: theme.colors.text.primary,
                  }}
                >
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(16px) saturate(180%)",
            border: "1px solid rgba(214, 225, 242, 0.5)",
            borderRadius: theme.borderRadius.large,
            padding: theme.spacing.xl,
            marginBottom: theme.spacing.lg,
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: theme.spacing.md,
              fontSize: theme.typography.fontSize.h3,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}
          >
            Preferencias
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: theme.typography.fontSize.bodySmall,
              color: theme.colors.text.secondary,
              fontStyle: "italic",
            }}
          >
            Las opciones de personalización van a estar disponibles pronto
          </p>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(239, 68, 68, 0.25)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(16px) saturate(180%)",
              border: `2px solid ${theme.colors.error}`,
              borderRadius: theme.borderRadius.large,
              padding: theme.spacing.lg,
              color: theme.colors.error,
              fontSize: theme.typography.fontSize.body,
              fontWeight: theme.typography.fontWeight.semibold,
              cursor: isLoggingOut ? "not-allowed" : "pointer",
              transition: theme.transitions.default,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.sm,
              opacity: isLoggingOut ? 0.6 : 1,
            }}
          >
            <span>{isLoggingOut ? "⏳" : "🚪"}</span>
            {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </motion.button>
        </motion.div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </PhoneShell>
  );
}
