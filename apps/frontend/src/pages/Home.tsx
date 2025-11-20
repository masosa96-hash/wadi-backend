import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import WadiOrb from "../components/WadiOrb";
import SearchBar from "../components/SearchBar";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { conversations, loadConversations, loadingConversations } = useChatStore();
  const [inputMessage, setInputMessage] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Single default workspace
  const defaultWorkspace = {
    id: "default",
    name: "Conversa con WADI",
    icon: "💬",
    color: "#255FF5"
  };

  const quickActions = [
    { label: "Historial", active: false, path: "/projects" },
    { label: "Favoritos", active: false, path: "/favorites" },
    { label: "Plantillas rápidas", active: false, path: "/templates" },
  ];

  const handleWorkspaceClick = () => {
    // If there are recent conversations, navigate to the most recent one
    if (conversations.length > 0) {
      const mostRecent = conversations[0];
      navigate("/chat", { state: { conversationId: mostRecent.id } });
    } else {
      // Otherwise, go to a new chat
      navigate("/chat");
    }
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      // Navigate to chat with initial message
      navigate("/chat", { state: { initialMessage: inputMessage.trim() } });
      setInputMessage("");
    }
  };

  return (
    <PhoneShell>
      {/* Header */}
      <header
        style={{
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.colors.border.light}`,
          background: theme.colors.background.secondary,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Logo with gradient */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: theme.typography.fontWeight.bold,
            letterSpacing: "0.8px",
            background: theme.gradients.primary,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          WADI
        </div>

        {/* Right Icons */}
        <div style={{ display: "flex", gap: theme.spacing.md, alignItems: "center" }}>
          {/* Search Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(!showSearch)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: theme.spacing.sm,
            }}
          >
            <span style={{ fontSize: "20px" }}>🔍</span>
          </motion.button>

          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              position: "relative",
              padding: theme.spacing.sm,
            }}
          >
            <span style={{ fontSize: "20px" }}>🔔</span>
            {/* Notification Badge with glow */}
            <span
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "8px",
                height: "8px",
                background: theme.colors.error,
                borderRadius: "50%",
                border: `2px solid ${theme.colors.background.secondary}`,
                boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
              }}
            />
          </motion.button>

          {/* Avatar with gradient border */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: theme.gradients.button,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: theme.typography.fontWeight.semibold,
              cursor: "pointer",
              boxShadow: "0 0 16px rgba(37, 95, 245, 0.3)",
              position: "relative",
            }}
            onClick={() => navigate("/settings")}
          >
            {user?.email?.charAt(0).toUpperCase() || "U"}
            {/* Subtle inner glow */}
            <div
              style={{
                position: "absolute",
                inset: "4px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: `${theme.spacing.lg} ${theme.spacing.lg}`, paddingBottom: "100px" }}>
        {/* Search Bar - Appears when search icon clicked */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginBottom: theme.spacing.lg,
            }}
          >
            <SearchBar onClose={() => setShowSearch(false)} autoFocus />
          </motion.div>
        )}

        {/* Notifications Panel - Glassmorphism */}
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-surface-heavy"
            style={{
              borderRadius: theme.borderRadius.large,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              boxShadow: "0 12px 48px rgba(15, 23, 42, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.h3,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}
              >
                Notificaciones
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.body,
                color: theme.colors.text.secondary,
                textAlign: "center",
                padding: theme.spacing.lg,
              }}
            >
              Pronto vas a ver tus recordatorios y alertas acá.
            </p>
          </motion.div>
        )}

        {/* Hero Card - Enhanced Glassmorphism with WADI Orb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            position: "relative",
            background: theme.gradients.hero,
            borderRadius: theme.borderRadius.large,
            padding: `${theme.spacing['2xl']} ${theme.spacing.xl}`,
            marginBottom: theme.spacing['2xl'],
            overflow: "hidden",
            boxShadow: `
              0 20px 40px rgba(37, 95, 245, 0.2),
              0 0 60px rgba(123, 140, 255, 0.15)
            `,
          }}
        >
          {/* Glassmorphism overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(10px)",
              pointerEvents: "none",
            }}
          />

          {/* Floating Y2K orbs inside hero */}
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "-40px",
              width: "140px",
              height: "140px",
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(25px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-30px",
              right: "-30px",
              width: "120px",
              height: "120px",
              background: "radial-gradient(circle, rgba(197, 179, 255, 0.3) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* WADI Orb - using component */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: theme.spacing.lg }}>
              <WadiOrb size="medium" showPulse={true} />
            </div>

            <h2
              style={{
                margin: 0,
                marginBottom: theme.spacing.lg,
                fontSize: "28px",
                fontWeight: theme.typography.fontWeight.bold,
                color: "#FFFFFF",
                textAlign: "center",
                textShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
                lineHeight: 1.3,
              }}
            >
              Hola, soy WADI. ¿Qué hacemos hoy?
            </h2>

            {/* Message Input Form - Enhanced */}
            <form onSubmit={handleMessageSubmit}>
              <motion.div
                whileHover={{ boxShadow: "0 8px 24px rgba(15, 23, 42, 0.15)" }}
                style={{
                  background: "rgba(255, 255, 255, 0.98)",
                  borderRadius: "18px",
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.md,
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  transition: theme.transitions.medium,
                }}
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Contame qué necesitás…"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: theme.typography.fontSize.body,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily.primary,
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.08, boxShadow: "0 0 20px rgba(37, 95, 245, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: theme.gradients.button,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "20px",
                    transition: theme.transitions.fast,
                    boxShadow: "0 0 16px rgba(37, 95, 245, 0.3)",
                  }}
                >
                  ✈️
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Workspaces Section - Simplified */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: theme.spacing.xl }}
        >
          <h3
            style={{
              margin: 0,
              marginBottom: theme.spacing.lg,
              fontSize: "20px",
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              letterSpacing: "-0.02em",
            }}
          >
            Lo que venimos trabajando
          </h3>

          {/* Single main workspace with glassmorphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.015, boxShadow: "0 16px 48px rgba(37, 95, 245, 0.18)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWorkspaceClick}
            className="glass-surface"
            style={{
              borderRadius: theme.borderRadius.large,
              padding: theme.spacing.xl,
              cursor: "pointer",
              transition: theme.transitions.medium,
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

            {/* Subtle orb background */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                background: "radial-gradient(circle, rgba(37, 95, 245, 0.08) 0%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(30px)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Icon with gradient background */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${defaultWorkspace.color}15 0%, ${defaultWorkspace.color}25 100%)`,
                  border: `2px solid ${defaultWorkspace.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  marginBottom: theme.spacing.md,
                  boxShadow: `0 4px 12px ${defaultWorkspace.color}20`,
                }}
              >
                {defaultWorkspace.icon}
              </div>

              {/* Workspace Name */}
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xs,
                  letterSpacing: "-0.01em",
                }}
              >
                {defaultWorkspace.name}
              </div>
              
              {/* Subtitle */}
              <div
                style={{
                  fontSize: theme.typography.fontSize.bodySmall,
                  color: theme.colors.text.tertiary,
                  fontWeight: theme.typography.fontWeight.normal,
                }}
              >
                Tu espacio principal de trabajo
              </div>
            </div>
          </motion.div>

          {/* Empty state hint - wallet-style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
              textAlign: "center",
              fontSize: theme.typography.fontSize.bodySmall,
              color: theme.colors.text.tertiary,
            }}
          >
            WADI creará nuevos espacios dinámicamente según tus necesidades
          </motion.div>

          {/* Recent Conversations - Wallet-style feed */}
          {!loadingConversations && conversations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                marginTop: theme.spacing.xl,
              }}
            >
              <h4
                style={{
                  margin: 0,
                  marginBottom: theme.spacing.md,
                  fontSize: theme.typography.fontSize.h3,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.secondary,
                }}
              >
                Últimas conversaciones
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.sm,
                }}
              >
                {conversations.slice(0, 5).map((conv, index) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    whileHover={{ x: 4, backgroundColor: "rgba(37, 95, 245, 0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/chat", { state: { conversationId: conv.id } })}
                    className="glass-surface"
                    style={{
                      borderRadius: theme.borderRadius.medium,
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      cursor: "pointer",
                      transition: theme.transitions.fast,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: theme.typography.fontSize.body,
                            fontWeight: theme.typography.fontWeight.medium,
                            color: theme.colors.text.primary,
                            marginBottom: theme.spacing.xs,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {conv.title || "Conversación sin título"}
                        </div>
                        <div
                          style={{
                            fontSize: theme.typography.fontSize.caption,
                            color: theme.colors.text.tertiary,
                          }}
                        >
                          {conv.message_count} {conv.message_count === 1 ? "mensaje" : "mensajes"} •{" "}
                          {new Date(conv.updated_at).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          color: theme.colors.text.tertiary,
                        }}
                      >
                        ›
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Quick Actions Chips - Web3 style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            display: "flex",
            gap: theme.spacing.sm,
            flexWrap: "wrap",
            marginBottom: theme.spacing['2xl'],
          }}
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05, borderColor: theme.colors.accent.primary, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => action.path && navigate(action.path)}
              style={{
                background: action.active 
                  ? theme.gradients.button
                  : "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
                border: `1.5px solid ${action.active ? theme.colors.accent.primary : theme.colors.border.accent}`,
                borderRadius: "24px",
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                fontSize: theme.typography.fontSize.bodySmall,
                fontWeight: theme.typography.fontWeight.medium,
                color: action.active ? "#FFFFFF" : theme.colors.text.secondary,
                cursor: "pointer",
                transition: theme.transitions.fast,
                fontFamily: theme.typography.fontFamily.primary,
                boxShadow: action.active 
                  ? "0 4px 12px rgba(37, 95, 245, 0.25)" 
                  : "0 2px 8px rgba(15, 23, 42, 0.06)",
              }}
            >
              {action.label}
            </motion.button>
          ))}
        </motion.div>
      </main>

      {/* Bottom Navigation Bar - Web3 Enhanced */}
      <BottomNav />
    </PhoneShell>
  );
}
