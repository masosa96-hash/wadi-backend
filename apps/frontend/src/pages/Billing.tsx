import { useEffect } from "react";
import { theme } from "../styles/theme";
import PhoneShell from "../components/PhoneShell";
import BottomNav from "../components/BottomNav";
import { useBillingStore } from "../store/billingStore";
import { BILLING_PLANS } from "../types/billing";
import { motion } from "framer-motion";

export function Billing() {
  const { currentPlan, loadUsage, upgradePlan, loading } = useBillingStore();

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  return (
    <PhoneShell>
      <div style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        paddingBottom: "80px",
      }}>
        <header style={{
          padding: theme.spacing.xl,
          borderBottom: `1px solid ${theme.colors.border.subtle}`,
          background: theme.colors.background.secondary,
        }}>
          <h1 style={{
            margin: `0 0 ${theme.spacing.xs} 0`,
            fontSize: theme.typography.fontSize["2xl"],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
          }}>
            Planes y Facturación
          </h1>
          <p style={{
            margin: 0,
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
          }}>
            Gestiona tu suscripción y límites
          </p>
        </header>

        <div style={{ padding: theme.spacing.xl }}>
          {/* Current Plan Status */}
          <div style={{
            marginBottom: theme.spacing["2xl"],
            padding: theme.spacing.lg,
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border.subtle}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md }}>
              <h2 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, color: theme.colors.text.primary }}>
                Plan Actual: <span style={{ color: theme.colors.accent.primary }}>{currentPlan.displayName}</span>
              </h2>
              <span style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                background: currentPlan.name === "pro" ? theme.colors.accent.primary : theme.colors.background.tertiary,
                color: currentPlan.name === "pro" ? "#FFF" : theme.colors.text.secondary,
                borderRadius: theme.borderRadius.full,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.bold,
              }}>
                {currentPlan.name === "pro" ? "ACTIVO" : "GRATIS"}
              </span>
            </div>

            {/* Usage Bars would go here */}
            <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
              Ciclo de facturación: Mensual
            </div>
          </div>

          {/* Plans Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: theme.spacing.lg,
          }}>
            {Object.values(BILLING_PLANS).map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                style={{
                  padding: theme.spacing.xl,
                  background: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.lg,
                  border: `2px solid ${currentPlan.id === plan.id ? theme.colors.accent.primary : theme.colors.border.subtle}`,
                  position: "relative",
                }}
              >
                {plan.name === "pro" && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    right: 20,
                    background: theme.colors.accent.primary,
                    color: "#FFF",
                    padding: "4px 12px",
                    borderRadius: theme.borderRadius.full,
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}>
                    RECOMENDADO
                  </div>
                )}

                <h3 style={{ fontSize: theme.typography.fontSize.xl, marginBottom: theme.spacing.xs, color: theme.colors.text.primary }}>
                  {plan.displayName}
                </h3>
                <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
                  ${plan.price / 100}<span style={{ fontSize: "16px", color: theme.colors.text.secondary, fontWeight: "normal" }}>/mes</span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, marginBottom: theme.spacing.xl }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ display: "flex", gap: theme.spacing.sm, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
                      <span style={{ color: theme.colors.accent.primary }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => upgradePlan(plan.id)}
                  disabled={currentPlan.id === plan.id || loading}
                  style={{
                    width: "100%",
                    padding: theme.spacing.md,
                    background: currentPlan.id === plan.id ? theme.colors.background.tertiary : theme.colors.accent.primary,
                    color: currentPlan.id === plan.id ? theme.colors.text.secondary : "#FFF",
                    border: "none",
                    borderRadius: theme.borderRadius.md,
                    fontWeight: theme.typography.fontWeight.bold,
                    cursor: currentPlan.id === plan.id ? "default" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {currentPlan.id === plan.id ? "Plan Actual" : loading ? "Procesando..." : `Mejorar a ${plan.displayName}`}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    </PhoneShell>
  );
}
