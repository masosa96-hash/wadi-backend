import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";
import Input from "../components/Input";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password, rememberMe);
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
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
        background: theme.colors.background.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.typography.fontFamily.primary,
        padding: theme.spacing.xl,
      }}
    >
      <SEO title="Iniciar Sesión" />

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
                fontSize: theme.typography.fontSize.display,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.sm,
                letterSpacing: "-1px",
              }}>
                WADI
              </h1>
              <p style={{
                margin: 0,
                color: theme.colors.text.secondary,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontSize: "10px",
              }}>
                WALKING DISASTER
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                type="email"
                value={email}
                onChange={setEmail}
                label="Email"
                placeholder="tu@email.com"
                required
              />

              <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  label="Contraseña"
                  placeholder="Tu contraseña"
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
                  {showPassword ? "Ocultar" : "Mostrar"}
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
                  Recordar sesión
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
                    background: theme.colors.text.primary,
                    color: theme.colors.background.primary,
                    border: "none",
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  {loading ? "Entrando..." : "Ingresar"}
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
                  ¿Olvidaste tu contraseña?
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
              ¿No tenés cuenta?{" "}
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
                Crear cuenta
              </Link>
            </div>
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
