import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('auth');
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('forgot.title')}
      subtitle={t('forgot.subtitle')}
    >
      {success ? (
        // Success state
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: `${theme.colors.success}15`,
              border: `1px solid ${theme.colors.success}40`,
              borderRadius: theme.borderRadius.medium,
              padding: theme.spacing.xl,
              marginBottom: theme.spacing.xl,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: theme.spacing.md }}>
              ✅
            </div>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.body,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.sm,
            }}>
              {t('forgot.success_message')}
            </p>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.bodySmall,
              color: theme.colors.text.secondary,
            }}>
              {t('forgot.spam_hint')}
            </p>
          </motion.div>

          <Link to="/login">
            <Button
              type="button"
              fullWidth
              style={{
                height: '52px',
                fontSize: theme.typography.fontSize.bodyLarge,
                background: theme.colors.text.primary,
                color: theme.colors.background.primary,
                border: "none",
                fontWeight: theme.typography.fontWeight.bold,
                cursor: 'pointer',
              }}
            >
              {t('forgot.back_to_login')}
            </Button>
          </Link>
        </div>
      ) : (
        // Form state
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            value={email}
            onChange={setEmail}
            label={t('login.email')}
            placeholder="your@email.com"
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
                background: theme.colors.text.primary,
                color: theme.colors.background.primary,
                border: "none",
                fontWeight: theme.typography.fontWeight.bold,
                cursor: 'pointer',
              }}
            >
              {loading ? t('forgot.submitting') : t('forgot.submit')}
            </Button>
          </motion.div>
        </form>
      )}

      <div
        style={{
          marginTop: theme.spacing.xl,
          textAlign: "center",
          fontSize: theme.typography.fontSize.body,
          color: theme.colors.text.secondary,
        }}
      >
        {t('forgot.remembered')}{" "}
        <Link
          to="/login"
          style={{
            color: theme.colors.text.primary,
            textDecoration: "none",
            fontWeight: theme.typography.fontWeight.semibold,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          {t('forgot.back_to_login')}
        </Link>
      </div>
    </AuthLayout>
  );
}
