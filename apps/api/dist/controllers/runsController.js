"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuns = getRuns;
exports.createRun = createRun;
exports.updateRun = updateRun;
const supabase_1 = require("../config/supabase");
const openai_1 = require("../services/openai");
/**
 * GET /api/projects/:id/runs
 * Returns all runs for a specific project
 */
async function getRuns(req, res) {
    try {
        const userId = req.user_id;
        const projectId = req.params.id;
        console.log("[getRuns] Request from user:", userId, "Project:", projectId);
        if (!userId) {
            console.error("[getRuns] Unauthorized: No user_id");
            res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
            return;
        }
        // Verify project belongs to user
        const { data: project, error: projectError } = await supabase_1.supabase
            .from("projects")
            .select("id")
            .eq("id", projectId)
            .eq("user_id", userId)
            .single();
        if (projectError || !project) {
            console.error("[getRuns] Project not found:", projectError);
            res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Project not found" } });
            return;
        }
        // Fetch runs for the project
        const { data, error } = await supabase_1.supabase
            .from("runs")
            .select(`
        *,
        run_tags(
          tag:tags(
            id,
            name,
            color
          )
        )
      `)
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });
        if (error) {
            console.error("[getRuns] Supabase error:", error);
            res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to fetch runs" } });
            return;
        }
        console.log(`[getRuns] Success: Found ${data?.length || 0} runs`);
        res.json({ ok: true, data: data || [] });
    }
    catch (error) {
        console.error("[getRuns] Exception:", error);
        res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
    }
}
/**
 * POST /api/projects/:id/runs
 * Creates a new run with AI generation
 * Consumes credits based on model used
 */
async function createRun(req, res) {
    try {
        const userId = req.user_id;
        const projectId = req.params.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { input, model } = req.body;
        // Validation
        if (!input || typeof input !== "string" || input.trim().length === 0) {
            res.status(400).json({ error: "Input is required" });
            return;
        }
        if (input.length > 5000) {
            res.status(400).json({ error: "Input must be 5000 characters or less" });
            return;
        }
        // Validate model if provided
        const selectedModel = model || "gpt-3.5-turbo";
        if (model && !(0, openai_1.isValidModel)(model)) {
            res.status(400).json({ error: "Invalid model name" });
            return;
        }
        // Verify project belongs to user
        const { data: project, error: projectError } = await supabase_1.supabase
            .from("projects")
            .select("id")
            .eq("id", projectId)
            .eq("user_id", userId)
            .single();
        if (projectError || !project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }
        // Calculate credit cost based on model
        const creditCost = selectedModel.includes("gpt-4") ? 10 : 1;
        // Check if user has enough credits
        const { data: billingInfo, error: billingError } = await supabase_1.supabase
            .from("billing_info")
            .select("credits")
            .eq("user_id", userId)
            .single();
        if (billingError || !billingInfo) {
            console.error("[createRun] Failed to fetch billing info:", billingError);
            res.status(500).json({ error: "Failed to verify credits" });
            return;
        }
        if (billingInfo.credits < creditCost) {
            res.status(402).json({
                error: "Insufficient credits",
                code: "INSUFFICIENT_CREDITS",
                required: creditCost,
                available: billingInfo.credits
            });
            return;
        }
        // Use credits
        const { data: creditSuccess, error: creditError } = await supabase_1.supabase.rpc("use_credits", {
            p_user_id: userId,
            p_amount: creditCost,
            p_reason: "AI run generation",
            p_metadata: { model: selectedModel, project_id: projectId },
        });
        if (creditError || !creditSuccess) {
            console.error("[createRun] Failed to deduct credits:", creditError);
            res.status(402).json({ error: "Failed to deduct credits" });
            return;
        }
        // Generate AI response
        let output;
        try {
            output = await (0, openai_1.generateCompletion)(input.trim(), selectedModel);
        }
        catch (aiError) {
            console.error("AI generation error:", aiError);
            // Refund credits on AI failure
            await supabase_1.supabase.rpc("add_credits", {
                p_user_id: userId,
                p_amount: creditCost,
                p_reason: "AI generation failed - refund",
                p_metadata: { model: selectedModel, project_id: projectId },
            });
            res.status(500).json({ error: aiError.message || "Failed to generate AI response" });
            return;
        }
        // Get active session for this project or create one
        let sessionId = null;
        const { data: activeSession } = await supabase_1.supabase
            .from("sessions")
            .select("id")
            .eq("project_id", projectId)
            .eq("user_id", userId)
            .eq("is_active", true)
            .single();
        if (activeSession) {
            sessionId = activeSession.id;
        }
        else {
            // Create new session if none exists
            const { data: newSession } = await supabase_1.supabase
                .from("sessions")
                .insert({
                project_id: projectId,
                user_id: userId,
                is_active: true,
            })
                .select()
                .single();
            if (newSession) {
                sessionId = newSession.id;
            }
        }
        // Save run to database
        const { data, error } = await supabase_1.supabase
            .from("runs")
            .insert({
            project_id: projectId,
            user_id: userId,
            input: input.trim(),
            output: output,
            model: selectedModel,
            session_id: sessionId,
        })
            .select()
            .single();
        if (error) {
            console.error("Error creating run:", error);
            res.status(500).json({ error: "Failed to save run" });
            return;
        }
        res.status(201).json({
            run: data,
            credits_used: creditCost,
            credits_remaining: billingInfo.credits - creditCost
        });
    }
    catch (error) {
        console.error("Create run error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
/**
 * PATCH /api/runs/:id
 * Updates a run (e.g., rename with custom_name)
 */
async function updateRun(req, res) {
    try {
        const userId = req.user_id;
        const runId = req.params.id;
        const { custom_name, session_id } = req.body;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        // Verify run belongs to user
        const { data: existingRun, error: runError } = await supabase_1.supabase
            .from("runs")
            .select("*")
            .eq("id", runId)
            .eq("user_id", userId)
            .single();
        if (runError || !existingRun) {
            res.status(404).json({ error: "Run not found" });
            return;
        }
        const updates = {};
        if (custom_name !== undefined) {
            updates.custom_name = custom_name;
        }
        if (session_id !== undefined) {
            // Verify session belongs to same project and user
            if (session_id !== null) {
                const { data: session, error: sessionError } = await supabase_1.supabase
                    .from("sessions")
                    .select("project_id, user_id")
                    .eq("id", session_id)
                    .eq("user_id", userId)
                    .single();
                if (sessionError || !session || session.project_id !== existingRun.project_id) {
                    res.status(400).json({ error: "Invalid session" });
                    return;
                }
            }
            updates.session_id = session_id;
        }
        const { data, error } = await supabase_1.supabase
            .from("runs")
            .update(updates)
            .eq("id", runId)
            .select()
            .single();
        if (error) {
            console.error("Error updating run:", error);
            res.status(500).json({ error: "Failed to update run" });
            return;
        }
        res.json({ run: data });
    }
    catch (error) {
        console.error("Update run error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
