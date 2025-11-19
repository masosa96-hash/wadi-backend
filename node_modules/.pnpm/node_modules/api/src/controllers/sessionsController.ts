import type { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * GET /api/projects/:projectId/sessions
 * Returns all sessions for a specific project
 */
export async function getSessions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.projectId;

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

    // Fetch sessions for the project
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
      return;
    }

    res.json({ sessions: data || [] });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/sessions/:id
 * Returns a specific session with its details
 */
export async function getSession(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const sessionId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({ session: data });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/projects/:projectId/sessions
 * Creates a new session in a project
 */
export async function createSession(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.projectId;
    const { name, description } = req.body;

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

    // Deactivate other active sessions for this project
    await supabase
      .from("sessions")
      .update({ is_active: false })
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .eq("is_active", true);

    // Create new session
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        project_id: projectId,
        user_id: userId,
        name: name || null,
        description: description || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
      return;
    }

    res.status(201).json({ session: data });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PATCH /api/sessions/:id
 * Updates a session's name/description
 */
export async function updateSession(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const sessionId = req.params.id;
    const { name, description, is_active } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Verify session belongs to user
    const { data: existingSession, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError || !existingSession) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (is_active !== undefined) {
      updates.is_active = is_active;
      
      // If activating this session, deactivate others
      if (is_active) {
        await supabase
          .from("sessions")
          .update({ is_active: false })
          .eq("project_id", existingSession.project_id)
          .eq("user_id", userId)
          .neq("id", sessionId);
      }
    }

    const { data, error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
      return;
    }

    res.json({ session: data });
  } catch (error) {
    console.error("Update session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/sessions/:id
 * Deletes a session (runs' session_id will be set to NULL)
 */
export async function deleteSession(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const sessionId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Verify session belongs to user
    const { error: verifyError } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (verifyError) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Delete session (cascade will set runs.session_id to NULL)
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/sessions/:id/runs
 * Returns all runs for a specific session
 */
export async function getSessionRuns(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const sessionId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Verify session belongs to user
    const { error: verifyError } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (verifyError) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Fetch runs for the session
    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching session runs:", error);
      res.status(500).json({ error: "Failed to fetch runs" });
      return;
    }

    res.json({ runs: data || [] });
  } catch (error) {
    console.error("Get session runs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
