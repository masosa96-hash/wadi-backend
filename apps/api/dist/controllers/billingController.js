"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBillingInfo = getBillingInfo;
exports.getCreditHistory = getCreditHistory;
exports.useCredits = useCredits;
exports.purchaseCredits = purchaseCredits;
exports.updatePlan = updatePlan;
const supabase_1 = require("../config/supabase");
/**
 * GET /api/billing
 * Returns billing information for the authenticated user
 */
async function getBillingInfo(req, res) {
    try {
        const userId = req.user_id;
        console.log("[getBillingInfo] Request from user:", userId);
        if (!userId) {
            console.error("[getBillingInfo] Unauthorized: No user_id");
            res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
            return;
        }
        const { data, error } = await supabase_1.supabase
            .from("billing_info")
            .select("*")
            .eq("user_id", userId)
            .single();
        if (error) {
            console.error("[getBillingInfo] Supabase error:", error);
            res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to fetch billing info" } });
            return;
        }
        console.log("[getBillingInfo] Success:", data?.plan);
        res.json({ ok: true, data });
    }
    catch (error) {
        console.error("[getBillingInfo] Exception:", error);
        res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
    }
}
/**
 * GET /api/billing/history
 * Returns credit usage history for the authenticated user
 */
async function getCreditHistory(req, res) {
    try {
        const userId = req.user_id;
        const limit = parseInt(req.query.limit) || 50;
        console.log("[getCreditHistory] Request from user:", userId, "Limit:", limit);
        if (!userId) {
            console.error("[getCreditHistory] Unauthorized: No user_id");
            res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
            return;
        }
        const { data, error } = await supabase_1.supabase
            .from("credit_usage_history")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);
        if (error) {
            console.error("[getCreditHistory] Supabase error:", error);
            res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to fetch credit history" } });
            return;
        }
        console.log(`[getCreditHistory] Success: Found ${data?.length || 0} records`);
        res.json({ ok: true, data: data || [] });
    }
    catch (error) {
        console.error("[getCreditHistory] Exception:", error);
        res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
    }
}
/**
 * POST /api/billing/use
 * Deducts credits from user's account
 */
async function useCredits(req, res) {
    try {
        const userId = req.user_id;
        const { amount, reason, metadata = {} } = req.body;
        console.log("[useCredits] Request from user:", userId, "Amount:", amount, "Reason:", reason);
        if (!userId) {
            console.error("[useCredits] Unauthorized: No user_id");
            res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
            return;
        }
        // Validation
        if (!amount || typeof amount !== "number" || amount <= 0) {
            res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Valid amount is required" } });
            return;
        }
        if (!reason || typeof reason !== "string") {
            res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Reason is required" } });
            return;
        }
        // Call Postgres function to use credits
        const { data, error } = await supabase_1.supabase.rpc("use_credits", {
            p_user_id: userId,
            p_amount: amount,
            p_reason: reason,
            p_metadata: metadata,
        });
        if (error) {
            console.error("[useCredits] Supabase error:", error);
            res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to use credits" } });
            return;
        }
        if (!data) {
            console.error("[useCredits] Insufficient credits");
            res.status(402).json({ ok: false, error: { code: "INSUFFICIENT_CREDITS", message: "Not enough credits" } });
            return;
        }
        // Get updated billing info
        const { data: billingInfo, error: billingError } = await supabase_1.supabase
            .from("billing_info")
            .select("*")
            .eq("user_id", userId)
            .single();
        if (billingError) {
            console.error("[useCredits] Failed to fetch updated billing info:", billingError);
        }
        console.log("[useCredits] Success: Used", amount, "credits");
        res.json({ ok: true, data: { success: true, billing: billingInfo } });
    }
    catch (error) {
        console.error("[useCredits] Exception:", error);
        res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
    }
}
/**
 * POST /api/billing/purchase
 * Adds credits to user's account (purchase/top-up)
 */
async function purchaseCredits(req, res) {
    try {
        const userId = req.user_id;
        const { amount, payment_method, metadata = {} } = req.body;
        console.log("[purchaseCredits] Request from user:", userId, "Amount:", amount);
        if (!userId) {
            console.error("[purchaseCredits] Unauthorized: No user_id");
            res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
            return;
        }
        // Validation
        if (!amount || typeof amount !== "number" || amount <= 0) {
            res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Valid amount is required" } });
            return;
        }
        // Here you would integrate with Stripe or payment processor
        // For now, we'll simulate a successful purchase
        // Call Postgres function to add credits
        const { data, error } = await supabase_1.supabase.rpc("add_credits", {
            p_user_id: userId,
            p_amount: amount,
            p_reason: "Credit purchase",
            p_metadata: { ...metadata, payment_method },
        });
        if (error) {
            console.error("[purchaseCredits] Supabase error:", error);
            res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to purchase credits" } });
            return;
        }
        // Get updated billing info
        const { data: billingInfo, error: billingError } = await supabase_1.supabase
            .from("billing_info")
            .select("*")
            .eq("user_id", userId)
            .single();
        if (billingError) {
            console.error("[purchaseCredits] Failed to fetch updated billing info:", billingError);
        }
        console.log("[purchaseCredits] Success: Added", amount, "credits");
        res.status(201).json({ ok: true, data: { success: true, billing: billingInfo } });
    }
    catch (error) {
        console.error("[purchaseCredits] Exception:", error);
        res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
    }
}
/**
 * PATCH /api/billing/plan
 * Updates user's subscription plan
 */
async function updatePlan(req, res) {
    try {
        const userId = req.user_id;
        const { plan } = req.body;
        console.log("[updatePlan] Request from user:", userId, "New plan:", plan);
        if (!userId) {
            console.error("[updatePlan] Unauthorized: No user_id");
            res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
            return;
        }
        // Validation
        if (!plan || !["free", "pro", "business"].includes(plan)) {
            res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Valid plan is required (free, pro, business)" } });
            return;
        }
        // Determine new credit allocation based on plan
        const planCredits = {
            free: 200,
            pro: 5000,
            business: 20000,
        };
        const newCredits = planCredits[plan];
        // Update plan and reset credits
        const { data, error } = await supabase_1.supabase
            .from("billing_info")
            .update({
            plan,
            credits: newCredits,
            credits_used: 0,
            renew_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
            .eq("user_id", userId)
            .select()
            .single();
        if (error) {
            console.error("[updatePlan] Supabase error:", error);
            res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to update plan" } });
            return;
        }
        console.log("[updatePlan] Success: Updated to", plan);
        res.json({ ok: true, data });
    }
    catch (error) {
        console.error("[updatePlan] Exception:", error);
        res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
    }
}
