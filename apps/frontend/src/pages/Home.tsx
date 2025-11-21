import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { SkeletonList } from "../components/Skeleton";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { conversations, loadConversations, loadingConversations } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, []);


  const stats = {
    totalConversations: conversations.length,
    totalProjects: 0, // TODO: Get from projects store
    totalWorkspaces: 1, // TODO: Get from workspaces store
  };

  const quickActions = [
    { label: "Nueva Conversación", path: "/chat", icon: "💬" },
    { label: "Buscar", path: "/search", icon: "🔍" },
    { label: "Proyectos", path: "/projects", icon: "📁" },
    { label: "Workspaces", path: "/workspaces", icon: "🏢" },
  ];

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
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
          }}>
            WADI
          </h1>
          <p style={{
            margin: 0,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}>
            Bienvenido, {user?.email || "Usuario"}
          </p>
        </header>

        {/* Stats Cards */}
        <div style={{
          padding: theme.spacing.xl,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: theme.spacing.md,
        }}>
          <StatCard
            label="Conversaciones"
            value={stats.totalConversations}
            icon="💬"
          />
          <StatCard
            label="Proyectos"
            value={stats.totalProjects}
            icon="📁"
          />
          <StatCard
            label="Workspaces"
            value={stats.totalWorkspaces}
            icon="🏢"
          />
        </div>

        {/* Quick Actions */}
        <section style={{ padding: `0 ${theme.spacing.xl} ${theme.spacing.xl}` }}>
          <h2 style={{
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Accesos Rápidos
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: theme.spacing.md,
          }}>
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                style={{
                  padding: theme.spacing.lg,
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.subtle}`,
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                  transition: `all ${theme.transitions.default}`,
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.active;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.subtle;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: theme.spacing.sm }}>
                  {action.icon}
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                }}>
                  {action.label}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Conversations */}
        <section style={{ padding: `0 ${theme.spacing.xl} ${theme.spacing.xl}` }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.lg,
          }}>
            <h2 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}>
              Conversaciones Recientes
            </h2>
            <button
              onClick={() => navigate("/chat")}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                background: "transparent",
                border: "none",
                color: theme.colors.accent.primary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: "pointer",
              }}
            >
              Ver todas →
            </button>
          </div>

          {loadingConversations ? (
            <SkeletonList count={3} />
          ) : conversations.length === 0 ? (
            <div style={{
              padding: theme.spacing.xl,
              textAlign: "center",
              background: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border.subtle}`,
            }}>
              <div style={{ fontSize: "48px", marginBottom: theme.spacing.md }}>
                💬
              </div>
              <p style={{
                margin: 0,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base,
              }}>
                No hay conversaciones aún
              </p>
              <button
                onClick={() => navigate("/chat")}
                style={{
                  marginTop: theme.spacing.lg,
                  padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                  background: theme.colors.accent.primary,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  cursor: "pointer",
                }}
              >
                Iniciar Conversación
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
              {conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/chat?conversation=${conv.id}`)}
                  style={{
                    padding: theme.spacing.md,
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.subtle}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: "pointer",
                    transition: `all ${theme.transitions.default}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.active;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.subtle;
                  }}
                >
                  <div style={{
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.xs,
                  }}>
                    {conv.title || "Sin título"}
                  </div>
                  <div style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                  }}>
                    {conv.message_count} mensajes
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <BottomNav />
      </div>
    </PhoneShell>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{
      padding: theme.spacing.md,
      background: theme.colors.background.secondary,
      border: `1px solid ${theme.colors.border.subtle}`,
      borderRadius: theme.borderRadius.md,
      textAlign: "center",
    }}>
      <div style={{ fontSize: "24px", marginBottom: theme.spacing.xs }}>
        {icon}
      </div>
      <div style={{
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
      }}>
        {label}
      </div>
    </div>
  );
}
