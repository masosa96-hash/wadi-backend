import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { generateCompletion, isValidModel, mapToGroqModel } from "../services/openai";

/**
 * GET /api/projects/:id/runs
 * Returns all runs for a specific project
 */
export async function getRuns(req: Request, res: Response): Promise<void> {
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
    const { data: project, error: projectError } = await supabase
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
    const { data, error } = await supabase
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
  } catch (error) {
    console.error("[getRuns] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * POST /api/projects/:id/runs
 * Creates a new run with AI generation
 * Consumes credits based on model used
 */
export async function createRun(req: Request, res: Response): Promise<void> {
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
    const selectedModel = model || process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant";
    console.log(`[createRun] Using model: ${selectedModel}`);
    
    if (model && !isValidModel(model)) {
      console.error(`[createRun] Invalid model requested: ${model}`);
      res.status(400).json({ error: `Invalid model name: ${model}` });
      return;
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
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
    const { data: billingInfo, error: billingError } = await supabase
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
    const { data: creditSuccess, error: creditError } = await supabase.rpc("use_credits", {
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
    let output: string;
    try {
      console.log(`[createRun] Generating AI response for project ${projectId}`);
      output = await generateCompletion(input.trim(), selectedModel);
      console.log(`[createRun] AI response generated successfully`);
    } catch (aiError: any) {
      console.error("[createRun] AI generation error:", {
        message: aiError.message,
        stack: aiError.stack,
        model: selectedModel,
        inputLength: input.length,
      });
      
      // Refund credits on AI failure
      console.log(`[createRun] Refunding ${creditCost} credits to user ${userId}`);
      await supabase.rpc("add_credits", {
        p_user_id: userId,
        p_amount: creditCost,
        p_reason: "AI generation failed - refund",
        p_metadata: { model: selectedModel, project_id: projectId, error: aiError.message },
      });
      
      // Return specific error message
      const errorMessage = aiError.message || "Failed to generate AI response";
      res.status(500).json({ 
        error: errorMessage,
        code: "AI_GENERATION_ERROR",
        details: {
          model: selectedModel,
          timestamp: new Date().toISOString(),
        }
      });
      return;
    }

    // Get active session for this project or create one
    let sessionId: string | null = null;
    const { data: activeSession } = await supabase
      .from("sessions")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (activeSession) {
      sessionId = activeSession.id;
    } else {
      // Create new session if none exists
      const { data: newSession } = await supabase
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
    const { data, error } = await supabase
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
  } catch (error) {
    console.error("Create run error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PATCH /api/runs/:id
 * Updates a run (e.g., rename with custom_name)
 */
export async function updateRun(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const runId = req.params.id;
    const { custom_name, session_id } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Verify run belongs to user
    const { data: existingRun, error: runError } = await supabase
      .from("runs")
      .select("*")
      .eq("id", runId)
      .eq("user_id", userId)
      .single();

    if (runError || !existingRun) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    const updates: any = {};
    if (custom_name !== undefined) {
      updates.custom_name = custom_name;
    }
    if (session_id !== undefined) {
      // Verify session belongs to same project and user
      if (session_id !== null) {
        const { data: session, error: sessionError } = await supabase
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

    const { data, error } = await supabase
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
  } catch (error) {
    console.error("Update run error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
