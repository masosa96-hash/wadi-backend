import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../styles/theme";
import { useWorkspacesStore } from "../store/workspacesStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";

export default function WorkspacesPage() {
  const navigate = useNavigate();
  const { workspaces, fetchWorkspaces, createWorkspace, deleteWorkspace, loadingStates } = useWorkspacesStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "recent" | "archived">("all");

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      await createWorkspace(newWorkspaceName.trim(), newWorkspaceDescription.trim());
      setShowCreateModal(false);
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!confirm("¿Seguro que querés borrar este espacio? Esto no se puede deshacer.")) {
      return;
    }

    try {
      await deleteWorkspace(workspaceId);
    } catch (error) {
      console.error("Error deleting workspace:", error);
    }
  };

  const filteredWorkspaces = workspaces.filter(w => {
    if (filterMode === "archived") return w.is_archived;
    if (filterMode === "recent") return !w.is_archived && w.last_message_at;
    return !w.is_archived;
  });

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
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
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

          <h1
            style={{
              margin: 0,
              flex: 1,
              fontSize: theme.typography.fontSize.h2,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
            }}
          >
            Tus Espacios
          </h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            style={{
              background: theme.gradients.button,
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "24px",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37, 95, 245, 0.3)",
            }}
          >
            +
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: theme.spacing.sm }}>
          {[
            { key: "all", label: "Todos" },
            { key: "recent", label: "Recientes" },
            { key: "archived", label: "Archivados" },
          ].map((filter) => (
            <motion.button
              key={filter.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterMode(filter.key as any)}
              style={{
                background: filterMode === filter.key ? theme.gradients.button : "transparent",
                color: filterMode === filter.key ? "#FFFFFF" : theme.colors.text.secondary,
                border: `1px solid ${filterMode === filter.key ? "transparent" : theme.colors.border.light}`,
                borderRadius: "20px",
                padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                fontSize: theme.typography.fontSize.bodySmall,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: "pointer",
                transition: theme.transitions.fast,
              }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: theme.spacing.lg, paddingBottom: "100px" }}>
        {loadingStates.fetchWorkspaces ? (
          <div style={{ textAlign: "center", padding: theme.spacing["2xl"], color: theme.colors.text.secondary }}>
            Cargando espacios...
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
              padding: `${theme.spacing["2xl"]} ${theme.spacing.lg}`,
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: theme.spacing.lg }}>📁</div>
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.h3,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
              }}
            >
              {filterMode === "archived" ? "No hay espacios archivados" : "No hay espacios todavía"}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.body,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.lg,
              }}
            >
              {filterMode === "all"
                ? "WADI creará espacios automáticamente o podés crear uno vos"
                : filterMode === "archived"
                  ? "Los espacios archivados aparecerán acá"
                  : "Tus espacios recientes aparecerán acá"}
            </p>
            {filterMode === "all" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: theme.gradients.button,
                  border: "none",
                  borderRadius: "12px",
                  padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                  fontSize: theme.typography.fontSize.body,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 95, 245, 0.3)",
                }}
              >
                Crear Primer Espacio
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
            <AnimatePresence>
              {filteredWorkspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 12px 36px rgba(37, 95, 245, 0.15)" }}
                  onClick={() => navigate(`/workspaces/${workspace.id}`)}
                  className="glass-surface"
                  style={{
                    borderRadius: theme.borderRadius.large,
                    padding: theme.spacing.lg,
                    cursor: "pointer",
                    transition: theme.transitions.default,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Auto-created badge */}
                  {workspace.is_auto_created && (
                    <div
                      style={{
                        position: "absolute",
                        top: theme.spacing.sm,
                        right: theme.spacing.sm,
                        background: "rgba(197, 179, 255, 0.2)",
                        color: theme.colors.accent.secondary,
                        fontSize: theme.typography.fontSize.caption,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: "8px",
                        fontWeight: theme.typography.fontWeight.medium,
                      }}
                    >
                      🤖 Auto
                    </div>
                  )}

                  {/* Workspace Name */}
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: theme.spacing.xs,
                      fontSize: theme.typography.fontSize.h3,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {workspace.name}
                  </h3>

                  {/* Description */}
                  {workspace.description && (
                    <p
                      style={{
                        margin: 0,
                        marginBottom: theme.spacing.sm,
                        fontSize: theme.typography.fontSize.bodySmall,
                        color: theme.colors.text.secondary,
                      }}
                    >
                      {workspace.description}
                    </p>
                  )}

                  {/* Topic Tag */}
                  {workspace.detected_topic && (
                    <div
                      style={{
                        display: "inline-block",
                        background: "rgba(37, 95, 245, 0.1)",
                        color: theme.colors.accent.primary,
                        fontSize: theme.typography.fontSize.caption,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: "6px",
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      {workspace.detected_topic}
                    </div>
                  )}

                  {/* Stats */}
                  <div
                    style={{
                      display: "flex",
                      gap: theme.spacing.lg,
                      fontSize: theme.typography.fontSize.bodySmall,
                      color: theme.colors.text.tertiary,
                    }}
                  >
                    <span>💬 {workspace.message_count || 0} mensajes</span>
                    {workspace.last_message_at && (
                      <span>
                        📅{" "}
                        {new Date(workspace.last_message_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      marginTop: theme.spacing.md,
                      display: "flex",
                      gap: theme.spacing.sm,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/workspaces/${workspace.id}`)}
                      style={{
                        background: theme.gradients.button,
                        border: "none",
                        borderRadius: "8px",
                        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                        fontSize: theme.typography.fontSize.bodySmall,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: "#FFFFFF",
                        cursor: "pointer",
                      }}
                    >
                      Abrir
                    </motion.button>

                    {workspace.user_role === "owner" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                        style={{
                          background: "transparent",
                          border: `1px solid ${theme.colors.error}`,
                          borderRadius: "8px",
                          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                          fontSize: theme.typography.fontSize.bodySmall,
                          fontWeight: theme.typography.fontWeight.medium,
                          color: theme.colors.error,
                          cursor: "pointer",
                        }}
                      >
                        Borrar
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: theme.spacing.lg,
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#FFFFFF",
                borderRadius: theme.borderRadius.large,
                padding: theme.spacing.xl,
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: theme.spacing.md,
                  fontSize: theme.typography.fontSize.h2,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                }}
              >
                Crear Nuevo Espacio
              </h2>

              <div style={{ marginBottom: theme.spacing.md }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: theme.spacing.xs,
                    fontSize: theme.typography.fontSize.bodySmall,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Nombre del espacio
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Ej: Proyecto Personal"
                  style={{
                    width: "100%",
                    padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.medium,
                    border: `1px solid ${theme.colors.border.light}`,
                    fontSize: theme.typography.fontSize.body,
                    fontFamily: theme.typography.fontFamily.primary,
                  }}
                />
              </div>

              <div style={{ marginBottom: theme.spacing.lg }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: theme.spacing.xs,
                    fontSize: theme.typography.fontSize.bodySmall,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Descripción (opcional)
                </label>
                <textarea
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  placeholder="Describe de qué va este espacio..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.medium,
                    border: `1px solid ${theme.colors.border.light}`,
                    fontSize: theme.typography.fontSize.body,
                    fontFamily: theme.typography.fontFamily.primary,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: theme.spacing.sm }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspaceName.trim() || loadingStates.createWorkspace}
                  style={{
                    flex: 1,
                    background: theme.gradients.button,
                    border: "none",
                    borderRadius: theme.borderRadius.medium,
                    padding: theme.spacing.md,
                    fontSize: theme.typography.fontSize.body,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: "#FFFFFF",
                    cursor: newWorkspaceName.trim() ? "pointer" : "not-allowed",
                    opacity: newWorkspaceName.trim() ? 1 : 0.5,
                  }}
                >
                  {loadingStates.createWorkspace ? "Creando..." : "Crear Espacio"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: `1px solid ${theme.colors.border.light}`,
                    borderRadius: theme.borderRadius.medium,
                    padding: theme.spacing.md,
                    fontSize: theme.typography.fontSize.body,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.secondary,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <BottomNav />
    </PhoneShell>
  );
}
