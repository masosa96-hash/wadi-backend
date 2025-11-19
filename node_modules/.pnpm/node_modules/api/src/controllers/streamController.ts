import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function streamRun(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const projectId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { input, model } = req.body;

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      res.status(400).json({ error: "Input is required" });
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

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullOutput = "";
    const selectedModel = model || "gpt-3.5-turbo";

    try {
      const stream = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: input.trim() },
        ],
        stream: true,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullOutput += content;
          const data = JSON.stringify({ type: "chunk", content });
          res.write("data: " + data + "\n\n");
        }
      }

      const { data: run } = await supabase
        .from("runs")
        .insert({
          project_id: projectId,
          user_id: userId,
          input: input.trim(),
          output: fullOutput,
          model: selectedModel,
          session_id: sessionId,
        })
        .select()
        .single();

      const completeData = JSON.stringify({ type: "complete", run });
      res.write("data: " + completeData + "\n\n");
      res.end();
    } catch (error: any) {
      const errorData = JSON.stringify({ 
        type: "error", 
        message: error.message || "AI generation failed" 
      });
      res.write("data: " + errorData + "\n\n");
      res.end();
    }
  } catch (error) {
    console.error("Stream error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
