import { useState } from "react";
import { theme } from "../styles/theme";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    // TODO: Implement actual search
    setTimeout(() => {
      setResults([]);
      setIsSearching(false);
    }, 500);
  };

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
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
          }}>
            Buscar
          </h1>

          {/* Search Input */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Buscar conversaciones, proyectos..."
              style={{
                width: "100%",
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                paddingRight: "48px",
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border.subtle}`,
                background: theme.colors.background.tertiary,
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.base,
                fontFamily: theme.typography.fontFamily.primary,
                outline: "none",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                position: "absolute",
                right: theme.spacing.sm,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              🔍
            </button>
          </div>
        </header>

        {/* Results */}
        <div style={{ padding: theme.spacing.xl }}>
          {isSearching ? (
            <div style={{
              textAlign: "center",
              padding: theme.spacing['2xl'],
              color: theme.colors.text.secondary,
            }}>
              Buscando...
            </div>
          ) : query && results.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: theme.spacing['2xl'],
            }}>
              <div style={{ fontSize: "48px", marginBottom: theme.spacing.md }}>
                🔍
              </div>
              <p style={{
                margin: 0,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base,
              }}>
                No se encontraron resultados para "{query}"
              </p>
            </div>
          ) : !query ? (
            <div style={{
              textAlign: "center",
              padding: theme.spacing['2xl'],
            }}>
              <div style={{ fontSize: "48px", marginBottom: theme.spacing.md }}>
                🔍
              </div>
              <p style={{
                margin: 0,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base,
              }}>
                Escribe algo para buscar
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
              {results.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: theme.spacing.md,
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.subtle}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}>
                    {result.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </PhoneShell>
  );
}
