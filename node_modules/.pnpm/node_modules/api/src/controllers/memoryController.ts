import type { Request, Response } from "express";
import { supabase } from "../config/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GET /api/projects/:id/memory
 * Get project memory summary
 */
export async function getProjectMemory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase
      .from("project_memory")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching memory:", error);
      res.status(500).json({ error: "Failed to fetch memory" });
      return;
    }

    res.json({ memory: data || null });
  } catch (error) {
    console.error("Get memory error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/projects/:id/memory/generate
 * Generate or update project memory from recent runs
 */
export async function generateProjectMemory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id, name, description")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const { data: runs } = await supabase
      .from("runs")
      .select("input, output, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!runs || runs.length === 0) {
      res.status(400).json({ error: "No runs found to summarize" });
      return;
    }

    const conversationText = runs
      .reverse()
      .map((r, i) => `[${i + 1}] User: ${r.input}\nAssistant: ${r.output}`)
      .join("\n\n");

    const systemPrompt = `You are summarizing a project conversation. Create a concise summary highlighting:
1. Main objectives and goals
2. Key decisions made
3. Technical approaches discussed
4. Important learnings
5. Current status

Project: ${project.name}${project.description ? ` - ${project.description}` : ""}

Provide your response as JSON with this structure:
{
  "summary": "A 2-3 sentence high-level summary",
  "key_points": ["point 1", "point 2", ...],
  "topics": ["topic1", "topic2", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: conversationText },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "Failed to generate summary" });
      return;
    }

    const parsed = JSON.parse(content);

    const { data: existingMemory } = await supabase
      .from("project_memory")
      .select("id")
      .eq("project_id", projectId)
      .single();

    let memory;
    if (existingMemory) {
      const { data, error } = await supabase
        .from("project_memory")
        .update({
          summary: parsed.summary,
          key_points: parsed.key_points,
          topics: parsed.topics,
          run_count: runs.length,
          last_updated: new Date().toISOString(),
        })
        .eq("project_id", projectId)
        .select()
        .single();

      if (error) {
        console.error("Error updating memory:", error);
        res.status(500).json({ error: "Failed to update memory" });
        return;
      }
      memory = data;
    } else {
      const { data, error } = await supabase
        .from("project_memory")
        .insert({
          project_id: projectId,
          user_id: userId,
          summary: parsed.summary,
          key_points: parsed.key_points,
          topics: parsed.topics,
          run_count: runs.length,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating memory:", error);
        res.status(500).json({ error: "Failed to create memory" });
        return;
      }
      memory = data;
    }

    res.json({ memory });
  } catch (error) {
    console.error("Generate memory error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/projects/:id/memory
 * Clear project memory
 */
export async function deleteProjectMemory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { error } = await supabase
      .from("project_memory")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting memory:", error);
      res.status(500).json({ error: "Failed to delete memory" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Delete memory error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
