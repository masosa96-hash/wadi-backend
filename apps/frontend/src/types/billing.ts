// Billing and usage tracking types

export interface BillingPlan {
    id: string;
    name: "free" | "pro";
    displayName: string;
    price: number; // Monthly price in cents
    currency: string;
    limits: UsageLimits;
    features: string[];
}

export interface UsageLimits {
    monthlyMessages: number;
    dailyMessages: number;
    maxFileSize: number; // MB
    maxFilesPerMessage: number;
    maxProjects: number;
    maxWorkspaces: number;
    aiFlowsEnabled: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
}

export interface UserUsage {
    userId: string;
    planId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    messagesUsed: number;
    dailyMessagesUsed: number;
    lastResetDate: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}

export interface UsageRecord {
    id: string;
    userId: string;
    type: "message" | "file_upload" | "ai_flow" | "api_call";
    timestamp: Date;
    metadata?: any;
}

// Predefined plans
export const BILLING_PLANS: Record<string, BillingPlan> = {
    free: {
        id: "free",
        name: "free",
        displayName: "Free",
        price: 0,
        currency: "USD",
        limits: {
            monthlyMessages: 100,
            dailyMessages: 10,
            maxFileSize: 5,
            maxFilesPerMessage: 1,
            maxProjects: 3,
            maxWorkspaces: 1,
            aiFlowsEnabled: false,
            prioritySupport: false,
            customBranding: false,
        },
        features: [
            "100 mensajes por mes",
            "10 mensajes por día",
            "Hasta 3 proyectos",
            "1 workspace",
            "Archivos hasta 5MB",
        ],
    },
    pro: {
        id: "pro",
        name: "pro",
        displayName: "Pro",
        price: 1999, // $19.99
        currency: "USD",
        limits: {
            monthlyMessages: 10000,
            dailyMessages: 500,
            maxFileSize: 50,
            maxFilesPerMessage: 10,
            maxProjects: 100,
            maxWorkspaces: 10,
            aiFlowsEnabled: true,
            prioritySupport: true,
            customBranding: true,
        },
        features: [
            "10,000 mensajes por mes",
            "500 mensajes por día",
            "Proyectos ilimitados",
            "Hasta 10 workspaces",
            "Archivos hasta 50MB",
            "AI Flows avanzados",
            "Soporte prioritario",
            "Personalización de marca",
        ],
    },
};

export function getPlanLimits(planId: string): UsageLimits {
    return BILLING_PLANS[planId]?.limits || BILLING_PLANS.free.limits;
}

export function canUseFeature(
    usage: UserUsage,
    feature: keyof UsageLimits
): boolean {
    const limits = getPlanLimits(usage.planId);

    switch (feature) {
        case "monthlyMessages":
            return usage.messagesUsed < limits.monthlyMessages;
        case "dailyMessages":
            return usage.dailyMessagesUsed < limits.dailyMessages;
        default:
            return limits[feature] as boolean;
    }
}
