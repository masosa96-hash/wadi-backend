import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectsStore } from "../store/projectsStore";
import { theme } from "../styles/theme";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { Textarea } from "../components/Input";

export default function Projects() {
  const { projects, loadingStates, fetchProjects, createProject } = useProjectsStore();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(newName, newDesc);
      setShowModal(false);
      setNewName("");
      setNewDesc("");
    } catch (err) {
      console.error("Create project error:", err);
    }
  };

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
        {/* Header */}
        <div style={{
          maxWidth: theme.layout.maxContentWidth,
          margin: "0 auto",
          marginBottom: theme.spacing['2xl'],
        }}>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.display,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}>
            My Projects
          </h1>
          <p style={{
            margin: 0,
            fontSize: theme.typography.fontSize.body,
            color: theme.colors.text.secondary,
          }}>
            Create and manage your AI projects
          </p>
        </div>

        {/* Create Button */}
        <div style={{
          maxWidth: theme.layout.maxContentWidth,
          margin: "0 auto",
          marginBottom: theme.spacing.xl,
        }}>
          <Button onClick={() => setShowModal(true)}>
            + Create Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div style={{ maxWidth: theme.layout.maxContentWidth, margin: "0 auto" }}>
          {loadingStates.fetchProjects && projects.length === 0 ? (
            <p style={{ color: theme.colors.text.secondary }}>
              Loading projects...
            </p>
          ) : projects.length === 0 ? (
            <p style={{ color: theme.colors.text.secondary }}>
              No projects yet. Create one to get started!
            </p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: theme.spacing.xl,
            }}>
              {projects.map((project) => (
                <Card
                  key={project.id}
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
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create New Project"
        >
          <form onSubmit={handleCreate}>
            <Input
              type="text"
              value={newName}
              onChange={setNewName}
              label="Project Name"
              placeholder="My AI Project"
              required
              maxLength={100}
            />

            <Textarea
              value={newDesc}
              onChange={setNewDesc}
              label="Description (optional)"
              placeholder="Describe your project..."
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
                Cancel
              </Button>
              <Button type="submit" disabled={loadingStates.createProject}>
                {loadingStates.createProject ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
