import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";

interface SearchResult {
  id: string;
  type: 'conversation' | 'message';
  title: string;
  preview: string;
  timestamp: number;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  
  const { messages } = useChatStore();
  const { guestId } = useAuthStore();

  // Auto-search when query changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Search in current chat messages
      const searchTerm = query.toLowerCase();
      const foundResults: SearchResult[] = [];
      
      // Search through messages
      messages.forEach((msg) => {
        if (msg.content.toLowerCase().includes(searchTerm)) {
          foundResults.push({
            id: msg.id,
            type: 'message',
            title: msg.role === 'user' ? 'Tú' : 'WADI',
            preview: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
            timestamp: new Date(msg.created_at).getTime(),
          });
        }
      });
      
      // Search in localStorage for guest conversations
      if (guestId) {
        const convKey = `wadi_conv_${guestId}`;
        const stored = localStorage.getItem(convKey);
        if (stored) {
          try {
            const history = JSON.parse(stored);
            history.forEach((msg: any) => {
              if (msg.content?.toLowerCase().includes(searchTerm)) {
                // Avoid duplicates
                if (!foundResults.find(r => r.id === msg.id)) {
                  foundResults.push({
                    id: msg.id,
                    type: 'message',
                    title: msg.role === 'user' ? 'Tú (historial)' : 'WADI (historial)',
                    preview: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
                    timestamp: new Date(msg.created_at || Date.now()).getTime(),
                  });
                }
              }
            });
          } catch (e) {
            console.error('Error searching history:', e);
          }
        }
      }
      
      // Sort by timestamp (most recent first)
      foundResults.sort((a, b) => b.timestamp - a.timestamp);
      
      setResults(foundResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
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
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => navigate('/chat')}
                  style={{
                    padding: theme.spacing.md,
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.subtle}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: "pointer",
                    transition: theme.transitions.medium,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.accent.primary;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.subtle;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: theme.spacing.xs,
                  }}>
                    <div style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.accent.primary,
                    }}>
                      {result.title}
                    </div>
                    <div style={{
                      fontSize: theme.typography.fontSize.caption,
                      color: theme.colors.text.tertiary,
                    }}>
                      {new Date(result.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    lineHeight: 1.5,
                  }}>
                    {result.preview}
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
