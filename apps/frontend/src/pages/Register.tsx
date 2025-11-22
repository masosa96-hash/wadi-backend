import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";
import Input from "../components/Input";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = useAuthStore((state) => state.signUp);
  const navigate = useNavigate();

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
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, displayName);
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
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
      <SEO title="Crear Cuenta" />

      {/* Background Noise Texture */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        pointerEvents: "none",
        zIndex: 0,
      }} />

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
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: theme.spacing['2xl'] }}>
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
                type="text"
                value={displayName}
                onChange={setDisplayName}
                label="Nombre completo"
                placeholder="Tu nombre"
                required
              />

              <Input
                type="email"
                value={email}
                onChange={setEmail}
                label="Email"
                placeholder="tu@email.com"
                required
              />

              <div style={{ marginBottom: theme.spacing.lg, position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  label="Contraseña"
                  placeholder="Mínimo 6 caracteres"
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
                  {showPassword ? "Ocultar" : "Mostrar"}
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
                <p style={{
                  marginTop: "4px",
                  fontSize: theme.typography.fontSize.caption,
                  color: theme.colors.text.tertiary,
                  textAlign: "right"
                }}>
                  {strength === 0 ? "" : strength === 1 ? "Débil" : strength === 2 ? "Media" : "Fuerte"}
                </p>
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
                    height: '52px',
                    fontSize: theme.typography.fontSize.bodyLarge,
                    background: theme.colors.text.primary,
                    color: theme.colors.background.primary,
                    border: "none",
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
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
              ¿Ya tenés cuenta?{" "}
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
                Iniciar sesión
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
