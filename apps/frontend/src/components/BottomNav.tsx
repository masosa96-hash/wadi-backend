import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";
import { useAuthStore } from "../store/authStore";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isGuestMode = import.meta.env.VITE_GUEST_MODE === 'true' && !user;

  // Guest mode: only show chat
  const navItems = isGuestMode
    ? [{ icon: "💬", label: "Chat", path: "/chat" }]
    : [
      { icon: "🏠", label: "Inicio", path: "/home" },
      { icon: "💬", label: "Chat", path: "/chat" },
      { icon: "📜", label: "Historial", path: "/projects" },
      { icon: "👤", label: "Perfil", path: "/settings" },
    ];

  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        background: theme.colors.background.primary,
        borderTop: `1px solid ${theme.colors.border.subtle}`,
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path ||
          (item.path === "/home" && location.pathname === "/");

        return (
          <motion.button
            key={index}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: theme.spacing.sm,
              position: "relative",
              flex: 1,
            }}
          >
            <span
              style={{
                fontSize: "24px",
                color: isActive ? theme.colors.text.primary : theme.colors.text.tertiary,
                transition: theme.transitions.default,
              }}
            >
              {item.icon}
            </span>

            <span
              style={{
                fontSize: "10px",
                color: isActive ? theme.colors.text.primary : theme.colors.text.tertiary,
                fontWeight: isActive ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
                transition: theme.transitions.default,
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
