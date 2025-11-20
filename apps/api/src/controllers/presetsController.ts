import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export interface Preset {
  id: string;
  user_id: string;
  workspace_id: string | null;
  project_id: string | null;
  name: string;
  description: string | null;
  content: string;
  model: string;
  folder: string | null;
  is_public: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/presets
 * Returns all presets for the authenticated user
 * Optionally filter by workspace_id or project_id
 */
export async function getPresets(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const workspaceId = req.query.workspace_id as string | undefined;
    const projectId = req.query.project_id as string | undefined;
    const folder = req.query.folder as string | undefined;
    
    console.log("[getPresets] Request from user:", userId, "Filters:", { workspaceId, projectId, folder });

    if (!userId) {
      console.error("[getPresets] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    let query = supabase
      .from("presets")
      .select("*")
      .or(`user_id.eq.${userId},is_public.eq.true`);

    // Apply filters
    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    if (folder) {
      query = query.eq("folder", folder);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("[getPresets] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to fetch presets" } });
      return;
    }

    console.log(`[getPresets] Success: Found ${data?.length || 0} presets`);
    res.json({ ok: true, data: data || [] });
  } catch (error) {
    console.error("[getPresets] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * POST /api/presets
 * Creates a new preset
 */
export async function createPreset(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    console.log("[createPreset] Request from user:", userId, "Body:", req.body);

    if (!userId) {
      console.error("[createPreset] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    const { name, description, content, model, workspace_id, project_id, folder, is_public, metadata } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      console.error("[createPreset] Validation failed: Missing name");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Preset name is required" } });
      return;
    }

    if (name.length > 200) {
      console.error("[createPreset] Validation failed: Name too long");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Name must be 200 characters or less" } });
      return;
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      console.error("[createPreset] Validation failed: Missing content");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Preset content is required" } });
      return;
    }

    if (description && typeof description === "string" && description.length > 1000) {
      console.error("[createPreset] Validation failed: Description too long");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Description must be 1000 characters or less" } });
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
        console.error("[createPreset] User not member of workspace:", memberError);
        res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "You are not a member of this workspace" } });
        return;
      }
    }

    // If project_id is provided, verify user has access
    if (project_id) {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", project_id)
        .eq("user_id", userId)
        .single();

      if (projectError || !projectData) {
        console.error("[createPreset] User doesn't have access to project:", projectError);
        res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "You don't have access to this project" } });
        return;
      }
    }

    const { data, error } = await supabase
      .from("presets")
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        content: content.trim(),
        model: model || "gpt-3.5-turbo",
        workspace_id: workspace_id || null,
        project_id: project_id || null,
        folder: folder?.trim() || null,
        is_public: is_public || false,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("[createPreset] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to create preset" } });
      return;
    }

    console.log("[createPreset] Success: Created preset", data.id);
    res.status(201).json({ ok: true, data });
  } catch (error) {
    console.error("[createPreset] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * GET /api/presets/:id
 * Returns a specific preset
 */
export async function getPreset(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const presetId = req.params.id;
    console.log("[getPreset] Request from user:", userId, "Preset:", presetId);

    if (!userId) {
      console.error("[getPreset] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    const { data, error } = await supabase
      .from("presets")
      .select("*")
      .eq("id", presetId)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .single();

    if (error || !data) {
      console.error("[getPreset] Not found:", error);
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Preset not found" } });
      return;
    }

    console.log("[getPreset] Success:", data.name);
    res.json({ ok: true, data });
  } catch (error) {
    console.error("[getPreset] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * PATCH /api/presets/:id
 * Updates a preset
 */
export async function updatePreset(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const presetId = req.params.id;
    console.log("[updatePreset] Request from user:", userId, "Preset:", presetId);

    if (!userId) {
      console.error("[updatePreset] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    // Verify preset belongs to user
    const { data: existingPreset, error: presetError } = await supabase
      .from("presets")
      .select("id")
      .eq("id", presetId)
      .eq("user_id", userId)
      .single();

    if (presetError || !existingPreset) {
      console.error("[updatePreset] Not found or unauthorized:", presetError);
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Preset not found" } });
      return;
    }

    const { name, description, content, model, folder, is_public, metadata } = req.body;
    const updates: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Preset name cannot be empty" } });
        return;
      }
      if (name.length > 200) {
        res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Name must be 200 characters or less" } });
        return;
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      if (description && typeof description === "string" && description.length > 1000) {
        res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Description must be 1000 characters or less" } });
        return;
      }
      updates.description = description?.trim() || null;
    }

    if (content !== undefined) {
      if (typeof content !== "string" || content.trim().length === 0) {
        res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Content cannot be empty" } });
        return;
      }
      updates.content = content.trim();
    }

    if (model !== undefined) updates.model = model;
    if (folder !== undefined) updates.folder = folder?.trim() || null;
    if (is_public !== undefined) updates.is_public = is_public;
    if (metadata !== undefined) updates.metadata = metadata;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "No valid fields to update" } });
      return;
    }

    const { data, error } = await supabase
      .from("presets")
      .update(updates)
      .eq("id", presetId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[updatePreset] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to update preset" } });
      return;
    }

    console.log("[updatePreset] Success:", data.id);
    res.json({ ok: true, data });
  } catch (error) {
    console.error("[updatePreset] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * DELETE /api/presets/:id
 * Deletes a preset
 */
export async function deletePreset(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const presetId = req.params.id;
    console.log("[deletePreset] Request from user:", userId, "Preset:", presetId);

    if (!userId) {
      console.error("[deletePreset] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    const { error } = await supabase
      .from("presets")
      .delete()
      .eq("id", presetId)
      .eq("user_id", userId);

    if (error) {
      console.error("[deletePreset] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to delete preset" } });
      return;
    }

    console.log("[deletePreset] Success:", presetId);
    res.json({ ok: true, message: "Preset deleted successfully" });
  } catch (error) {
    console.error("[deletePreset] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * POST /api/presets/:id/execute
 * Executes a preset by creating a run with the preset's content
 */
export async function executePreset(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const presetId = req.params.id;
    const { project_id } = req.body;

    console.log("[executePreset] Request from user:", userId, "Preset:", presetId, "Project:", project_id);

    if (!userId) {
      console.error("[executePreset] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    if (!project_id) {
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "project_id is required" } });
      return;
    }

    // Get preset
    const { data: preset, error: presetError } = await supabase
      .from("presets")
      .select("*")
      .eq("id", presetId)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .single();

    if (presetError || !preset) {
      console.error("[executePreset] Preset not found:", presetError);
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Preset not found" } });
      return;
    }

    // Verify user has access to project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("user_id", userId)
      .single();

    if (projectError || !project) {
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Project not found" } });
      return;
    }

    // Return preset info - the frontend will create the run using the runs API
    // This allows credit consumption and all other run logic to be handled properly
    res.json({ 
      ok: true, 
      data: {
        preset_id: preset.id,
        preset_name: preset.name,
        content: preset.content,
        model: preset.model,
        project_id: project_id
      }
    });
  } catch (error) {
    console.error("[executePreset] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}
