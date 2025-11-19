import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * Get all tasks for a project
 */
export async function getProjectTasks(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { projectId } = req.params;
    const { status, priority, assigned_to } = req.query;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Verify project access
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Build query
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (priority) {
      query = query.eq("priority", priority);
    }
    if (assigned_to) {
      query = query.eq("assigned_to", assigned_to);
    }

    const { data: tasks, error } = await query;

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ tasks: tasks || [] });
  } catch (error: any) {
    console.error("Get project tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Create a new task
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { projectId } = req.params;
    const { title, description, status, priority, due_date, assigned_to, ai_generated, metadata } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    // Verify project access
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Create task
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        user_id: userId,
        title: title.trim(),
        description: description || null,
        status: status || "pending",
        priority: priority || "medium",
        due_date: due_date || null,
        assigned_to: assigned_to || null,
        ai_generated: ai_generated || false,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json({ task });
  } catch (error: any) {
    console.error("Create task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Update a task
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { taskId } = req.params;
    const { title, description, status, priority, due_date, assigned_to, metadata } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if task exists and user has access
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("*, projects!inner(user_id)")
      .eq("task_id", taskId)
      .single();

    if (!existingTask || existingTask.projects.user_id !== userId) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Build update object
    const updates: any = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (due_date !== undefined) updates.due_date = due_date;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (metadata !== undefined) updates.metadata = metadata;

    // Update task
    const { data: task, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("task_id", taskId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ task });
  } catch (error: any) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Delete a task
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { taskId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if task exists and user has access
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("*, projects!inner(user_id)")
      .eq("task_id", taskId)
      .single();

    if (!existingTask || existingTask.projects.user_id !== userId) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Delete task
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("task_id", taskId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get a single task
 */
export async function getTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { taskId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .select("*, projects!inner(user_id)")
      .eq("task_id", taskId)
      .single();

    if (error || !task || task.projects.user_id !== userId) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json({ task });
  } catch (error: any) {
    console.error("Get task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
