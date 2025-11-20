import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../styles/theme";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import SearchBar from "../components/SearchBar";

interface SearchResult {
  message_id: string;
  conversation_id: string;
  conversation_title: string;
  workspace_id: string;
  workspace_name: string;
  content: string;
  message_date: string;
  relevance: number;
  snippet: string;
}

interface Workspace {
  id: string;
  name: string;
}

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    if (query) {
      performSearch();
    }
    loadWorkspaces();
  }, [query, selectedWorkspace, dateFilter]);

  const loadWorkspaces = async () => {
    try {
      const token = localStorage.getItem("wadi_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workspaces`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.data || []);
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("wadi_token");
      const params = new URLSearchParams({ q: query });
      
      if (selectedWorkspace) {
        params.append("workspace_id", selectedWorkspace);
      }
      if (dateFilter) {
        params.append("date_filter", dateFilter);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error en la búsqueda");
      }

      const data = await response.json();
      setResults(data.data.results || []);
    } catch (err: any) {
      setError(err.message || "Error al buscar");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = async (result: SearchResult) => {
    // Navigate to the conversation with the specific message highlighted
    navigate(`/chat`, {
      state: {
        conversationId: result.conversation_id,
        highlightMessageId: result.message_id,
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hoy";
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const dateFilters = [
    { value: null, label: "Todo" },
    { value: "week", label: "Últimos 7 días" },
    { value: "month", label: "Últimos 30 días" },
    { value: "quarter", label: "Últimos 90 días" },
  ];

  return (
    <PhoneShell>
      {/* Header with Back Button */}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.md,
            marginBottom: theme.spacing.md,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              padding: theme.spacing.xs,
            }}
          >
            ←
          </motion.button>
          <h1
            style={{
              margin: 0,
              fontSize: theme.typography.fontSize.h2,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
            }}
          >
            Búsqueda
          </h1>
        </div>

        {/* Search Bar */}
        <SearchBar />
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: `${theme.spacing.lg} ${theme.spacing.lg}`,
          paddingBottom: "100px",
        }}
      >
        {/* Filters */}
        {query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: theme.spacing.lg,
            }}
          >
            {/* Date Filters */}
            <div
              style={{
                display: "flex",
                gap: theme.spacing.sm,
                flexWrap: "wrap",
                marginBottom: theme.spacing.md,
              }}
            >
              {dateFilters.map((filter) => (
                <motion.button
                  key={filter.value || "all"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDateFilter(filter.value)}
                  style={{
                    background:
                      dateFilter === filter.value
                        ? theme.gradients.button
                        : "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(12px)",
                    border: `1.5px solid ${
                      dateFilter === filter.value
                        ? theme.colors.accent.primary
                        : theme.colors.border.accent
                    }`,
                    borderRadius: "20px",
                    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                    fontSize: theme.typography.fontSize.bodySmall,
                    fontWeight: theme.typography.fontWeight.medium,
                    color:
                      dateFilter === filter.value
                        ? "#FFFFFF"
                        : theme.colors.text.secondary,
                    cursor: "pointer",
                    transition: theme.transitions.fast,
                    fontFamily: theme.typography.fontFamily.primary,
                    boxShadow:
                      dateFilter === filter.value
                        ? "0 4px 12px rgba(37, 95, 245, 0.25)"
                        : "0 2px 8px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>

            {/* Workspace Filter */}
            {workspaces.length > 0 && (
              <div style={{ marginBottom: theme.spacing.md }}>
                <select
                  value={selectedWorkspace || ""}
                  onChange={(e) =>
                    setSelectedWorkspace(e.target.value || null)
                  }
                  style={{
                    width: "100%",
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: theme.borderRadius.medium,
                    border: `1px solid ${theme.colors.border.accent}`,
                    background: "rgba(255, 255, 255, 0.9)",
                    fontSize: theme.typography.fontSize.body,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily.primary,
                    cursor: "pointer",
                  }}
                >
                  <option value="">Todos los workspaces</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Results Count */}
            <div
              style={{
                fontSize: theme.typography.fontSize.bodySmall,
                color: theme.colors.text.tertiary,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              {loading
                ? "Buscando..."
                : `${results.length} resultado${results.length !== 1 ? "s" : ""}`}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {error && (
          <div
            className="glass-surface"
            style={{
              padding: theme.spacing.xl,
              borderRadius: theme.borderRadius.large,
              textAlign: "center",
              color: theme.colors.error,
            }}
          >
            {error}
          </div>
        )}

        {!query && !loading && (
          <div
            className="glass-surface"
            style={{
              padding: theme.spacing.xl,
              borderRadius: theme.borderRadius.large,
              textAlign: "center",
              color: theme.colors.text.tertiary,
            }}
          >
            Empezá a buscar para encontrar conversaciones
          </div>
        )}

        {query && !loading && results.length === 0 && !error && (
          <div
            className="glass-surface"
            style={{
              padding: theme.spacing.xl,
              borderRadius: theme.borderRadius.large,
              textAlign: "center",
              color: theme.colors.text.tertiary,
            }}
          >
            No se encontraron resultados para "{query}"
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {results.map((result, index) => (
            <motion.div
              key={result.message_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 12px 32px rgba(37, 95, 245, 0.15)",
              }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleResultClick(result)}
              className="glass-surface"
              style={{
                borderRadius: theme.borderRadius.large,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.md,
                cursor: "pointer",
                transition: theme.transitions.medium,
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
                  height: "2px",
                  background: theme.gradients.primary,
                  opacity: 0.6,
                }}
              />

              {/* Header: Conversation Title */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: theme.spacing.sm,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    fontSize: theme.typography.fontSize.h3,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {result.conversation_title || "Conversación sin título"}
                </div>
              </div>

              {/* Workspace Badge */}
              {result.workspace_name && (
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(37, 95, 245, 0.1)",
                    border: `1px solid ${theme.colors.accent.primary}30`,
                    borderRadius: "12px",
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    fontSize: theme.typography.fontSize.caption,
                    color: theme.colors.accent.primary,
                    marginBottom: theme.spacing.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  📁 {result.workspace_name}
                </div>
              )}

              {/* Message Snippet */}
              <div
                style={{
                  fontSize: theme.typography.fontSize.body,
                  color: theme.colors.text.secondary,
                  lineHeight: 1.6,
                  marginBottom: theme.spacing.sm,
                }}
                dangerouslySetInnerHTML={{
                  __html: result.snippet || result.content.substring(0, 150),
                }}
              />

              {/* Footer: Date */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: theme.typography.fontSize.caption,
                  color: theme.colors.text.tertiary,
                }}
              >
                <span>{formatDate(result.message_date)}</span>
                <span style={{ fontSize: "16px", opacity: 0.6 }}>→</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      <BottomNav />
    </PhoneShell>
  );
}
