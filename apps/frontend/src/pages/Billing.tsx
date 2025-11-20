import React, { useEffect, useState } from "react";
import { useBillingStore } from "../store/billingStore";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";

export const Billing: React.FC = () => {
  const {
    billingInfo,
    creditHistory,
    fetchBillingInfo,
    fetchCreditHistory,
    updatePlan,
    purchaseCredits,
    loadingStates,
    error
  } = useBillingStore();

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "business">("free");
  const [purchaseAmount, setPurchaseAmount] = useState(1000);

  useEffect(() => {
    fetchBillingInfo();
    fetchCreditHistory(20);
  }, []);

  const handleUpdatePlan = async () => {
    try {
      await updatePlan(selectedPlan);
      setShowPlanModal(false);
    } catch (err) {
      console.error("Failed to update plan:", err);
    }
  };

  const handlePurchaseCredits = async () => {
    try {
      await purchaseCredits(purchaseAmount, "manual", { source: "billing_page" });
      setShowPurchaseModal(false);
      setPurchaseAmount(1000);
    } catch (err) {
      console.error("Failed to purchase credits:", err);
    }
  };

  const plans = [
    {
      name: "free",
      label: "Free",
      credits: 200,
      price: "$0/month",
      features: [
        "200 credits/month",
        "Basic AI features",
        "Up to 5 projects",
        "Community support"
      ]
    },
    {
      name: "pro",
      label: "Pro",
      credits: 5000,
      price: "$29/month",
      features: [
        "5,000 credits/month",
        "Advanced AI features",
        "Unlimited projects",
        "Priority support",
        "Workspace collaboration"
      ]
    },
    {
      name: "business",
      label: "Business",
      credits: 20000,
      price: "$99/month",
      features: [
        "20,000 credits/month",
        "All Pro features",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated support"
      ]
    }
  ];

  const creditsUsedPercentage = billingInfo 
    ? Math.min((billingInfo.credits_used / (billingInfo.credits + billingInfo.credits_used)) * 100, 100)
    : 0;

  const renewDate = billingInfo ? new Date(billingInfo.renew_date).toLocaleDateString() : "";

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <h1 style={{ margin: 0, marginBottom: "24px", fontSize: "28px", fontWeight: "600" }}>
        Billing & Credits
      </h1>

      {error && (
        <div style={{
          padding: "12px",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "6px",
          marginBottom: "16px",
          color: "#c00"
        }}>
          {error.message}
        </div>
      )}

      {/* Current Plan Overview */}
      <Card style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
              Current Plan: {billingInfo?.plan.toUpperCase() || "Loading..."}
            </h2>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
              Renews on {renewDate}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={() => setShowPlanModal(true)}>Change Plan</Button>
            <Button onClick={() => setShowPurchaseModal(true)}>Buy Credits</Button>
          </div>
        </div>

        {/* Credits Progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Credits Available
            </span>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#0066cc" }}>
              {billingInfo?.credits || 0} / {(billingInfo?.credits || 0) + (billingInfo?.credits_used || 0)}
            </span>
          </div>
          <div style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${100 - creditsUsedPercentage}%`,
              height: "100%",
              backgroundColor: creditsUsedPercentage > 80 ? "#f44336" : "#4caf50",
              transition: "width 0.3s ease"
            }} />
          </div>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#666" }}>
            {billingInfo?.credits_used || 0} credits used this period
          </p>
        </div>
      </Card>

      {/* Plan Comparison */}
      <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "600" }}>Available Plans</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {plans.map((plan) => (
          <Card
            key={plan.name}
            style={{
              padding: "24px",
              border: billingInfo?.plan === plan.name ? "2px solid #0066cc" : "1px solid #e0e0e0",
              position: "relative"
            }}
          >
            {billingInfo?.plan === plan.name && (
              <div style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                padding: "4px 12px",
                backgroundColor: "#0066cc",
                color: "white",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600"
              }}>
                Current
              </div>
            )}
            <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "600" }}>{plan.label}</h3>
            <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "16px", color: "#0066cc" }}>
              {plan.price}
            </div>
            <ul style={{ margin: "0 0 20px 0", padding: "0 0 0 20px", listStyle: "disc" }}>
              {plan.features.map((feature, index) => (
                <li key={index} style={{ marginBottom: "8px", fontSize: "14px", color: "#333" }}>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => {
                setSelectedPlan(plan.name as any);
                setShowPlanModal(true);
              }}
              disabled={billingInfo?.plan === plan.name}
              style={{ width: "100%" }}
            >
              {billingInfo?.plan === plan.name ? "Current Plan" : "Select Plan"}
            </Button>
          </Card>
        ))}
      </div>

      {/* Credit Usage History */}
      <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "600" }}>Recent Activity</h2>
      <Card style={{ padding: "24px" }}>
        {loadingStates.fetchHistory ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#666" }}>Loading history...</div>
        ) : creditHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#666" }}>No activity yet</div>
        ) : (
          <div>
            {creditHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #eee"
                }}
              >
                <div>
                  <div style={{ fontWeight: "500", fontSize: "14px" }}>{item.reason}</div>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{
                  fontWeight: "600",
                  fontSize: "16px",
                  color: item.amount > 0 ? "#4caf50" : "#f44336"
                }}>
                  {item.amount > 0 ? "+" : ""}{-item.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Change Plan Modal */}
      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} title="Change Plan">
        <div style={{ padding: "16px" }}>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#666" }}>
            Select a new plan. Your credits will be reset based on the new plan allocation.
          </p>
          <div style={{ marginBottom: "24px" }}>
            {plans.map((plan) => (
              <label
                key={plan.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  border: selectedPlan === plan.name ? "2px solid #0066cc" : "1px solid #e0e0e0",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  cursor: "pointer"
                }}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.name}
                  checked={selectedPlan === plan.name}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  style={{ marginRight: "12px" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>{plan.label}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{plan.price} - {plan.credits} credits/month</div>
                </div>
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button onClick={() => setShowPlanModal(false)} style={{ backgroundColor: "#6c757d" }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePlan}
              disabled={loadingStates.updatePlan || selectedPlan === billingInfo?.plan}
            >
              {loadingStates.updatePlan ? "Updating..." : "Confirm Change"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Purchase Credits Modal */}
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Buy Credits">
        <div style={{ padding: "16px" }}>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#666" }}>
            Purchase additional credits to supplement your monthly allocation.
          </p>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Credit Amount
            </label>
            <select
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            >
              <option value={500}>500 credits - $5</option>
              <option value={1000}>1,000 credits - $10</option>
              <option value={2500}>2,500 credits - $20</option>
              <option value={5000}>5,000 credits - $35</option>
              <option value={10000}>10,000 credits - $60</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button onClick={() => setShowPurchaseModal(false)} style={{ backgroundColor: "#6c757d" }}>
              Cancel
            </Button>
            <Button
              onClick={handlePurchaseCredits}
              disabled={loadingStates.purchaseCredits}
            >
              {loadingStates.purchaseCredits ? "Processing..." : "Purchase"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
