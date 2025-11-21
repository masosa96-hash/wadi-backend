import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BillingPlan, UserUsage, BILLING_PLANS } from "../types/billing";

interface BillingState {
  currentPlan: BillingPlan;
  usage: UserUsage | null;
  loading: boolean;

  loadUsage: () => Promise<void>;
  checkLimit: (type: "message" | "file") => boolean;
  recordUsage: (type: "message" | "file_upload") => Promise<void>;
  upgradePlan: (planId: string) => Promise<void>;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      currentPlan: BILLING_PLANS.free,
      usage: null,
      loading: false,

      loadUsage: async () => {
        try {
          set({ loading: true });
          const token = localStorage.getItem("wadi_token");
          // Mock response if API is not ready
          if (!token) {
            set({ loading: false });
            return;
          }

          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/usage`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              const usage = data.data.usage;
              const plan = BILLING_PLANS[usage.planId] || BILLING_PLANS.free;

              set({
                usage,
                currentPlan: plan,
                loading: false
              });
            } else {
              // Fallback for dev/demo
              set({ loading: false });
            }
          } catch (e) {
            // Fallback if endpoint doesn't exist yet
            set({ loading: false });
          }
        } catch (error) {
          console.error("Error loading usage:", error);
          set({ loading: false });
        }
      },

      checkLimit: (type) => {
        const { usage, currentPlan } = get();
        // If no usage data, assume free limits for safety or allow if dev
        if (!usage) return true;

        const now = new Date();
        const periodEnd = new Date(usage.currentPeriodEnd);

        // Reset if period ended
        if (now > periodEnd) {
          return true; // Allow, will be reset on backend
        }

        if (type === "message") {
          return usage.dailyMessagesUsed < currentPlan.limits.dailyMessages &&
            usage.messagesUsed < currentPlan.limits.monthlyMessages;
        }

        return true;
      },

      recordUsage: async (type) => {
        try {
          const token = localStorage.getItem("wadi_token");
          if (!token) return;

          await fetch(`${import.meta.env.VITE_API_URL}/api/billing/usage`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type }),
          }).catch(() => { }); // Ignore errors for now

          // Reload usage after recording
          // await get().loadUsage(); // Optimistic update might be better
        } catch (error) {
          console.error("Error recording usage:", error);
        }
      },

      upgradePlan: async (planId) => {
        try {
          set({ loading: true });
          const token = localStorage.getItem("wadi_token");
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/upgrade`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ planId }),
          });

          if (response.ok) {
            const data = await response.json();
            // If Stripe checkout URL is returned, redirect
            if (data.data.checkoutUrl) {
              window.location.href = data.data.checkoutUrl;
            } else {
              await get().loadUsage();
            }
          }
          set({ loading: false });
        } catch (error) {
          console.error("Error upgrading plan:", error);
          set({ loading: false });
        }
      },
    }),
    {
      name: "wadi-billing-storage",
      partialize: (state) => ({
        currentPlan: state.currentPlan,
        usage: state.usage,
      }),
    }
  )
);
