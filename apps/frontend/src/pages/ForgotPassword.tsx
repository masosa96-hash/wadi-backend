import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../config/supabase";
import { theme } from "../styles/theme";
import Input from "../components/Input";
import Button from "../components/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send recovery email");
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
        // Web3-style gradient background
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
          {/* Gradient border effect */}
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

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Header with WADI orb */}
            <div style={{ textAlign: 'center', marginBottom: theme.spacing['2xl'] }}>
              {/* WADI Icon/Orb */}
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
                {/* Inner glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: "10px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
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
                letterSpacing: "0.5px",
              }}>
                Recuperar contraseña
              </h1>
              <p style={{
                margin: 0,
                fontSize: theme.typography.fontSize.body,
                color: theme.colors.text.secondary,
              }}>
                {success 
                  ? "Revisa tu email" 
                  : "Ingresá tu email y te enviaremos un enlace"}
              </p>
            </div>

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
                    Si tu email está registrado, te enviamos un enlace para recuperar tu contraseña.
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: theme.typography.fontSize.bodySmall,
                    color: theme.colors.text.secondary,
                  }}>
                    Revisa tu bandeja de entrada (y spam).
                  </p>
                </motion.div>

                <Link to="/login">
                  <Button
                    type="button"
                    fullWidth
                    style={{ 
                      height: '52px', 
                      fontSize: theme.typography.fontSize.bodyLarge,
                      background: theme.gradients.button,
                      boxShadow: "0 0 24px rgba(37, 95, 245, 0.2)",
                      border: "none",
                    }}
                  >
                    Volver al login
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
                  label="Email"
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
                      background: theme.gradients.button,
                      boxShadow: "0 0 24px rgba(37, 95, 245, 0.2)",
                      border: "none",
                    }}
                  >
                    {loading ? "Enviando..." : "Enviar enlace de recuperación"}
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
              ¿Recordaste tu contraseña?{" "}
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
                Volver al login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
