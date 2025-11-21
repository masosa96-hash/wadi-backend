import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import SearchBar from "../components/SearchBar";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { conversations, loadConversations, loadingConversations } = useChatStore();
  const [inputMessage, setInputMessage] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
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
          background: theme.colors.background.primary,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            letterSpacing: "-0.02em",
          }}
        >
          WADI
        </div>

        <div style={{ display: "flex", gap: theme.spacing.md, alignItems: "center" }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(!showSearch)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: theme.spacing.sm,
              color: theme.colors.text.primary,
            }}
          >
            <span style={{ fontSize: "20px" }}>🔍</span>
          </motion.button>

          <motion.div
            whileTap={{ scale: 0.95 }}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: theme.colors.accent.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.colors.text.inverse,
              fontSize: "14px",
              fontWeight: theme.typography.fontWeight.medium,
              cursor: "pointer",
            }}
            onClick={() => navigate("/settings")}
          >
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: theme.spacing.lg, paddingBottom: "100px" }}>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: theme.spacing.lg }}
          >
            <SearchBar onClose={() => setShowSearch(false)} autoFocus />
          </motion.div>
        )}

        {/* Hero Section */}
        <div style={{ marginTop: theme.spacing['2xl'], marginBottom: theme.spacing['4xl'], textAlign: "center" }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.md,
              letterSpacing: "-0.03em",
            }}
          >
            Hola, soy WADI.
          </h2>
          <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.base }}>
            ¿En qué puedo ayudarte hoy?
          </p>
        </div>

        {/* Input Area */}
        <form onSubmit={handleMessageSubmit} style={{ marginBottom: theme.spacing['3xl'] }}>
          <div
            style={{
              background: theme.colors.background.tertiary,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.md,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.md,
              boxShadow: theme.shadows.sm,
              border: `1px solid ${theme.colors.border.subtle}`,
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribí tu mensaje..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.primary,
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              style={{
                background: inputMessage.trim() ? theme.colors.accent.primary : theme.colors.background.secondary,
                color: inputMessage.trim() ? theme.colors.text.inverse : theme.colors.text.tertiary,
                border: "none",
                borderRadius: theme.borderRadius.sm,
                padding: "8px",
                cursor: inputMessage.trim() ? "pointer" : "default",
                transition: theme.transitions.default,
              }}
            >
              ➜
            </button>
          </div>
        </form>

        {/* Recent Conversations */}
        {!loadingConversations && conversations.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.tertiary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: theme.spacing.md,
              }}
            >
              Recientes
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
              {conversations.slice(0, 5).map((conv) => (
                <motion.div
                  key={conv.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/chat", { state: { conversationId: conv.id } })}
                  style={{
                    padding: theme.spacing.md,
                    background: theme.colors.background.primary,
                    border: `1px solid ${theme.colors.border.subtle}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.base,
                      color: theme.colors.text.primary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "80%",
                    }}
                  >
                    {conv.title || "Nueva conversación"}
                  </span>
                  <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.tertiary }}>
                    {new Date(conv.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </PhoneShell>
  );
}
