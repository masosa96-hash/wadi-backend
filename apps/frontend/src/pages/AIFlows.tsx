import { useState } from "react";
import { theme } from "../styles/theme";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { useAIFlowsStore } from "../store/aiFlowsStore";
import { AIPreset } from "../types/aiFlows";
import { useNavigate } from "react-router-dom";

export function AIFlows() {
    const { presets, selectPreset } = useAIFlowsStore();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<AIPreset["category"] | "all">("all");

    const filteredPresets = filter === "all"
        ? presets
        : presets.filter(p => p.category === filter);

    const handleSelect = (preset: AIPreset) => {
        selectPreset(preset.id);
        navigate("/chat");
    };

    return (
        <PhoneShell>
            <div style={{
                minHeight: "100vh",
                background: theme.colors.background.primary,
                paddingBottom: "80px",
            }}>
                <header style={{
                    padding: theme.spacing.xl,
                    borderBottom: `1px solid ${theme.colors.border.subtle}`,
                    background: theme.colors.background.secondary,
                }}>
                    <h1 style={{
                        margin: `0 0 ${theme.spacing.xs} 0`,
                        fontSize: theme.typography.fontSize["2xl"],
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.text.primary,
                    }}>
                        AI Flows
                    </h1>
                    <p style={{
                        margin: 0,
                        color: theme.colors.text.secondary,
                        fontSize: theme.typography.fontSize.sm,
                    }}>
                        Flujos de trabajo inteligentes preconfigurados
                    </p>
                </header>

                <div style={{ padding: theme.spacing.xl }}>
                    {/* Filters */}
                    <div style={{ display: "flex", gap: theme.spacing.sm, marginBottom: theme.spacing.lg, overflowX: "auto" }}>
                        {(["all", "writing", "coding", "analysis", "productivity"] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                style={{
                                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                    background: filter === cat ? theme.colors.accent.primary : theme.colors.background.secondary,
                                    color: filter === cat ? "#FFF" : theme.colors.text.secondary,
                                    border: `1px solid ${theme.colors.border.subtle}`,
                                    borderRadius: theme.borderRadius.full,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    textTransform: "capitalize",
                                }}
                            >
                                {cat === "all" ? "Todos" : cat}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: theme.spacing.md,
                    }}>
                        {filteredPresets.map((preset) => (
                            <div
                                key={preset.id}
                                onClick={() => handleSelect(preset)}
                                style={{
                                    padding: theme.spacing.lg,
                                    background: theme.colors.background.secondary,
                                    borderRadius: theme.borderRadius.md,
                                    border: `1px solid ${theme.colors.border.subtle}`,
                                    cursor: "pointer",
                                    transition: "transform 0.2s",
                                }}
                            >
                                <div style={{ fontSize: "32px", marginBottom: theme.spacing.sm }}>
                                    {preset.icon}
                                </div>
                                <h3 style={{
                                    margin: `0 0 ${theme.spacing.xs} 0`,
                                    fontSize: theme.typography.fontSize.base,
                                    fontWeight: theme.typography.fontWeight.semibold,
                                    color: theme.colors.text.primary,
                                }}>
                                    {preset.name}
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: theme.typography.fontSize.xs,
                                    color: theme.colors.text.secondary,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}>
                                    {preset.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <BottomNav />
            </div>
        </PhoneShell>
    );
}
