"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocketServer = setupWebSocketServer;
exports.streamRunToClient = streamRunToClient;
exports.getActiveConnections = getActiveConnections;
exports.closeAllConnections = closeAllConnections;
const ws_1 = require("ws");
const supabase_1 = require("../config/supabase");
const openai_1 = require("./openai");
const clients = new Map();
function setupWebSocketServer(server) {
    const wss = new ws_1.WebSocketServer({
        server,
        path: "/ws"
    });
    console.log("[WebSocket] Server initialized");
    wss.on("connection", (ws, req) => {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        const pathParts = url.pathname.split("/");
        const runId = pathParts[pathParts.length - 2]; // /ws/runs/:runId/stream
        const action = pathParts[pathParts.length - 1]; // stream
        if (action !== "stream" || !runId) {
            ws.close(1008, "Invalid WebSocket path");
            return;
        }
        console.log(`[WebSocket] New connection for run: ${runId}`);
        // Store client
        const clientId = `${runId}-${Date.now()}`;
        const client = {
            ws,
            runId,
            userId: "", // Will be set after auth
            isActive: true
        };
        clients.set(clientId, client);
        // Handle messages from client
        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.type === "auth") {
                    // Authenticate and verify run access
                    await handleAuth(clientId, data.token, runId);
                }
                else if (data.type === "stop") {
                    // Stop the run
                    await handleStop(clientId, runId);
                }
            }
            catch (error) {
                console.error("[WebSocket] Error handling message:", error);
                ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
            }
        });
        ws.on("close", () => {
            console.log(`[WebSocket] Connection closed for run: ${runId}`);
            const client = clients.get(clientId);
            if (client) {
                client.isActive = false;
                clients.delete(clientId);
            }
        });
        ws.on("error", (error) => {
            console.error(`[WebSocket] Error for run ${runId}:`, error);
        });
        // Send welcome message
        ws.send(JSON.stringify({
            type: "connected",
            message: "WebSocket connection established",
            runId
        }));
    });
    return wss;
}
async function handleAuth(clientId, token, runId) {
    const client = clients.get(clientId);
    if (!client)
        return;
    try {
        // Verify JWT token
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            client.ws.send(JSON.stringify({ type: "error", message: "Authentication failed" }));
            client.ws.close(1008, "Unauthorized");
            clients.delete(clientId);
            return;
        }
        // Verify run belongs to user
        const { data: run, error: runError } = await supabase_1.supabase
            .from("runs")
            .select("id, user_id")
            .eq("id", runId)
            .eq("user_id", user.id)
            .single();
        if (runError || !run) {
            client.ws.send(JSON.stringify({ type: "error", message: "Run not found or access denied" }));
            client.ws.close(1008, "Forbidden");
            clients.delete(clientId);
            return;
        }
        client.userId = user.id;
        client.ws.send(JSON.stringify({ type: "authenticated", userId: user.id }));
        console.log(`[WebSocket] Client ${clientId} authenticated for run ${runId}`);
    }
    catch (error) {
        console.error("[WebSocket] Auth error:", error);
        client.ws.send(JSON.stringify({ type: "error", message: "Authentication error" }));
        client.ws.close(1011, "Authentication error");
        clients.delete(clientId);
    }
}
async function handleStop(clientId, runId) {
    const client = clients.get(clientId);
    if (!client)
        return;
    try {
        // Update run status to stopped
        await supabase_1.supabase
            .from("runs")
            .update({ status: "stopped" })
            .eq("id", runId)
            .eq("user_id", client.userId);
        client.isActive = false;
        client.ws.send(JSON.stringify({ type: "stopped", message: "Run stopped by user" }));
    }
    catch (error) {
        console.error("[WebSocket] Stop error:", error);
        client.ws.send(JSON.stringify({ type: "error", message: "Failed to stop run" }));
    }
}
async function streamRunToClient(runId, input, model, userId) {
    // Find all connected clients for this run
    const runClients = Array.from(clients.values()).filter(c => c.runId === runId && c.userId === userId && c.isActive);
    if (runClients.length === 0) {
        console.log(`[WebSocket] No active clients for run ${runId}, executing without streaming`);
        return null;
    }
    // Send start event
    runClients.forEach(client => {
        client.ws.send(JSON.stringify({
            type: "start",
            runId,
            model,
            timestamp: new Date().toISOString()
        }));
    });
    let fullOutput = "";
    let chunkCount = 0;
    try {
        // Stream AI response
        for await (const chunk of (0, openai_1.generateCompletionStream)(input, model)) {
            fullOutput += chunk;
            chunkCount++;
            // Send chunk to all connected clients
            runClients.forEach(client => {
                if (client.isActive && client.ws.readyState === ws_1.WebSocket.OPEN) {
                    client.ws.send(JSON.stringify({
                        type: "chunk",
                        content: chunk,
                        chunkNumber: chunkCount,
                        timestamp: new Date().toISOString()
                    }));
                }
            });
            // Check if run was stopped
            const { data: run } = await supabase_1.supabase
                .from("runs")
                .select("status")
                .eq("id", runId)
                .single();
            if (run?.status === "stopped") {
                runClients.forEach(client => {
                    if (client.isActive) {
                        client.ws.send(JSON.stringify({ type: "stopped", message: "Run stopped" }));
                    }
                });
                return fullOutput;
            }
        }
        // Send completion event
        runClients.forEach(client => {
            if (client.isActive && client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(JSON.stringify({
                    type: "complete",
                    fullOutput,
                    totalChunks: chunkCount,
                    timestamp: new Date().toISOString()
                }));
            }
        });
        return fullOutput;
    }
    catch (error) {
        console.error("[WebSocket] Streaming error:", error);
        // Send error to clients
        runClients.forEach(client => {
            if (client.isActive && client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(JSON.stringify({
                    type: "error",
                    message: error.message || "Streaming failed",
                    timestamp: new Date().toISOString()
                }));
            }
        });
        throw error;
    }
}
function getActiveConnections() {
    return clients.size;
}
function closeAllConnections() {
    clients.forEach((client, clientId) => {
        if (client.ws.readyState === ws_1.WebSocket.OPEN) {
            client.ws.close(1000, "Server shutting down");
        }
        clients.delete(clientId);
    });
}
