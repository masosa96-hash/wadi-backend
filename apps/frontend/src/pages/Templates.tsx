import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";
import { useTemplatesStore } from "../store/templatesStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";

export default function Templates() {
  const navigate = useNavigate();
  const { templates, loading, error, loadTemplates } = useTemplatesStore();

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleTemplateClick = (prompt: string) => {
    // Navigate to chat with the template prompt pre-filled
    navigate("/chat", { state: { templatePrompt: prompt } });
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  const categoryLabels = {
    general: "General",
    social: "Redes sociales",
    productivity: "Productividad",
  };

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
              Plantillas rápidas
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.bodySmall,
                color: theme.colors.text.secondary,
              }}
            >
              Arrancá rápido con estos modelos
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
            <div style={{ fontSize: "48px", animation: "pulse 1.5s infinite" }}>✨</div>
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

        {/* Templates by Category */}
        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing['2xl'] }}>
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category}>
                <h3
                  style={{
                    margin: 0,
                    marginBottom: theme.spacing.md,
                    fontSize: theme.typography.fontSize.h3,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: theme.spacing.md,
                  }}
                >
                  {categoryTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleTemplateClick(template.prompt)}
                      className="glass-surface"
                      style={{
                        borderRadius: theme.borderRadius.large,
                        padding: theme.spacing.lg,
                        cursor: "pointer",
                        transition: theme.transitions.fast,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: theme.spacing.sm,
                        minHeight: "140px",
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          fontSize: "40px",
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        {template.icon}
                      </div>

                      {/* Name */}
                      <div
                        style={{
                          fontSize: theme.typography.fontSize.body,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.text.primary,
                        }}
                      >
                        {template.name}
                      </div>

                      {/* Description */}
                      <div
                        style={{
                          fontSize: theme.typography.fontSize.caption,
                          color: theme.colors.text.tertiary,
                          lineHeight: 1.4,
                        }}
                      >
                        {template.description}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && templates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
              padding: `${theme.spacing['2xl']} ${theme.spacing.lg}`,
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: theme.spacing.lg }}>✨</div>
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.body,
                color: theme.colors.text.secondary,
              }}
            >
              No hay plantillas disponibles en este momento
            </p>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </PhoneShell>
  );
}
