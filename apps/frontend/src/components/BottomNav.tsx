import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
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
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        borderTop: `1px solid ${theme.colors.border.light}`,
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        boxShadow: "0 -4px 24px rgba(15, 23, 42, 0.08), 0 0 40px rgba(37, 95, 245, 0.04)",
      }}
    >
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path || 
                        (item.path === "/home" && location.pathname === "/");
        
        return (
          <motion.button
            key={index}
            onClick={() => navigate(item.path)}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
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
              transition: theme.transitions.fast,
            }}
          >
            {/* Icon with gradient shadow and glow when active */}
            <motion.span
              animate={isActive ? {
                y: [-1, 0, -1],
              } : {}}
              transition={isActive ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              } : {}}
              style={{
                fontSize: "24px",
                filter: isActive 
                  ? `drop-shadow(0 0 8px ${theme.colors.accent.primary}) drop-shadow(0 0 16px ${theme.colors.accent.y2k})`
                  : "none",
                transition: theme.transitions.fast,
              }}
            >
              {item.icon}
            </motion.span>
            
            {/* Label with gradient color when active */}
            <span
              style={{
                fontSize: theme.typography.fontSize.caption,
                color: isActive ? theme.colors.accent.primary : theme.colors.text.tertiary,
                fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
                transition: theme.transitions.fast,
              }}
            >
              {item.label}
            </span>
            
            {/* Active indicator with gradient and glow */}
            {isActive && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "36px",
                  height: "3px",
                  borderRadius: "2px",
                  background: theme.gradients.primary,
                  boxShadow: "0 0 16px rgba(37, 95, 245, 0.6), 0 0 24px rgba(197, 179, 255, 0.4)",
                }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
