import { theme } from "../styles/theme";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { useDebugStore } from "../store/debugStore";
import { useChatStore } from "../store/chatStore";
import { getFlag } from "../utils/featureFlags";

export default function AdminPanel() {
    const { logs } = useDebugStore();
    const { socket, isConnected } = useChatStore();

    // Check if admin panel is enabled
    if (!getFlag("adminPanel")) {
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
                        <h1 style={{ color: theme.colors.text.primary }}>Admin Panel Disabled</h1>
                        <p style={{ color: theme.colors.text.secondary }}>
                            Enable admin panel in feature flags
                        </p>
                    </div>
                </div>
            </PhoneShell>
        );
    }

    const recentErrors = logs.filter((log) => log.type === "error").slice(-5);
    const stats = {
        totalLogs: logs.length,
        errors: logs.filter((log) => log.type === "error").length,
        actions: logs.filter((log) => log.type === "action").length,
        wsStatus: isConnected ? "Connected" : "Disconnected",
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
                        👨‍💼 Admin Panel
                    </h1>
                    <p style={{
                        margin: 0,
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                    }}>
                        System monitoring and diagnostics
                    </p>
                </header>

                {/* Stats Grid */}
                <div style={{
                    padding: theme.spacing.xl,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: theme.spacing.md,
                }}>
                    <StatCard label="Total Logs" value={stats.totalLogs} icon="📊" />
                    <StatCard label="Errors" value={stats.errors} icon="⚠️" color="#EF4444" />
                    <StatCard label="Actions" value={stats.actions} icon="⚡" />
                    <StatCard
                        label="WebSocket"
                        value={stats.wsStatus}
                        icon="🌐"
                        color={isConnected ? "#10B981" : "#EF4444"}
                    />
                </div>

                {/* Recent Errors */}
                <section style={{ padding: `0 ${theme.spacing.xl} ${theme.spacing.xl}` }}>
                    <h2 style={{
                        margin: `0 0 ${theme.spacing.lg} 0`,
                        fontSize: theme.typography.fontSize.xl,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text.primary,
                    }}>
                        Errores Recientes
                    </h2>
                    {recentErrors.length === 0 ? (
                        <div style={{
                            padding: theme.spacing.xl,
                            background: theme.colors.background.secondary,
                            borderRadius: theme.borderRadius.md,
                            textAlign: "center",
                            color: theme.colors.text.secondary,
                        }}>
                            No hay errores recientes ✨
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
                            {recentErrors.map((error) => (
                                <div
                                    key={error.id}
                                    style={{
                                        padding: theme.spacing.md,
                                        background: theme.colors.background.secondary,
                                        borderRadius: theme.borderRadius.sm,
                                        border: `1px solid ${theme.colors.border.subtle}`,
                                        borderLeft: "4px solid #EF4444",
                                    }}
                                >
                                    <div style={{
                                        fontSize: theme.typography.fontSize.xs,
                                        color: theme.colors.text.tertiary,
                                        marginBottom: theme.spacing.xs,
                                    }}>
                                        {new Date(error.timestamp).toLocaleString()}
                                    </div>
                                    <pre style={{
                                        margin: 0,
                                        fontSize: theme.typography.fontSize.sm,
                                        color: theme.colors.text.primary,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                    }}>
                                        {typeof error.content === "string" ? error.content : JSON.stringify(error.content, null, 2)}
                                    </pre>
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

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color?: string }) {
    return (
        <div style={{
            padding: theme.spacing.lg,
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border.subtle}`,
        }}>
            <div style={{
                fontSize: "32px",
                marginBottom: theme.spacing.sm,
            }}>
                {icon}
            </div>
            <div style={{
                fontSize: theme.typography.fontSize["2xl"],
                fontWeight: theme.typography.fontWeight.bold,
                color: color || theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
            }}>
                {value}
            </div>
            <div style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
            }}>
                {label}
            </div>
        </div>
    );
}
