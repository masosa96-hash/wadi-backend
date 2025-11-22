import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import Button from "../components/Button";
import Card from "../components/Card";

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  runs_count?: number;
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      // TODO: Fetch from API
      setProjects([]);
      setLoading(false);
    } catch (error) {
      console.error("Error loading projects:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <PhoneShell>
      <div style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        paddingBottom: "80px",
      }}>
        {/* Header */}
        <header style={{
          padding: theme.spacing.xl,
          borderBottom: `1px solid ${theme.colors.border.subtle}`,
          background: theme.colors.background.secondary,
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.sm,
          }}>
            <h1 style={{
              margin: 0,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
            }}>
              Proyectos
            </h1>
            <Button onClick={() => navigate("/projects/new")}>
              Nuevo
            </Button>
          </div>
          <p style={{
            margin: 0,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}>
            Organiza tus conversaciones en proyectos
          </p>
        </header>

        {/* Content */}
        <div style={{ padding: theme.spacing.xl }}>
          {loading ? (
            <div style={{
              textAlign: "center",
              padding: theme.spacing['2xl'],
              color: theme.colors.text.secondary,
            }}>
              Cargando proyectos...
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: theme.spacing['2xl'],
            }}>
              <div style={{ fontSize: "64px", marginBottom: theme.spacing.lg }}>
                📁
              </div>
              <h3 style={{
                margin: `0 0 ${theme.spacing.sm} 0`,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
              }}>
                No hay proyectos todavía
              </h3>
              <p style={{
                margin: `0 0 ${theme.spacing.lg} 0`,
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
              }}>
                Crea tu primer proyecto para organizar tus conversaciones
              </p>
              <Button onClick={() => navigate("/projects/new")}>
                Crear Primer Proyecto
              </Button>
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.md,
            }}>
              {projects.map((project) => (
                <Card
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  hoverable
                >
                  <h3 style={{
                    margin: `0 0 ${theme.spacing.xs} 0`,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                  }}>
                    {project.name}
                  </h3>
                  {project.description && (
                    <p style={{
                      margin: `0 0 ${theme.spacing.sm} 0`,
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                    }}>
                      {project.description}
                    </p>
                  )}
                  <div style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                  }}>
                    {project.runs_count || 0} runs
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </PhoneShell>
  );
}
