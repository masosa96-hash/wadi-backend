import { useState } from "react";
import { theme } from "../styles/theme";
import { useDebugStore } from "../store/debugStore";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { getFlag } from "../utils/featureFlags";

export default function DebugPanel() {
    const { logs, clearLogs } = useDebugStore();
    const [filter, setFilter] = useState<"all" | "prompt" | "response" | "action" | "error">("all");

    // Check if debug panel is enabled
    if (!getFlag("debugPanel")) {
        return (
            <PhoneShell>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    padding: theme.spacing.xl,
                    textAlign: "center",
                }}>
                    <div>
                        <h1 style={{ color: theme.colors.text.primary }}>Debug Panel Disabled</h1>
                        <p style={{ color: theme.colors.text.secondary }}>
                            Enable debug panel in feature flags
                        </p>
                    </div>
                </div>
            </PhoneShell>
        );
    }

    const filteredLogs = filter === "all" ? logs : logs.filter((log) => log.type === filter);

    const typeStyles = {
        prompt: { bg: "#3B82F6", label: "Prompt" },
        response: { bg: "#10B981", label: "Response" },
        action: { bg: "#F59E0B", label: "Action" },
        error: { bg: "#EF4444", label: "Error" },
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
                        margin: `0 0 ${theme.spacing.sm} 0`,
                        fontSize: theme.typography.fontSize["2xl"],
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.text.primary,
                    }}>
                        🐛 Debug Panel
                    </h1>
                    <p style={{
                        margin: 0,
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                    }}>
                        Agent logs and debugging information
                    </p>
                </header>

                {/* Filters */}
                <div style={{
                    padding: theme.spacing.lg,
                    display: "flex",
                    gap: theme.spacing.sm,
                    overflowX: "auto",
                }}>
                    {(["all", "prompt", "response", "action", "error"] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                background: filter === type ? theme.colors.accent.primary : theme.colors.background.secondary,
                                color: filter === type ? "#FFFFFF" : theme.colors.text.secondary,
                                border: `1px solid ${theme.colors.border.subtle}`,
                                borderRadius: theme.borderRadius.md,
                                fontSize: theme.typography.fontSize.sm,
                                fontWeight: theme.typography.fontWeight.medium,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                    <button
                        onClick={clearLogs}
                        style={{
                            marginLeft: "auto",
                            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                            background: theme.colors.background.secondary,
                            color: theme.colors.text.secondary,
                            border: `1px solid ${theme.colors.border.subtle}`,
                            borderRadius: theme.borderRadius.md,
                            fontSize: theme.typography.fontSize.sm,
                            cursor: "pointer",
                        }}
                    >
                        Clear Logs
                    </button>
                </div>

                {/* Logs */}
                <div style={{ padding: `0 ${theme.spacing.lg} ${theme.spacing.lg}` }}>
                    {filteredLogs.length === 0 ? (
                        <div style={{
                            padding: theme.spacing.xl,
                            textAlign: "center",
                            background: theme.colors.background.secondary,
                            borderRadius: theme.borderRadius.md,
                            color: theme.colors.text.secondary,
                        }}>
                            No logs available
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
                            {filteredLogs.map((log) => (
                                <div
                                    key={log.id}
                                    style={{
                                        padding: theme.spacing.md,
                                        background: theme.colors.background.secondary,
                                        borderRadius: theme.borderRadius.sm,
                                        border: `1px solid ${theme.colors.border.subtle}`,
                                        borderLeft: `4px solid ${typeStyles[log.type].bg}`,
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: theme.spacing.sm,
                                        marginBottom: theme.spacing.xs,
                                    }}>
                                        <span style={{
                                            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                                            background: typeStyles[log.type].bg,
                                            color: "#FFFFFF",
                                            borderRadius: theme.borderRadius.sm,
                                            fontSize: theme.typography.fontSize.xs,
                                            fontWeight: theme.typography.fontWeight.bold,
                                        }}>
                                            {typeStyles[log.type].label}
                                        </span>
                                        <span style={{
                                            fontSize: theme.typography.fontSize.xs,
                                            color: theme.colors.text.tertiary,
                                        }}>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <pre style={{
                                        margin: 0,
                                        fontSize: theme.typography.fontSize.sm,
                                        color: theme.colors.text.primary,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                    }}>
                                        {typeof log.content === "string" ? log.content : JSON.stringify(log.content, null, 2)}
                                    </pre>
                                    {log.metadata && (
                                        <details style={{ marginTop: theme.spacing.sm }}>
                                            <summary style={{
                                                fontSize: theme.typography.fontSize.xs,
                                                color: theme.colors.text.tertiary,
                                                cursor: "pointer",
                                            }}>
                                                Metadata
                                            </summary>
                                            <pre style={{
                                                margin: `${theme.spacing.xs} 0 0 0`,
                                                fontSize: theme.typography.fontSize.xs,
                                                color: theme.colors.text.secondary,
                                            }}>
                                                {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                        </details>
                                    )}
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
