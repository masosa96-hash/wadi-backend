import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      navigate("/projects");
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
            Create your account to get started
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
            {loading ? "Creating account..." : "Sign Up"}
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
          Already have an account?{" "}
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
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
