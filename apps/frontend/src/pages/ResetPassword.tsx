import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";
import Input from "../components/Input";
import Button from "../components/Button";
import { supabase } from "../config/supabase";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            setError(err.message || "Error al actualizar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                position: "relative",
                overflow: "hidden",
                background: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 95, 245, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 80% 50%, rgba(123, 140, 255, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 20% 80%, rgba(197, 179, 255, 0.1) 0%, transparent 50%),
          ${theme.colors.background.primary}
        `,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: theme.typography.fontFamily.primary,
                padding: theme.spacing.xl,
            }}
        >
            {/* Floating background orbs */}
            <div
                style={{
                    position: "absolute",
                    top: "10%",
                    left: "10%",
                    width: "400px",
                    height: "400px",
                    background: "radial-gradient(circle, rgba(37, 95, 245, 0.1) 0%, transparent 70%)",
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
                    background: "radial-gradient(circle, rgba(197, 179, 255, 0.12) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(70px)",
                    opacity: 0.5,
                    pointerEvents: "none",
                }}
            />

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
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        border: "1px solid rgba(214, 225, 242, 0.6)",
                        borderRadius: "32px",
                        padding: theme.spacing['3xl'],
                        boxShadow: `
              0 20px 60px rgba(15, 23, 42, 0.12),
              0 0 0 1px rgba(255, 255, 255, 0.5) inset,
              0 0 40px rgba(37, 95, 245, 0.08)
            `,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "32px",
                            padding: "1px",
                            background: "linear-gradient(135deg, rgba(37, 95, 245, 0.15) 0%, rgba(197, 179, 255, 0.1) 100%)",
                            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                            pointerEvents: "none",
                        }}
                    />

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ textAlign: 'center', marginBottom: theme.spacing['2xl'] }}>
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        "0 0 20px rgba(37, 95, 245, 0.3), 0 0 40px rgba(123, 140, 255, 0.2)",
                                        "0 0 30px rgba(37, 95, 245, 0.4), 0 0 60px rgba(123, 140, 255, 0.3)",
                                        "0 0 20px rgba(37, 95, 245, 0.3), 0 0 40px rgba(123, 140, 255, 0.2)",
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    margin: "0 auto 24px",
                                    borderRadius: "50%",
                                    background: theme.gradients.primary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: theme.typography.fontWeight.bold,
                                    color: "#FFFFFF",
                                    position: "relative",
                                }}
                            >
                                🔒
                            </motion.div>

                            <h1 style={{
                                margin: 0,
                                fontSize: theme.typography.fontSize['2xl'],
                                fontWeight: theme.typography.fontWeight.bold,
                                color: theme.colors.text.primary,
                                marginBottom: theme.spacing.sm,
                            }}>
                                Nueva Contraseña
                            </h1>
                            <p style={{
                                margin: 0,
                                fontSize: theme.typography.fontSize.body,
                                color: theme.colors.text.secondary,
                            }}>
                                Ingresa tu nueva contraseña segura
                            </p>
                        </div>

                        {success ? (
                            <div style={{ textAlign: "center" }}>
                                <div style={{
                                    background: `${theme.colors.success}15`,
                                    color: theme.colors.success,
                                    padding: theme.spacing.lg,
                                    borderRadius: theme.borderRadius.md,
                                    marginBottom: theme.spacing.lg
                                }}>
                                    ¡Contraseña actualizada correctamente!
                                </div>
                                <p style={{ color: theme.colors.text.secondary }}>
                                    Redirigiendo al login...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={setPassword}
                                    label="Nueva contraseña"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />

                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    label="Confirmar contraseña"
                                    placeholder="Repite la contraseña"
                                    required
                                />

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: `${theme.colors.error}15`,
                                            border: `1px solid ${theme.colors.error}40`,
                                            borderRadius: theme.borderRadius.medium,
                                            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                                            marginBottom: theme.spacing.lg,
                                            color: theme.colors.error,
                                            fontSize: theme.typography.fontSize.bodySmall,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: theme.spacing.sm,
                                        }}
                                    >
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        fullWidth
                                        style={{
                                            height: '52px',
                                            fontSize: theme.typography.fontSize.bodyLarge,
                                            background: theme.gradients.button,
                                            boxShadow: "0 0 24px rgba(37, 95, 245, 0.2)",
                                            border: "none",
                                        }}
                                    >
                                        {loading ? "Actualizando..." : "Cambiar Contraseña"}
                                    </Button>
                                </motion.div>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
