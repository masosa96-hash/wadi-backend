import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar conversaciones..."
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
          transition: `all ${theme.transitions.default}`,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.accent.primary;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.subtle;
        }}
      />
      <button
        type="submit"
        style={{
          position: "absolute",
          right: theme.spacing.sm,
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          padding: theme.spacing.xs,
        }}
      >
        🔍
      </button>
    </form>
  );
}
