import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";
import Input from "../components/Input";
import Button from "../components/Button";
import SEO from "../components/SEO";
import AuthLayout from "../layouts/AuthLayout";
import { useLanguage } from "../store/LanguageContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password, rememberMe);
      navigate("/home");
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
    >
      <SEO title={t('auth.login.title')} />

      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          value={email}
          onChange={setEmail}
          label={t('auth.login.email')}
          placeholder="tu@email.com"
          required
        />

        <div style={{ position: "relative" }}>
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            label={t('auth.login.password')}
            placeholder="******"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "38px",
              background: "none",
              border: "none",
              color: theme.colors.text.tertiary,
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {showPassword ? t('auth.login.hide_password') : t('auth.login.show_password')}
          </button>
        </div>

        {/* Remember Me Checkbox */}
        <div style={{
          marginBottom: theme.spacing.lg,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer',
              accentColor: theme.colors.text.primary,
              background: theme.colors.background.tertiary,
              border: `1px solid ${theme.colors.border.default}`,
            }}
          />
          <label
            htmlFor="rememberMe"
            style={{
              fontSize: theme.typography.fontSize.bodySmall,
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {t('auth.login.remember_me')}
          </label>
        </div>

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
              height: '48px',
              fontSize: theme.typography.fontSize.body,
              background: theme.colors.text.primary, // High contrast
              color: theme.colors.background.primary, // Inverse text
              border: "none",
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>
        </motion.div>

        {/* Forgot Password Link */}
        <div style={{
          marginTop: theme.spacing.md,
          textAlign: 'center',
        }}>
          <Link
            to="/forgot-password"
            style={{
              color: theme.colors.text.secondary,
              textDecoration: "none",
              fontSize: theme.typography.fontSize.bodySmall,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.text.secondary;
            }}
          >
            {t('auth.login.forgot_password')}
          </Link>
        </div>
      </form>

      <div
        style={{
          marginTop: theme.spacing.xl,
          textAlign: "center",
          fontSize: theme.typography.fontSize.bodySmall,
          color: theme.colors.text.tertiary,
        }}
      >
        {t('auth.login.no_account')}{" "}
        <Link
          to="/register"
          style={{
            color: theme.colors.text.primary,
            textDecoration: "none",
            fontWeight: theme.typography.fontWeight.medium,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          {t('auth.login.create_account')}
        </Link>
      </div>
    </AuthLayout>
  );
}
