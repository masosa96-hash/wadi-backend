import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";
import Input from "../components/Input";
import Button from "../components/Button";
import { supabase } from "../config/supabase";
import AuthLayout from "../layouts/AuthLayout";
import { useLanguage } from "../store/LanguageContext";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden"); // TODO: Translate
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres"); // TODO: Translate
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            setError(err.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={t('auth.reset.title')}
            subtitle={t('auth.reset.subtitle')}
        >
            {success ? (
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        background: `${theme.colors.success}15`,
                        color: theme.colors.success,
                        padding: theme.spacing.lg,
                        borderRadius: theme.borderRadius.medium,
                        marginBottom: theme.spacing.lg
                    }}>
                        {t('auth.reset.success_message')}
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
                        label={t('auth.login.password')}
                        placeholder="******"
                        required
                        minLength={6}
                    />

                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        label="Confirmar contraseña" // TODO: Add translation key
                        placeholder="******"
                        required
                        minLength={6}
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
                                background: theme.colors.text.primary,
                                color: theme.colors.background.primary,
                                border: "none",
                            }}
                        >
                            {loading ? t('auth.reset.submitting') : t('auth.reset.submit')}
                        </Button>
                    </motion.div>
                </form>
            )}
        </AuthLayout>
    );
}
