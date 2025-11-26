import { useState } from "react";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";

interface GuestNicknameModalProps {
    onSubmit: (nickname: string) => void;
}

export default function GuestNicknameModal({ onSubmit }: GuestNicknameModalProps) {
    const [nickname, setNickname] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            onSubmit(nickname.trim());
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
        }}>
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                background: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing["2xl"],
                maxWidth: "400px",
                width: "90%",
                border: `1px solid ${theme.colors.border.default}`,
            }}>
                <div style={{
                    fontSize: "48px",
                    textAlign: "center",
                    marginBottom: theme.spacing.lg,
                }}>
                    🤖
                </div>

                <h2 style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    textAlign: "center",
                    marginBottom: theme.spacing.sm,
                }}>
                    ¡Bienvenido a WADI!
                </h2>

                <p style={{
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.secondary,
                    textAlign: "center",
                    marginBottom: theme.spacing.xl,
                }}>
                    ¿Cómo te gustaría que te llame?
                </p>

                <div style={{
                    padding: theme.spacing.md,
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid rgba(59, 130, 246, 0.3)`,
                    borderRadius: theme.borderRadius.md,
                    marginBottom: theme.spacing.lg,
                }}>
                    <p style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                        margin: 0,
                        lineHeight: 1.5,
                    }}>
                        <span style={{ fontSize: '16px', marginRight: '6px' }}>💡</span>
                        <strong>Modo invitado:</strong> Tus conversaciones se guardan solo en este navegador. 
                        Para acceder desde otros dispositivos,{' '}
                        <a 
                            href="/register" 
                            style={{ 
                                color: theme.colors.accent.highlight,
                                textDecoration: 'none',
                                fontWeight: theme.typography.fontWeight.medium,
                            }}
                        >
                            creá una cuenta
                        </a>.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Tu nombre o apodo"
                        autoFocus
                        maxLength={30}
                        style={{
                            width: "100%",
                            padding: theme.spacing.md,
                            fontSize: theme.typography.fontSize.base,
                            borderRadius: theme.borderRadius.md,
                            border: `1px solid ${theme.colors.border.default}`,
                            background: theme.colors.background.tertiary,
                            color: theme.colors.text.primary,
                            outline: "none",
                            marginBottom: theme.spacing.lg,
                        }}
                    />

                    <button
                        type="submit"
                        disabled={!nickname.trim()}
                        style={{
                            width: "100%",
                            padding: theme.spacing.md,
                            fontSize: theme.typography.fontSize.base,
                            fontWeight: theme.typography.fontWeight.medium,
                            borderRadius: theme.borderRadius.md,
                            border: "none",
                            background: nickname.trim() ? theme.colors.accent.primary : theme.colors.border.default,
                            color: "#FFFFFF",
                            cursor: nickname.trim() ? "pointer" : "not-allowed",
                            opacity: nickname.trim() ? 1 : 0.5,
                        }}
                    >
                        Comenzar
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}
