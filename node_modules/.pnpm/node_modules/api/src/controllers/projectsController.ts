import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * GET /api/projects
 * Returns all projects for the authenticated user
 * Optionally filter by workspace_id query parameter
 */
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const workspaceId = req.query.workspace_id as string | undefined;
    console.log("[getProjects] Request from user:", userId, "Workspace filter:", workspaceId);

    if (!userId) {
      console.error("[getProjects] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    let query = supabase
      .from("projects")
      .select(`
        *,
        project_tags(
          tag:tags(
            id,
            name,
            color
          )
        )
      `)
      .eq("user_id", userId);

    // Filter by workspace if provided
    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("[getProjects] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to fetch projects" } });
      return;
    }

    console.log(`[getProjects] Success: Found ${data?.length || 0} projects`);
    res.json({ ok: true, data: data || [] });
  } catch (error) {
    console.error("[getProjects] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * POST /api/projects
 * Creates a new project for the authenticated user
 * Optionally associate with a workspace
 */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    console.log("[createProject] Request from user:", userId, "Body:", req.body);

    if (!userId) {
      console.error("[createProject] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    const { name, description, workspace_id } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      console.error("[createProject] Validation failed: Missing name");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Project name is required" } });
      return;
    }

    if (name.length > 100) {
      console.error("[createProject] Validation failed: Name too long");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Project name must be 100 characters or less" } });
      return;
    }

    if (description && typeof description === "string" && description.length > 500) {
      console.error("[createProject] Validation failed: Description too long");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Description must be 500 characters or less" } });
      return;
    }

    // If workspace_id is provided, verify user has access
    if (workspace_id) {
      const { data: memberData, error: memberError } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", workspace_id)
        .eq("user_id", userId)
        .single();

      if (memberError || !memberData) {
        console.error("[createProject] User not member of workspace:", memberError);
        res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "You are not a member of this workspace" } });
        return;
      }
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        workspace_id: workspace_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[createProject] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to create project" } });
      return;
    }

    console.log("[createProject] Success: Created project", data.id);
    res.status(201).json({ ok: true, data });
  } catch (error) {
    console.error("[createProject] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * GET /api/projects/:id
 * Returns a specific project
 */
export async function getProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.id;
    console.log("[getProject] Request from user:", userId, "Project:", projectId);

    if (!userId) {
      console.error("[getProject] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("[getProject] Not found:", error);
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Project not found" } });
      return;
    }

    console.log("[getProject] Success:", data.name);
    res.json({ ok: true, data });
  } catch (error) {
    console.error("[getProject] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}
