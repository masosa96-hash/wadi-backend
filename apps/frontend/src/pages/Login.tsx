import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { theme } from "../styles/theme";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/projects");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: theme.colors.background.primary,
        color: theme.colors.text.primary,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.typography.fontFamily.primary,
        padding: theme.spacing.xl,
      }}
    >
      <div
        style={{
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.subtle}`,
          borderRadius: theme.borderRadius.large,
          padding: theme.spacing['3xl'],
          width: "100%",
          maxWidth: "420px",
          boxShadow: theme.shadows.medium,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: theme.spacing['2xl'] }}>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.display,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.accent.primary,
            marginBottom: theme.spacing.sm,
          }}>
            WADI
          </h1>
          <p style={{
            margin: 0,
            fontSize: theme.typography.fontSize.body,
            color: theme.colors.text.secondary,
          }}>
            Welcome back! Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            value={email}
            onChange={setEmail}
            label="Email"
            placeholder="your@email.com"
            required
          />

          <Input
            type="password"
            value={password}
            onChange={setPassword}
            label="Password"
            placeholder="Enter your password"
            required
          />

          {error && (
            <div
              style={{
                background: `${theme.colors.error}15`,
                border: `1px solid ${theme.colors.error}40`,
                borderRadius: theme.borderRadius.small,
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
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            style={{ height: '48px', fontSize: theme.typography.fontSize.bodyLarge }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div
          style={{
            marginTop: theme.spacing.xl,
            textAlign: "center",
            fontSize: theme.typography.fontSize.body,
            color: theme.colors.text.secondary,
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
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
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
