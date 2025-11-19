import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { generateCompletion, isValidModel } from "../services/openai";

/**
 * GET /api/projects/:id/runs
 * Returns all runs for a specific project
 */
export async function getRuns(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
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
      console.error("Error fetching runs:", error);
      res.status(500).json({ error: "Failed to fetch runs" });
      return;
    }

    res.json({ runs: data || [] });
  } catch (error) {
    console.error("Get runs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/projects/:id/runs
 * Creates a new run with AI generation
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
    const selectedModel = model || "gpt-3.5-turbo";
    if (model && !isValidModel(model)) {
      res.status(400).json({ error: "Invalid model name" });
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

    // Generate AI response
    let output: string;
    try {
      output = await generateCompletion(input.trim(), selectedModel);
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);
      res.status(500).json({ error: aiError.message || "Failed to generate AI response" });
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

    res.status(201).json({ run: data });
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
