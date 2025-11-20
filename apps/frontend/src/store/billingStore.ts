import { create } from "zustand";
import type { ApiError } from "../config/api";
import { api } from "../config/api";

export interface BillingInfo {
  id: string;
  user_id: string;
  plan: "free" | "pro" | "business";
  credits: number;
  credits_used: number;
  renew_date: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditUsageHistory {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  metadata: any;
  created_at: string;
}

export interface BillingLoadingStates {
  fetchBilling: boolean;
  fetchHistory: boolean;
  useCredits: boolean;
  purchaseCredits: boolean;
  updatePlan: boolean;
}

export interface BillingErrorState {
  operation: string;
  message: string;
  timestamp: number;
  retryable: boolean;
}

interface BillingState {
  // Data
  billingInfo: BillingInfo | null;
  creditHistory: CreditUsageHistory[];
  
  // Loading States
  loadingStates: BillingLoadingStates;
  
  // Error State
  error: BillingErrorState | null;
  
  // Actions
  fetchBillingInfo: () => Promise<void>;
  fetchCreditHistory: (limit?: number) => Promise<void>;
  useCredits: (amount: number, reason: string, metadata?: any) => Promise<boolean>;
  purchaseCredits: (amount: number, paymentMethod: string, metadata?: any) => Promise<void>;
  updatePlan: (plan: "free" | "pro" | "business") => Promise<void>;
  hasEnoughCredits: (amount: number) => boolean;
  clearError: () => void;
  resetStore: () => void;
}

const initialLoadingStates: BillingLoadingStates = {
  fetchBilling: false,
  fetchHistory: false,
  useCredits: false,
  purchaseCredits: false,
  updatePlan: false,
};

function createErrorState(operation: string, error: ApiError | Error, retryable: boolean = false): BillingErrorState {
  const message = 'error' in error ? error.error : error.message;
  return {
    operation,
    message,
    timestamp: Date.now(),
    retryable,
  };
}

export const useBillingStore = create<BillingState>((set, get) => ({
  // Initial State
  billingInfo: null,
  creditHistory: [],
  loadingStates: initialLoadingStates,
  error: null,

  fetchBillingInfo: async () => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchBilling: true },
      error: null,
    }));
    
    try {
      const response = await api.get<{ ok: boolean; data: BillingInfo }>("/api/billing");
      set((state) => ({
        billingInfo: response.data,
        loadingStates: { ...state.loadingStates, fetchBilling: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('fetchBillingInfo', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, fetchBilling: false },
      }));
      throw error;
    }
  },

  fetchCreditHistory: async (limit: number = 50) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, fetchHistory: true },
      error: null,
    }));
    
    try {
      const response = await api.get<{ ok: boolean; data: CreditUsageHistory[] }>(
        `/api/billing/history?limit=${limit}`
      );
      set((state) => ({
        creditHistory: response.data || [],
        loadingStates: { ...state.loadingStates, fetchHistory: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('fetchCreditHistory', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, fetchHistory: false },
      }));
      throw error;
    }
  },

  useCredits: async (amount: number, reason: string, metadata: any = {}) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, useCredits: true },
      error: null,
    }));
    
    try {
      const response = await api.post<{ 
        ok: boolean; 
        data: { success: boolean; billing: BillingInfo } 
      }>("/api/billing/use", {
        amount,
        reason,
        metadata,
      });
      
      set((state) => ({
        billingInfo: response.data.billing,
        loadingStates: { ...state.loadingStates, useCredits: false },
      }));
      
      return response.data.success;
    } catch (error: any) {
      const errorState = createErrorState('useCredits', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, useCredits: false },
      }));
      throw error;
    }
  },

  purchaseCredits: async (amount: number, paymentMethod: string, metadata: any = {}) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, purchaseCredits: true },
      error: null,
    }));
    
    try {
      const response = await api.post<{ 
        ok: boolean; 
        data: { success: boolean; billing: BillingInfo } 
      }>("/api/billing/purchase", {
        amount,
        payment_method: paymentMethod,
        metadata,
      });
      
      set((state) => ({
        billingInfo: response.data.billing,
        loadingStates: { ...state.loadingStates, purchaseCredits: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('purchaseCredits', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, purchaseCredits: false },
      }));
      throw error;
    }
  },

  updatePlan: async (plan: "free" | "pro" | "business") => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, updatePlan: true },
      error: null,
    }));
    
    try {
      const response = await api.patch<{ ok: boolean; data: BillingInfo }>("/api/billing/plan", {
        plan,
      });
      
      set((state) => ({
        billingInfo: response.data,
        loadingStates: { ...state.loadingStates, updatePlan: false },
      }));
    } catch (error: any) {
      const errorState = createErrorState('updatePlan', error, true);
      set((state) => ({
        error: errorState,
        loadingStates: { ...state.loadingStates, updatePlan: false },
      }));
      throw error;
    }
  },

  hasEnoughCredits: (amount: number) => {
    const state = get();
    return (state.billingInfo?.credits || 0) >= amount;
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      billingInfo: null,
      creditHistory: [],
      loadingStates: initialLoadingStates,
      error: null,
    });
  },
}));
