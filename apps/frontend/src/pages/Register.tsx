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
import { useTranslation } from "react-i18next";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = useAuthStore((state) => state.signUp);
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    if (pass.length < 6) return 1;
    if (pass.length < 10) return 2;
    return 3;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres"); // TODO: Translate validation errors?
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, displayName);
      navigate("/home");
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('register.title')}
      subtitle={t('register.subtitle')}
    >
      <SEO title={t('register.title')} />

      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={displayName}
          onChange={setDisplayName}
          label={t('register.full_name')}
          placeholder="Tu nombre"
          required
        />

        <Input
          type="email"
          value={email}
          onChange={setEmail}
          label={t('login.email')}
          placeholder="tu@email.com"
          required
        />

        <div style={{ marginBottom: theme.spacing.lg, position: "relative" }}>
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            label={t('login.password')}
            placeholder="******"
            required
            minLength={6}
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
            {showPassword ? t('login.hide_password') : t('login.show_password')}
          </button>

          {/* Password Strength Indicator */}
          <div style={{
            display: "flex",
            gap: "4px",
            marginTop: "8px",
            opacity: password.length > 0 ? 1 : 0,
            transition: "opacity 0.2s"
          }}>
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                style={{
                  height: "4px",
                  flex: 1,
                  borderRadius: "2px",
                  background: strength >= level
                    ? (strength === 1 ? theme.colors.error : strength === 2 ? theme.colors.warning : theme.colors.success)
                    : theme.colors.border.default,
                  transition: "background 0.3s"
                }}
              />
            ))}
          </div>
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
              fontSize: theme.typography.fontSize.bodyLarge,
              background: theme.colors.text.primary,
              color: theme.colors.background.primary,
              border: "none",
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            {loading ? t('register.submitting') : t('register.submit')}
          </Button>
        </motion.div>
      </form>

      <div
        style={{
          marginTop: theme.spacing.xl,
          textAlign: "center",
          fontSize: theme.typography.fontSize.bodySmall,
          color: theme.colors.text.tertiary,
        }}
      >
        {t('register.has_account')}{" "}
        <Link
          to="/login"
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
          {t('register.login')}
        </Link>
      </div>
    </AuthLayout>
  );
}
