import type { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * GET /api/tags
 * Returns all tags for the authenticated user
 */
export async function getTags(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
      return;
    }

    res.json({ tags: data || [] });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/tags
 * Creates a new tag
 */
export async function createTag(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { name, color } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "Tag name is required" });
      return;
    }

    if (name.length > 50) {
      res.status(400).json({ error: "Tag name must be 50 characters or less" });
      return;
    }

    if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
      res.status(400).json({ error: "Valid hex color code is required (e.g., #00D9A3)" });
      return;
    }

    const { data, error } = await supabase
      .from("tags")
      .insert({
        user_id: userId,
        name: name.trim(),
        color: color.toUpperCase(),
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505") {
        res.status(409).json({ error: "A tag with this name already exists" });
        return;
      }
      console.error("Error creating tag:", error);
      res.status(500).json({ error: "Failed to create tag" });
      return;
    }

    res.status(201).json({ tag: data });
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PATCH /api/tags/:id
 * Updates a tag's name or color
 */
export async function updateTag(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const tagId = req.params.id;
    const { name, color } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Verify tag belongs to user
    const { error: verifyError } = await supabase
      .from("tags")
      .select("id")
      .eq("id", tagId)
      .eq("user_id", userId)
      .single();

    if (verifyError) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    const updates: any = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({ error: "Tag name cannot be empty" });
        return;
      }
      if (name.length > 50) {
        res.status(400).json({ error: "Tag name must be 50 characters or less" });
        return;
      }
      updates.name = name.trim();
    }

    if (color !== undefined) {
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        res.status(400).json({ error: "Valid hex color code is required" });
        return;
      }
      updates.color = color.toUpperCase();
    }

    const { data, error } = await supabase
      .from("tags")
      .update(updates)
      .eq("id", tagId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        res.status(409).json({ error: "A tag with this name already exists" });
        return;
      }
      console.error("Error updating tag:", error);
      res.status(500).json({ error: "Failed to update tag" });
      return;
    }

    res.json({ tag: data });
  } catch (error) {
    console.error("Update tag error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/tags/:id
 * Deletes a tag and all its associations
 */
export async function deleteTag(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const tagId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { error } = await supabase
      .from("tags")
      .delete()
      .eq("id", tagId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ error: "Failed to delete tag" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/projects/:id/tags
 * Adds a tag to a project
 */
export async function addProjectTag(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.id;
    const { tag_id } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!tag_id) {
      res.status(400).json({ error: "tag_id is required" });
      return;
    }

    // Verify project belongs to user
    const { error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projectError) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Verify tag belongs to user
    const { error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("id", tag_id)
      .eq("user_id", userId)
      .single();

    if (tagError) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    const { error } = await supabase
      .from("project_tags")
      .insert({
        project_id: projectId,
        tag_id: tag_id,
      });

    if (error) {
      if (error.code === "23505") {
        res.status(409).json({ error: "Tag already added to project" });
        return;
      }
      console.error("Error adding project tag:", error);
      res.status(500).json({ error: "Failed to add tag" });
      return;
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Add project tag error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/projects/:id/tags/:tagId
 * Removes a tag from a project
 */
export async function removeProjectTag(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.id;
    const tagId = req.params.tagId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Verify project belongs to user
    const { error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projectError) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const { error } = await supabase
      .from("project_tags")
      .delete()
      .eq("project_id", projectId)
      .eq("tag_id", tagId);

    if (error) {
      console.error("Error removing project tag:", error);
      res.status(500).json({ error: "Failed to remove tag" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Remove project tag error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/runs/:id/tags
 * Adds a tag to a run
 */
export async function addRunTag(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const runId = req.params.id;
    const { tag_id } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!tag_id) {
      res.status(400).json({ error: "tag_id is required" });
      return;
    }

    // Verify run belongs to user
    const { error: runError } = await supabase
      .from("runs")
      .select("id")
      .eq("id", runId)
      .eq("user_id", userId)
      .single();

    if (runError) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    // Verify tag belongs to user
    const { error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("id", tag_id)
      .eq("user_id", userId)
      .single();

    if (tagError) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    const { error } = await supabase
      .from("run_tags")
      .insert({
        run_id: runId,
        tag_id: tag_id,
      });

    if (error) {
      if (error.code === "23505") {
        res.status(409).json({ error: "Tag already added to run" });
        return;
      }
      console.error("Error adding run tag:", error);
      res.status(500).json({ error: "Failed to add tag" });
      return;
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Add run tag error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/runs/:id/tags/:tagId
 * Removes a tag from a run
 */
export async function removeRunTag(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const runId = req.params.id;
    const tagId = req.params.tagId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Verify run belongs to user
    const { error: runError } = await supabase
      .from("runs")
      .select("id")
      .eq("id", runId)
      .eq("user_id", userId)
      .single();

    if (runError) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    const { error } = await supabase
      .from("run_tags")
      .delete()
      .eq("run_id", runId)
      .eq("tag_id", tagId);

    if (error) {
      console.error("Error removing run tag:", error);
      res.status(500).json({ error: "Failed to remove tag" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Remove run tag error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
