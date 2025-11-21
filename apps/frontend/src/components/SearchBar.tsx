import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../styles/theme";

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({ onClose, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // Load suggestions when input is focused
    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem("wadi_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search/suggestions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data.suggestions || []);
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
    }
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Search Input */}
      <motion.div
        whileHover={{ boxShadow: "0 0 20px rgba(37, 95, 245, 0.15)" }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.md,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderRadius: "24px",
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          border: `1.5px solid ${isOpen ? theme.colors.accent.primary : theme.colors.border.accent}`,
          boxShadow: isOpen
            ? "0 8px 24px rgba(37, 95, 245, 0.18)"
            : "0 2px 8px rgba(15, 23, 42, 0.06)",
          transition: theme.transitions.default,
        }}
      >
        {/* Search Icon */}
        <span style={{ fontSize: "18px", opacity: 0.6 }}>🔍</span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar conversaciones..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: theme.typography.fontSize.body,
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.primary,
          }}
        />

        {/* Clear/Search Button */}
        {query && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => query ? setQuery("") : handleSearch()}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              padding: theme.spacing.xs,
              color: theme.colors.text.tertiary,
            }}
          >
            ✕
          </motion.button>
        )}

        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 16px rgba(37, 95, 245, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSearch()}
          disabled={!query.trim()}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: query.trim() ? theme.gradients.button : theme.colors.border.light,
            border: "none",
            cursor: query.trim() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: "14px",
            transition: theme.transitions.fast,
            boxShadow: query.trim() ? "0 0 12px rgba(37, 95, 245, 0.3)" : "none",
          }}
        >
          →
        </motion.button>
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && !query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-surface"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              borderRadius: theme.borderRadius.medium,
              padding: theme.spacing.sm,
              boxShadow: "0 12px 48px rgba(15, 23, 42, 0.15)",
              zIndex: 1000,
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize.caption,
                color: theme.colors.text.tertiary,
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              Sugerencias
            </div>
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ backgroundColor: "rgba(37, 95, 245, 0.08)", x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSearch(suggestion)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  borderRadius: theme.borderRadius.small,
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  fontSize: theme.typography.fontSize.body,
                  color: theme.colors.text.primary,
                  cursor: "pointer",
                  transition: theme.transitions.fast,
                  fontFamily: theme.typography.fontFamily.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.sm,
                }}
              >
                <span style={{ fontSize: "14px", opacity: 0.5 }}>🔍</span>
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}
