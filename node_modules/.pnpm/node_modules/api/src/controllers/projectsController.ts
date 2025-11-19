import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * GET /api/projects
 * Returns all projects for the authenticated user
 */
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase
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
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
      return;
    }

    res.json({ projects: data || [] });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/projects
 * Creates a new project for the authenticated user
 */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, description } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "Project name is required" });
      return;
    }

    if (name.length > 100) {
      res.status(400).json({ error: "Project name must be 100 characters or less" });
      return;
    }

    if (description && typeof description === "string" && description.length > 500) {
      res.status(400).json({ error: "Description must be 500 characters or less" });
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
      return;
    }

    res.status(201).json({ project: data });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
