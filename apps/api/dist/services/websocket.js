"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocketServer = setupWebSocketServer;
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
        // Support both /ws/runs/:runId/stream and /ws/chat/:conversationId
        const resourceType = pathParts[pathParts.length - 3]; // runs or chat
        const resourceId = pathParts[pathParts.length - 2]; // runId or conversationId
        console.log(`[WebSocket] New connection: ${resourceType}/${resourceId}`);
        const clientId = `${resourceType}-${resourceId}-${Date.now()}`;
        const client = {
            ws,
            id: clientId,
            userId: "", // Will be set after auth
            isActive: true,
            ...(resourceType === "runs" ? { runId: resourceId } : { conversationId: resourceId })
        };
        clients.set(clientId, client);
        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.type === "auth") {
                    await handleAuth(clientId, data.token);
                }
                else if (data.type === "message") {
                    await handleChatMessage(clientId, data.content);
                }
                else if (data.type === "stop") {
                    if (client.runId)
                        await handleStopRun(clientId);
                }
            }
            catch (error) {
                console.error("[WebSocket] Error handling message:", error);
                ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
            }
        });
        ws.on("close", () => {
            const client = clients.get(clientId);
            if (client) {
                client.isActive = false;
                clients.delete(clientId);
            }
        });
        ws.send(JSON.stringify({
            type: "connected",
            message: "WebSocket connection established",
            clientId
        }));
    });
    return wss;
}
async function handleAuth(clientId, token) {
    const client = clients.get(clientId);
    if (!client)
        return;
    try {
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            client.ws.close(1008, "Unauthorized");
            clients.delete(clientId);
            return;
        }
        client.userId = user.id;
        client.ws.send(JSON.stringify({ type: "authenticated", userId: user.id }));
        console.log(`[WebSocket] Client ${clientId} authenticated`);
    }
    catch (error) {
        console.error("[WebSocket] Auth error:", error);
        client.ws.close(1011, "Authentication error");
        clients.delete(clientId);
    }
}
async function handleChatMessage(clientId, content) {
    const client = clients.get(clientId);
    if (!client || !client.conversationId || !client.userId)
        return;
    try {
        // 1. Save user message
        const { error: userMsgError } = await supabase_1.supabase
            .from("messages")
            .insert({
            conversation_id: client.conversationId,
            role: "user",
            content: content.trim(),
        })
            .select()
            .single();
        if (userMsgError)
            throw userMsgError;
        // 2. Get history
        const { data: history } = await supabase_1.supabase
            .from("messages")
            .select("role, content")
            .eq("conversation_id", client.conversationId)
            .order("created_at", { ascending: true })
            .limit(10);
        const messages = [
            {
                role: "system",
                content: "Sos WADI, un asistente de IA amigable y útil. Hablás en español de forma cercana y natural.",
            },
            ...(history || []).map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        ];
        // 3. Stream AI response
        let fullOutput = "";
        client.ws.send(JSON.stringify({ type: "start", conversationId: client.conversationId }));
        for await (const chunk of (0, openai_1.generateCompletionStream)(messages, "gpt-3.5-turbo")) {
            if (!client.isActive)
                break;
            fullOutput += chunk;
            client.ws.send(JSON.stringify({ type: "chunk", content: chunk }));
        }
        // 4. Save assistant message
        await supabase_1.supabase
            .from("messages")
            .insert({
            conversation_id: client.conversationId,
            role: "assistant",
            content: fullOutput,
            model: "gpt-3.5-turbo",
        });
        client.ws.send(JSON.stringify({ type: "complete", fullOutput }));
    }
    catch (error) {
        console.error("[WebSocket] Chat error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        client.ws.send(JSON.stringify({ type: "error", message: errorMessage }));
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleStopRun(clientId) {
    // Existing stop logic...
    const client = clients.get(clientId);
    if (!client)
        return;
    // ... implementation details
}
// Export existing helpers
function getActiveConnections() {
    return clients.size;
}
function closeAllConnections() {
    clients.forEach((client) => client.ws.close());
    clients.clear();
}
