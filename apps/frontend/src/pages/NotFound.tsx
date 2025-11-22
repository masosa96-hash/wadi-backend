import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { theme } from "../styles/theme";

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: theme.colors.background.primary,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: theme.spacing.xl,
                position: "relative",
                overflow: "hidden",
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.primary,
            }}
        >
            {/* Background Noise */}
            <div style={{
                position: "absolute",
                inset: 0,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                pointerEvents: "none",
                zIndex: 0,
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ position: "relative", zIndex: 10, textAlign: "center" }}
            >
                <h1 style={{
                    fontSize: "120px",
                    fontWeight: "bold",
                    margin: 0,
                    lineHeight: 1,
                    background: `linear-gradient(180deg, ${theme.colors.text.primary} 0%, rgba(255,255,255,0.1) 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}>
                    404
                </h1>
                <p style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing.md,
                    letterSpacing: "-0.5px",
                }}>
                    Te has perdido en el vacío.
                </p>
                <p style={{
                    fontSize: theme.typography.fontSize.body,
                    color: theme.colors.text.tertiary,
                    maxWidth: "400px",
                    margin: `${theme.spacing.md} auto ${theme.spacing.xl}`,
                }}>
                    La página que buscas no existe o ha sido movida a otra dimensión.
                </p>

                <Link to="/home">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: `${theme.spacing.md} ${theme.spacing['2xl']}`,
                            background: theme.colors.text.primary,
                            color: theme.colors.background.primary,
                            border: "none",
                            borderRadius: "99px",
                            fontSize: theme.typography.fontSize.bodyLarge,
                            fontWeight: theme.typography.fontWeight.bold,
                            cursor: "pointer",
                            boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
                        }}
                    >
                        Volver al inicio
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    );
}
