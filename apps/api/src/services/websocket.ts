import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { supabase } from "../config/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// WebSocket connection registry
const connections = new Map<string, WebSocket>();
const userConnections = new Map<string, Set<string>>();

export interface WSMessage {
  type: "auth" | "run" | "cancel" | "ping" | "pong";
  token?: string;
  projectId?: string;
  input?: string;
  model?: string;
  requestId?: string;
}

export interface WSResponse {
  type: "authenticated" | "chunk" | "complete" | "error" | "status" | "pong";
  content?: string;
  status?: string;
  run?: any;
  error?: string;
  requestId?: string;
}

export function setupWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    const connectionId = generateConnectionId();
    let userId: string | null = null;
    let authenticated = false;

    connections.set(connectionId, ws);

    // Heartbeat mechanism
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    ws.on("message", async (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());

        // Handle authentication
        if (message.type === "auth") {
          if (!message.token) {
            ws.send(JSON.stringify({ type: "error", error: "Token required" }));
            return;
          }

          // Validate token with Supabase
          const { data: { user }, error } = await supabase.auth.getUser(message.token);
          
          if (error || !user) {
            ws.send(JSON.stringify({ type: "error", error: "Invalid token" }));
            ws.close();
            return;
          }

          userId = user.id;
          authenticated = true;

          // Register user connection
          if (!userConnections.has(userId)) {
            userConnections.set(userId, new Set());
          }
          userConnections.get(userId)!.add(connectionId);

          ws.send(JSON.stringify({ type: "authenticated", userId }));
          return;
        }

        // Require authentication for other messages
        if (!authenticated || !userId) {
          ws.send(JSON.stringify({ type: "error", error: "Not authenticated" }));
          return;
        }

        // Handle AI run request
        if (message.type === "run") {
          await handleRunRequest(ws, userId, message);
          return;
        }

        // Handle cancellation
        if (message.type === "cancel") {
          ws.send(JSON.stringify({ type: "status", status: "cancelled", requestId: message.requestId }));
          return;
        }

        // Handle ping/pong
        if (message.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
          return;
        }

      } catch (error: any) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ type: "error", error: error.message || "Invalid message" }));
      }
    });

    ws.on("close", () => {
      clearInterval(heartbeatInterval);
      connections.delete(connectionId);
      
      if (userId && userConnections.has(userId)) {
        userConnections.get(userId)!.delete(connectionId);
        if (userConnections.get(userId)!.size === 0) {
          userConnections.delete(userId);
        }
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      connections.delete(connectionId);
    });
  });

  return wss;
}

async function handleRunRequest(ws: WebSocket, userId: string, message: WSMessage): Promise<void> {
  const { projectId, input, model, requestId } = message;

  if (!projectId || !input) {
    ws.send(JSON.stringify({ type: "error", error: "Project ID and input required", requestId }));
    return;
  }

  try {
    // Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (!project) {
      ws.send(JSON.stringify({ type: "error", error: "Project not found", requestId }));
      return;
    }

    // Get or create active session
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

    // Send status update
    ws.send(JSON.stringify({ type: "status", status: "processing", requestId }));

    // Stream AI response
    let fullOutput = "";
    const selectedModel = model || "gpt-3.5-turbo";

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
        ws.send(JSON.stringify({ type: "chunk", content, requestId }));
      }
    }

    // Save run to database
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

    ws.send(JSON.stringify({ type: "complete", run, requestId }));

  } catch (error: any) {
    console.error("Run request error:", error);
    ws.send(JSON.stringify({ 
      type: "error", 
      error: error.message || "Failed to process request",
      requestId 
    }));
  }
}

function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function getUserConnections(userId: string): Set<string> {
  return userConnections.get(userId) || new Set();
}

export function broadcastToUser(userId: string, message: WSResponse): void {
  const connectionIds = getUserConnections(userId);
  const messageStr = JSON.stringify(message);
  
  connectionIds.forEach(connId => {
    const ws = connections.get(connId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}
