import { theme } from "../styles/theme";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { useAuthStore } from "../store/authStore";
import { useBillingStore } from "../store/billingStore";
import { useNavigate } from "react-router-dom";

export function Profile() {
    const { user, signOut } = useAuthStore();
    const { currentPlan, usage } = useBillingStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
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
                        Perfil
                    </h1>
                </header>

                <div style={{ padding: theme.spacing.xl }}>
                    {/* User Info */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.lg,
                        marginBottom: theme.spacing["2xl"],
                    }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background: theme.colors.accent.primary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "32px",
                            color: "#FFF",
                            fontWeight: "bold",
                        }}>
                            {user?.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: theme.typography.fontSize.xl, color: theme.colors.text.primary }}>
                                {user?.email?.split("@")[0] || "Usuario"}
                            </h2>
                            <p style={{ margin: 0, color: theme.colors.text.secondary }}>
                                {user?.email}
                            </p>
                            <div style={{
                                marginTop: theme.spacing.xs,
                                display: "inline-block",
                                padding: "2px 8px",
                                background: theme.colors.background.tertiary,
                                borderRadius: theme.borderRadius.full,
                                fontSize: theme.typography.fontSize.xs,
                                color: theme.colors.text.primary,
                            }}>
                                Plan {currentPlan.displayName}
                            </div>
                        </div>
                    </div>

                    {/* Settings List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
                        <button
                            onClick={() => navigate("/billing")}
                            style={{
                                padding: theme.spacing.lg,
                                background: theme.colors.background.secondary,
                                border: `1px solid ${theme.colors.border.subtle}`,
                                borderRadius: theme.borderRadius.md,
                                textAlign: "left",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span style={{ color: theme.colors.text.primary }}>Gestionar Suscripción</span>
                            <span style={{ color: theme.colors.text.tertiary }}>→</span>
                        </button>

                        <button
                            onClick={() => navigate("/workspace/settings")}
                            style={{
                                padding: theme.spacing.lg,
                                background: theme.colors.background.secondary,
                                border: `1px solid ${theme.colors.border.subtle}`,
                                borderRadius: theme.borderRadius.md,
                                textAlign: "left",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span style={{ color: theme.colors.text.primary }}>Configuración de Workspace</span>
                            <span style={{ color: theme.colors.text.tertiary }}>→</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            style={{
                                marginTop: theme.spacing.xl,
                                padding: theme.spacing.lg,
                                background: "transparent",
                                border: `1px solid #EF4444`,
                                borderRadius: theme.borderRadius.md,
                                color: "#EF4444",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
                <BottomNav />
            </div>
        </PhoneShell>
    );
}
