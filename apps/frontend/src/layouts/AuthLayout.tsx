import { ReactNode } from "react";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";
import { useLanguage } from "../store/LanguageContext";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const { language, setLanguage } = useLanguage();

    return (
        <div
            style={{
                minHeight: "100vh",
                position: "relative",
                overflow: "hidden",
                background: theme.colors.background.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: theme.typography.fontFamily.primary,
                padding: theme.spacing.xl,
            }}
        >
            {/* Language Selector */}
            <div style={{
                position: 'absolute',
                top: theme.spacing.xl,
                right: theme.spacing.xl,
                zIndex: 50,
            }}>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${theme.colors.border.subtle}`,
                        color: theme.colors.text.secondary,
                        padding: '8px 12px',
                        borderRadius: theme.borderRadius.full,
                        cursor: 'pointer',
                        outline: 'none',
                        fontSize: theme.typography.fontSize.xs,
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <option value="es-MX">Español (MX)</option>
                    <option value="en">English</option>
                </select>
            </div>

            {/* Background Noise Texture */}
            <div style={{
                position: "absolute",
                inset: 0,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                pointerEvents: "none",
                zIndex: 0,
            }} />

            {/* Floating background orbs */}
            <div
                style={{
                    position: "absolute",
                    top: "10%",
                    left: "10%",
                    width: "400px",
                    height: "400px",
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(80px)",
                    opacity: 0.6,
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "10%",
                    right: "10%",
                    width: "350px",
                    height: "350px",
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(70px)",
                    opacity: 0.5,
                    pointerEvents: "none",
                }}
            />

            {/* Phone-style container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: "100%",
                    maxWidth: theme.layout.mobileMaxWidth,
                    position: "relative",
                    zIndex: 10,
                }}
            >
                {/* Glassmorphism card */}
                <div
                    style={{
                        background: theme.glass.medium.background,
                        backdropFilter: theme.glass.medium.backdropFilter,
                        border: theme.glass.medium.border,
                        borderRadius: "32px",
                        padding: theme.spacing['3xl'],
                        boxShadow: theme.shadows.xl,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Content */}
                    <div style={{ position: "relative", zIndex: 1 }}>
                        {/* Header with WADI orb */}
                        <div style={{ textAlign: 'center', marginBottom: theme.spacing['2xl'] }}>
                            {/* WADI Icon/Orb */}
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        "0 0 20px rgba(255, 255, 255, 0.05), 0 0 40px rgba(255, 255, 255, 0.02)",
                                        "0 0 30px rgba(255, 255, 255, 0.08), 0 0 60px rgba(255, 255, 255, 0.04)",
                                        "0 0 20px rgba(255, 255, 255, 0.05), 0 0 40px rgba(255, 255, 255, 0.02)",
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    margin: "0 auto 24px",
                                    borderRadius: "50%",
                                    background: theme.colors.background.surface,
                                    border: `1px solid ${theme.colors.border.subtle}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "32px",
                                    fontWeight: theme.typography.fontWeight.bold,
                                    color: theme.colors.text.primary,
                                    position: "relative",
                                }}
                            >
                                W
                            </motion.div>

                            <h1 style={{
                                margin: 0,
                                fontSize: theme.typography.fontSize.h1,
                                fontWeight: theme.typography.fontWeight.bold,
                                color: theme.colors.text.primary,
                                marginBottom: theme.spacing.sm,
                                letterSpacing: "-0.5px",
                            }}>
                                {title}
                            </h1>
                            {subtitle && (
                                <p style={{
                                    margin: 0,
                                    color: theme.colors.text.secondary,
                                    fontSize: theme.typography.fontSize.body,
                                }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {children}
                    </div>
                </div>

                {/* Footer Links */}
                <div style={{
                    marginTop: theme.spacing.xl,
                    display: "flex",
                    justifyContent: "center",
                    gap: theme.spacing.lg,
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                }}>
                    <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Términos</a>
                    <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacidad</a>
                    <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Soporte</a>
                </div>
            </motion.div>
        </div>
    );
}
