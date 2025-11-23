import { useState } from "react";
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
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
        }}>
            <div style={{
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
            </div>
        </div>
    );
}
