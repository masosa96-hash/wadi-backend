import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";
import { motion, AnimatePresence } from "framer-motion";

interface CommandItem {
    id: string;
    label: string;
    category: "page" | "project" | "workspace" | "action";
    icon: string;
    action: () => void;
    keywords?: string[];
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    const commands: CommandItem[] = [
        // Pages
        { id: "home", label: "Home", category: "page", icon: "🏠", action: () => navigate("/") },
        { id: "chat", label: "Chat", category: "page", icon: "💬", action: () => navigate("/chat") },
        { id: "search", label: "Búsqueda", category: "page", icon: "🔍", action: () => navigate("/search") },
        { id: "workspaces", label: "Workspaces", category: "page", icon: "🏢", action: () => navigate("/workspaces") },
        { id: "projects", label: "Proyectos", category: "page", icon: "📁", action: () => navigate("/projects") },
        { id: "settings", label: "Configuración", category: "page", icon: "⚙️", action: () => navigate("/settings") },
        { id: "debug", label: "Debug Panel", category: "page", icon: "🐛", action: () => navigate("/debug"), keywords: ["logs", "agent"] },
        { id: "admin", label: "Admin Panel", category: "page", icon: "👨‍💼", action: () => navigate("/admin") },

        // Actions
        { id: "new-chat", label: "Nueva Conversación", category: "action", icon: "➕", action: () => navigate("/chat") },
        { id: "new-workspace", label: "Nuevo Workspace", category: "action", icon: "📂", action: () => console.log("Create workspace") },
        { id: "new-project", label: "Nuevo Proyecto", category: "action", icon: "📄", action: () => navigate("/projects/new") },
    ];

    const filteredCommands = commands.filter((cmd) => {
        const searchText = query.toLowerCase();
        return (
            cmd.label.toLowerCase().includes(searchText) ||
            cmd.category.toLowerCase().includes(searchText) ||
            cmd.keywords?.some((k) => k.toLowerCase().includes(searchText))
        );
    });

    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((i) => (i + 1) % filteredCommands.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    if (!isOpen) return null;

    const categoryLabels = {
        page: "Páginas",
        project: "Proyectos",
        workspace: "Workspaces",
        action: "Acciones",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 9998,
                        }}
                    />

                    {/* Command Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: "fixed",
                            top: "20%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "90%",
                            maxWidth: "600px",
                            background: theme.colors.background.secondary,
                            borderRadius: theme.borderRadius.lg,
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                            zIndex: 9999,
                            overflow: "hidden",
                        }}
                    >
                        {/* Search Input */}
                        <div style={{ padding: theme.spacing.lg, borderBottom: `1px solid ${theme.colors.border.subtle}` }}>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar páginas, proyectos, acciones..."
                                autoFocus
                                style={{
                                    width: "100%",
                                    padding: `${theme.spacing.md} 0`,
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    fontSize: theme.typography.fontSize.lg,
                                    color: theme.colors.text.primary,
                                    fontFamily: theme.typography.fontFamily.primary,
                                }}
                            />
                        </div>

                        {/* Results */}
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                            {filteredCommands.length === 0 ? (
                                <div style={{
                                    padding: theme.spacing.xl,
                                    textAlign: "center",
                                    color: theme.colors.text.secondary,
                                }}>
                                    No se encontraron resultados
                                </div>
                            ) : (
                                filteredCommands.map((cmd, index) => (
                                    <div
                                        key={cmd.id}
                                        onClick={() => {
                                            cmd.action();
                                            onClose();
                                        }}
                                        style={{
                                            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                                            background: index === selectedIndex ? theme.colors.background.tertiary : "transparent",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: theme.spacing.md,
                                            transition: `background ${theme.transitions.fast}`,
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <span style={{ fontSize: "24px" }}>{cmd.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: theme.typography.fontSize.base,
                                                fontWeight: theme.typography.fontWeight.medium,
                                                color: theme.colors.text.primary,
                                            }}>
                                                {cmd.label}
                                            </div>
                                            <div style={{
                                                fontSize: theme.typography.fontSize.xs,
                                                color: theme.colors.text.tertiary,
                                            }}>
                                                {categoryLabels[cmd.category]}
                                            </div>
                                        </div>
                                        {index === selectedIndex && (
                                            <span style={{
                                                fontSize: theme.typography.fontSize.xs,
                                                color: theme.colors.text.tertiary,
                                            }}>
                                                ↵
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: theme.spacing.sm,
                            borderTop: `1px solid ${theme.colors.border.subtle}`,
                            display: "flex",
                            gap: theme.spacing.lg,
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.text.tertiary,
                        }}>
                            <span>↑↓ Navegar</span>
                            <span>↵ Seleccionar</span>
                            <span>ESC Cerrar</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
