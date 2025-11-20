import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../styles/theme";
import { useFavoritesStore } from "../store/favoritesStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, loading, error, loadFavorites } = useFavoritesStore();

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <PhoneShell>
      {/* Header */}
      <header
        style={{
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          borderBottom: `1px solid ${theme.colors.border.light}`,
          background: theme.colors.background.secondary,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              padding: theme.spacing.xs,
            }}
          >
            ←
          </motion.button>

          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                letterSpacing: "-0.02em",
              }}
            >
              Favoritos
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.bodySmall,
                color: theme.colors.text.secondary,
              }}
            >
              Mensajes que guardaste
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: `${theme.spacing.lg}`, paddingBottom: "100px" }}>
        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: `${theme.spacing['2xl']} 0`,
            }}
          >
            <div style={{ fontSize: "48px", animation: "pulse 1.5s infinite" }}>⭐</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-surface"
            style={{
              borderRadius: theme.borderRadius.medium,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              textAlign: "center",
              color: theme.colors.error,
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: theme.spacing.sm }}>😕</div>
            <div>{error}</div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
              padding: `${theme.spacing['2xl']} ${theme.spacing.lg}`,
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: theme.spacing.lg }}>⭐</div>
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.md,
                fontSize: theme.typography.fontSize.h3,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
              }}
            >
              Todavía no guardaste nada
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.body,
                color: theme.colors.text.secondary,
                lineHeight: 1.6,
              }}
            >
              Cuando algo te sirva, marcá ⭐ en el chat y lo vas a encontrar acá
            </p>
          </motion.div>
        )}

        {/* Favorites List */}
        {!loading && favorites.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
            <AnimatePresence>
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/chat", { state: { conversationId: favorite.conversation_id } })}
                  className="glass-surface"
                  style={{
                    borderRadius: theme.borderRadius.large,
                    padding: theme.spacing.lg,
                    cursor: "pointer",
                    position: "relative",
                    transition: theme.transitions.fast,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: theme.spacing.md,
                      right: theme.spacing.md,
                      fontSize: "20px",
                    }}
                  >
                    ⭐
                  </div>
                  
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.body,
                      color: theme.colors.text.primary,
                      lineHeight: 1.6,
                      marginBottom: theme.spacing.sm,
                      paddingRight: theme.spacing.xl,
                    }}
                  >
                    {favorite.messages?.content || "Mensaje sin contenido"}
                  </div>
                  
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.caption,
                      color: theme.colors.text.tertiary,
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.xs,
                    }}
                  >
                    <span>
                      {new Date(favorite.created_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {favorite.messages?.conversations?.title && (
                      <>
                        <span>•</span>
                        <span>{favorite.messages.conversations.title}</span>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </PhoneShell>
  );
}
