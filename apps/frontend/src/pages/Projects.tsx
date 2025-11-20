import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProjectsStore } from "../store/projectsStore";
import { theme } from "../styles/theme";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { Textarea } from "../components/Input";

export default function Projects() {
  const { projects, loadingStates, error, fetchProjects, createProject, clearError } = useProjectsStore();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects().catch(() => {});  // Error handled by store
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const project = await createProject(newName, newDesc);
      setShowModal(false);
      setNewName("");
      setNewDesc("");
      navigate(`/projects/${project.id}`);
    } catch (err) {
      console.error("Create project error:", err);
    }
  };

  const handleRetry = () => {
    clearError();
    fetchProjects();
  };

  // Calculate stats
  const totalProjects = projects.length;
  const lastActivity = projects[0]?.created_at 
    ? new Date(projects[0].created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <>
      <Sidebar />
      <div style={{
        marginLeft: theme.layout.sidebarWidth,
        background: theme.colors.background.primary,
        color: theme.colors.text.primary,
        minHeight: "100vh",
        fontFamily: theme.typography.fontFamily.primary,
        padding: theme.spacing['2xl'],
      }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: theme.layout.maxContentWidth,
            margin: "0 auto",
            marginBottom: theme.spacing['2xl'],
          }}
        >
          <h1 style={{
            margin: 0,
            fontSize: '42px',
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
          }}>
            Historial
          </h1>
          <p style={{
            margin: 0,
            fontSize: theme.typography.fontSize.bodyLarge,
            color: theme.colors.text.secondary,
            lineHeight: theme.typography.lineHeight.relaxed,
          }}>
            Todo lo que estuvimos trabajando juntos
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            maxWidth: theme.layout.maxContentWidth,
            margin: "0 auto",
            marginBottom: theme.spacing.xl,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.lg,
          }}
        >
          <Card>
            <div style={{ fontSize: theme.typography.fontSize.caption, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Total de proyectos
            </div>
            <div style={{ fontSize: '28px', fontWeight: theme.typography.fontWeight.bold, color: theme.colors.accent.primary }}>
              {totalProjects}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: theme.typography.fontSize.caption, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Última actividad
            </div>
            <div style={{ fontSize: '16px', fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
              {lastActivity}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: theme.typography.fontSize.caption, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Estado
            </div>
            <div style={{ fontSize: '16px', fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.success }}>
              🟢 Activo
            </div>
          </Card>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              maxWidth: theme.layout.maxContentWidth,
              margin: "0 auto",
              marginBottom: theme.spacing.xl,
              background: `${theme.colors.error}15`,
              border: `1px solid ${theme.colors.error}40`,
              borderLeft: `4px solid ${theme.colors.error}`,
              borderRadius: theme.borderRadius.small,
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <div style={{ color: theme.colors.error, fontWeight: theme.typography.fontWeight.semibold }}>
                  No pudimos cargar tus proyectos
                </div>
                <div style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.bodySmall }}>
                  {error.message}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <Button variant="ghost" onClick={handleRetry}>
                Reintentar
              </Button>
              <button
                onClick={clearError}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.error,
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: `0 ${theme.spacing.sm}`,
                }}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Create Button */}
        <div style={{
          maxWidth: theme.layout.maxContentWidth,
          margin: "0 auto",
          marginBottom: theme.spacing.xl,
        }}>
          <Button onClick={() => setShowModal(true)}>
            + Crear proyecto
          </Button>
        </div>

        {/* Projects Grid */}
        <div style={{ maxWidth: theme.layout.maxContentWidth, margin: "0 auto" }}>
          {loadingStates.fetchProjects && projects.length === 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: theme.spacing.xl,
            }}>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <div style={{ height: '100px', opacity: 0.3 }}>Cargando...</div>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
                <div style={{ fontSize: '48px', marginBottom: theme.spacing.lg }}>📁</div>
                <h3 style={{
                  fontSize: theme.typography.fontSize.h3,
                  fontWeight: theme.typography.fontWeight.semibold,
                  marginBottom: theme.spacing.md,
                }}>
                  Todavía no tenés proyectos
                </h3>
                <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>
                  ¡Creá tu primer proyecto para empezar!
                </p>
                <Button onClick={() => setShowModal(true)}>
                  Crear tu primer proyecto
                </Button>
              </div>
            </Card>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: theme.spacing.xl,
            }}>
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    onClick={() => navigate(`/projects/${project.id}`)}
                    hoverable
                  >
                    <h3 style={{
                      margin: `0 0 ${theme.spacing.sm} 0`,
                      fontSize: theme.typography.fontSize.h3,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                    }}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p style={{
                        margin: `0 0 ${theme.spacing.md} 0`,
                        fontSize: theme.typography.fontSize.bodySmall,
                        color: theme.colors.text.secondary,
                        lineHeight: theme.typography.lineHeight.normal,
                      }}>
                        {project.description}
                      </p>
                    )}
                    <p style={{
                      margin: 0,
                      fontSize: theme.typography.fontSize.caption,
                      color: theme.colors.text.tertiary,
                    }}>
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Crear nuevo proyecto"
        >
          <form onSubmit={handleCreate}>
            <Input
              type="text"
              value={newName}
              onChange={setNewName}
              label="Nombre del proyecto"
              placeholder="Mi proyecto con IA"
              required
              maxLength={100}
              autoFocus
            />

            <Textarea
              value={newDesc}
              onChange={setNewDesc}
              label="Descripción (opcional)"
              placeholder="Describí tu proyecto..."
              maxLength={500}
              rows={3}
            />

            <div style={{
              display: "flex",
              gap: theme.spacing.md,
              justifyContent: "flex-end",
              marginTop: theme.spacing.lg,
            }}>
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                variant="ghost"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loadingStates.createProject}>
                {loadingStates.createProject ? "Creando..." : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
