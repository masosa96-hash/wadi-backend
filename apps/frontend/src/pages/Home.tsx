import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { SkeletonList } from "../components/Skeleton";

import { useProjectsStore } from "../store/projectsStore";
import { useWorkspaceStore } from "../store/workspaceStore";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { conversations, loadConversations, loadingConversations } = useChatStore();
  const { projects, fetchProjects } = useProjectsStore();
  const { workspaces, loadWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    loadConversations();
    fetchProjects();
    loadWorkspaces();
  }, []);


  const stats = {
    totalConversations: conversations.length,
    totalProjects: projects.length,
    totalWorkspaces: workspaces.length,
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
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background Noise Texture */}
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* Header */}
        <header style={{
          padding: theme.spacing.xl,
          borderBottom: `1px solid ${theme.colors.border.subtle}`,
          background: "rgba(9, 9, 11, 0.8)", // Transparent dark
          backdropFilter: "blur(12px)",
          position: "relative",
          zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                letterSpacing: "-0.5px",
              }}>
                WADI
              </h1>
              <p style={{
                margin: 0,
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.tertiary,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginTop: "2px",
              }}>
                WALKING DISASTER
              </p>
            </div>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: theme.colors.border.default,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              color: theme.colors.text.primary,
              fontWeight: "bold",
            }}>
              {user?.email?.[0].toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div style={{
          padding: theme.spacing.xl,
          position: "relative",
          zIndex: 1,
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize.h1,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
            lineHeight: 1.1,
          }}>
            Tu centro de comando <span style={{ color: theme.colors.text.secondary }}>inteligente.</span>
          </h2>
          <p style={{
            fontSize: theme.typography.fontSize.body,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xl,
          }}>
            Gestiona proyectos, chats y workspaces con el poder de la IA.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          padding: `0 ${theme.spacing.xl}`,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: theme.spacing.md,
          position: "relative",
          zIndex: 1,
        }}>
          <StatCard
            label="Chats"
            value={stats.totalConversations}
            icon="💬"
          />
          <StatCard
            label="Proyectos"
            value={stats.totalProjects}
            icon="📁"
          />
          <StatCard
            label="Espacios"
            value={stats.totalWorkspaces}
            icon="🏢"
          />
        </div>

        {/* Quick Actions */}
        <section style={{ padding: theme.spacing.xl, position: "relative", zIndex: 1 }}>
          <h3 style={{
            margin: `0 0 ${theme.spacing.md} 0`,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Accesos Rápidos
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: theme.spacing.md,
          }}>
            {quickActions.map((action) => (
              <motion.button
                key={action.path}
                whileHover={{ scale: 1.02, backgroundColor: theme.colors.border.subtle }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                style={{
                  padding: theme.spacing.lg,
                  background: theme.colors.background.surface,
                  border: `1px solid ${theme.colors.border.subtle}`,
                  borderRadius: theme.borderRadius.lg,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.sm,
                }}
              >
                <span style={{ fontSize: "24px" }}>{action.icon}</span>
                <span style={{
                  fontSize: theme.typography.fontSize.body,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                }}>
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recent Conversations */}
        <section style={{ padding: `0 ${theme.spacing.xl} ${theme.spacing.xl}`, position: "relative", zIndex: 1 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.md,
          }}>
            <h3 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}>
              Recientes
            </h3>
            <button
              onClick={() => navigate("/chat")}
              style={{
                background: "transparent",
                border: "none",
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                cursor: "pointer",
              }}
            >
              Ver todo
            </button>
          </div>

          {loadingConversations ? (
            <SkeletonList count={3} />
          ) : conversations.length === 0 ? (
            <div style={{
              padding: theme.spacing.xl,
              textAlign: "center",
              background: theme.colors.background.surface,
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.border.subtle}`,
            }}>
              <p style={{ color: theme.colors.text.secondary }}>No hay actividad reciente</p>
              <button
                onClick={() => navigate("/chat")}
                style={{
                  marginTop: theme.spacing.md,
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  background: theme.colors.text.primary,
                  color: theme.colors.background.primary,
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  fontWeight: theme.typography.fontWeight.medium,
                  cursor: "pointer",
                }}
              >
                Comenzar
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
              {conversations.slice(0, 3).map((conv) => (
                <motion.div
                  key={conv.id}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(`/chat?conversation=${conv.id}`)}
                  style={{
                    padding: theme.spacing.md,
                    background: theme.colors.background.surface,
                    border: `1px solid ${theme.colors.border.subtle}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.body,
                    fontWeight: theme.typography.fontWeight.medium,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "70%",
                  }}>
                    {conv.title || "Nueva conversación"}
                  </span>
                  <span style={{
                    color: theme.colors.text.tertiary,
                    fontSize: theme.typography.fontSize.xs,
                  }}>
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </span>
                </motion.div>
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
      background: theme.colors.background.surface,
      border: `1px solid ${theme.colors.border.subtle}`,
      borderRadius: theme.borderRadius.lg,
      textAlign: "center",
    }}>
      <div style={{ fontSize: "20px", marginBottom: theme.spacing.xs }}>
        {icon}
      </div>
      <div style={{
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
        marginTop: "2px",
      }}>
        {label}
      </div>
    </div>
  );
}
