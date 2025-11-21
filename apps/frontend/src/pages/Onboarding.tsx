import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";
import { useOnboardingStore } from "../store/onboardingStore";
import { motion } from "framer-motion";

export default function Onboarding() {
    const navigate = useNavigate();
    const { completeOnboarding } = useOnboardingStore();

    const features = [
        {
            icon: "🤖",
            title: "AI Inteligente",
            description: "Asistente AI que entiende tus necesidades y ejecuta acciones automáticamente",
        },
        {
            icon: "🏢",
            title: "Workspaces",
            description: "Organiza tus proyectos y conversaciones en espacios de trabajo dedicados",
        },
        {
            icon: "⚡",
            title: "Acciones Rápidas",
            description: "Cmd+K para búsqueda global, atajos de teclado, y flujos optimizados",
        },
    ];

    const handleGetStarted = () => {
        completeOnboarding();
        navigate("/projects");
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: theme.colors.background.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing.xl,
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    maxWidth: "600px",
                    width: "100%",
                    textAlign: "center",
                }}
            >
                {/* Logo/Icon */}
                <div style={{
                    fontSize: "80px",
                    marginBottom: theme.spacing.xl,
                }}>
                    🌊
                </div>

                {/* Title */}
                <h1 style={{
                    margin: `0 0 ${theme.spacing.md} 0`,
                    fontSize: theme.typography.fontSize["3xl"],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                }}>
                    Bienvenido a WADI
                </h1>

                <p style={{
                    margin: `0 0 ${theme.spacing["2xl"]} 0`,
                    fontSize: theme.typography.fontSize.lg,
                    color: theme.colors.text.secondary,
                }}>
                    Tu asistente AI para gestión de proyectos y automatización de tareas
                </p>

                {/* Features */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: theme.spacing.lg,
                    marginBottom: theme.spacing["2xl"],
                }}>
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            style={{
                                padding: theme.spacing.lg,
                                background: theme.colors.background.secondary,
                                borderRadius: theme.borderRadius.md,
                                border: `1px solid ${theme.colors.border.subtle}`,
                                textAlign: "left",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: theme.spacing.md,
                            }}
                        >
                            <div style={{ fontSize: "40px" }}>{feature.icon}</div>
                            <div>
                                <h3 style={{
                                    margin: `0 0 ${theme.spacing.xs} 0`,
                                    fontSize: theme.typography.fontSize.lg,
                                    fontWeight: theme.typography.fontWeight.semibold,
                                    color: theme.colors.text.primary,
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: theme.typography.fontSize.sm,
                                    color: theme.colors.text.secondary,
                                }}>
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGetStarted}
                    style={{
                        width: "100%",
                        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                        background: theme.colors.accent.primary,
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: theme.borderRadius.md,
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(37, 95, 245, 0.3)",
                    }}
                >
                    Crear mi Primer Proyecto
                </motion.button>

                {/* Skip */}
                <button
                    onClick={handleGetStarted}
                    style={{
                        marginTop: theme.spacing.lg,
                        background: "transparent",
                        border: "none",
                        color: theme.colors.text.tertiary,
                        fontSize: theme.typography.fontSize.sm,
                        cursor: "pointer",
                    }}
                >
                    Omitir por ahora
                </button>
            </motion.div>
        </div>
    );
}
