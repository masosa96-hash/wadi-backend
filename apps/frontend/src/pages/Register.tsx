import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const signUp = useAuthStore((state) => state.signUp);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, displayName);
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
          <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
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
              width: "80px",
              height: "80px",
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: theme.gradients.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: theme.typography.fontWeight.bold,
              color: "#FFFFFF",
              position: "relative",
            }}
          >
            W
          </motion.div>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.display,
            fontWeight: theme.typography.fontWeight.bold,
            background: theme.gradients.primary,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: theme.spacing.sm,
          }}>
            WADI
          </h1>
          <p style={{
            margin: 0,
            fontSize: theme.typography.fontSize.body,
            color: theme.colors.text.secondary,
          }}>
            Creá tu cuenta para comenzar
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={displayName}
            onChange={setDisplayName}
            label="Display Name"
            placeholder="Your name"
            required
          />

          <Input
            type="email"
            value={email}
            onChange={setEmail}
            label="Email"
            placeholder="your@email.com"
            required
          />

          <div style={{ marginBottom: theme.spacing.lg }}>
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              label="Password"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
            <p style={{
              marginTop: `-${theme.spacing.sm}`,
              fontSize: theme.typography.fontSize.caption,
              color: theme.colors.text.tertiary,
            }}>
              At least 6 characters
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
                background: theme.gradients.button,
                boxShadow: "0 0 24px rgba(37, 95, 245, 0.2)",
                border: "none",
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
            fontSize: theme.typography.fontSize.body,
            color: theme.colors.text.secondary,
          }}
        >
          ¿Ya tenés cuenta?{" "}
          <Link
            to="/login"
            style={{
              color: theme.colors.accent.primary,
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
            Iniciar sesión
          </Link>
        </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
