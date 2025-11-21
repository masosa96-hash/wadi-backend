"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.getConversation = getConversation;
exports.getConversations = getConversations;
exports.deleteConversation = deleteConversation;
const supabase_1 = require("../config/supabase");
const openai_1 = require("../services/openai");
/**
 * POST /api/chat
 * Send a message and get AI response
 *
 * Request body:
 * - message: string (required) - User's message
 * - conversationId?: string (optional) - Existing conversation ID
 *
 * Response:
 * - conversationId: string
 * - userMessage: object
 * - assistantMessage: object
 */
async function sendMessage(req, res) {
    try {
        const userId = req.user_id;
        const { message, conversationId } = req.body;
        console.log("[sendMessage] Request from user:", userId, { message: message?.substring(0, 50), conversationId });
        if (!userId) {
            console.error("[sendMessage] Unauthorized: No user_id");
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        if (!message || typeof message !== "string" || message.trim().length === 0) {
            console.error("[sendMessage] Invalid message");
            res.status(400).json({ ok: false, error: "Message is required" });
            return;
        }
        let currentConversationId = conversationId;
        // If no conversation ID provided, get or create default conversation
        if (!currentConversationId) {
            const { data: conversationData, error: conversationError } = await supabase_1.supabase
                .rpc("get_or_create_default_conversation", { p_user_id: userId });
            if (conversationError) {
                console.error("[sendMessage] Error getting/creating conversation:", conversationError);
                res.status(500).json({ ok: false, error: "Failed to create conversation" });
                return;
            }
            currentConversationId = conversationData;
            console.log("[sendMessage] Created/retrieved conversation:", currentConversationId);
        }
        else {
            // Verify conversation belongs to user
            const { data: conversation, error: verifyError } = await supabase_1.supabase
                .from("conversations")
                .select("id")
                .eq("id", currentConversationId)
                .eq("user_id", userId)
                .single();
            if (verifyError || !conversation) {
                console.error("[sendMessage] Conversation not found or unauthorized");
                res.status(404).json({ ok: false, error: "Conversation not found" });
                return;
            }
        }
        // Save user message
        const { data: userMessage, error: userMessageError } = await supabase_1.supabase
            .from("messages")
            .insert({
            conversation_id: currentConversationId,
            role: "user",
            content: message.trim(),
        })
            .select()
            .single();
        if (userMessageError || !userMessage) {
            console.error("[sendMessage] Error saving user message:", userMessageError);
            res.status(500).json({ ok: false, error: "Failed to save message" });
            return;
        }
        console.log("[sendMessage] User message saved:", userMessage.id);
        // Get conversation history (last 10 messages for context)
        const { data: history, error: historyError } = await supabase_1.supabase
            .from("messages")
            .select("role, content")
            .eq("conversation_id", currentConversationId)
            .order("created_at", { ascending: true })
            .limit(10);
        if (historyError) {
            console.error("[sendMessage] Error fetching history:", historyError);
            // Continue without history
        }
        // Prepare messages for OpenAI
        const messages = [
            {
                role: "system",
                content: "Sos WADI, un asistente de IA amigable y útil. Hablás en español de forma cercana y natural, como si fueras un amigo que ayuda con cualquier tarea. Respondés de manera clara, concisa y práctica.",
            },
            ...(history || []).map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        ];
        console.log("[sendMessage] Calling OpenAI with", messages.length, "messages");
        // Generate AI response
        let aiResponse;
        let aiError = null;
        try {
            aiResponse = await (0, openai_1.generateChatCompletion)(messages, process.env.OPENAI_DEFAULT_MODEL || "gpt-3.5-turbo");
            console.log("[sendMessage] AI response generated:", aiResponse.substring(0, 50));
        }
        catch (error) {
            console.error("[sendMessage] OpenAI error:", error);
            aiResponse = "Lo siento, tuve un problema al generar la respuesta. ¿Podés intentar de nuevo?";
            aiError = error.message || "OpenAI API error";
        }
        // Save assistant message
        const { data: assistantMessage, error: assistantMessageError } = await supabase_1.supabase
            .from("messages")
            .insert({
            conversation_id: currentConversationId,
            role: "assistant",
            content: aiResponse,
            model: process.env.OPENAI_DEFAULT_MODEL || "gpt-3.5-turbo",
            error: aiError,
        })
            .select()
            .single();
        if (assistantMessageError || !assistantMessage) {
            console.error("[sendMessage] Error saving assistant message:", assistantMessageError);
            res.status(500).json({ ok: false, error: "Failed to save AI response" });
            return;
        }
        console.log("[sendMessage] Success - conversation:", currentConversationId);
        res.json({
            ok: true,
            data: {
                conversationId: currentConversationId,
                userMessage,
                assistantMessage,
            },
        });
    }
    catch (error) {
        console.error("[sendMessage] Exception:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
}
/**
 * GET /api/chat/:conversationId
 * Get all messages in a conversation
 */
async function getConversation(req, res) {
    try {
        const userId = req.user_id;
        const { conversationId } = req.params;
        console.log("[getConversation] Request from user:", userId, "Conversation:", conversationId);
        if (!userId) {
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        // Verify conversation belongs to user
        const { data: conversation, error: conversationError } = await supabase_1.supabase
            .from("conversations")
            .select("*")
            .eq("id", conversationId)
            .eq("user_id", userId)
            .single();
        if (conversationError || !conversation) {
            console.error("[getConversation] Conversation not found");
            res.status(404).json({ ok: false, error: "Conversation not found" });
            return;
        }
        // Get all messages
        const { data: messages, error: messagesError } = await supabase_1.supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });
        if (messagesError) {
            console.error("[getConversation] Error fetching messages:", messagesError);
            res.status(500).json({ ok: false, error: "Failed to fetch messages" });
            return;
        }
        console.log("[getConversation] Success - found", messages?.length || 0, "messages");
        res.json({
            ok: true,
            data: {
                conversation,
                messages: messages || [],
            },
        });
    }
    catch (error) {
        console.error("[getConversation] Exception:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
}
/**
 * GET /api/chat
 * Get all conversations for the user
 */
async function getConversations(req, res) {
    try {
        const userId = req.user_id;
        console.log("[getConversations] Request from user:", userId);
        if (!userId) {
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        const { data: conversations, error } = await supabase_1.supabase
            .from("conversations")
            .select("*")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false });
        if (error) {
            console.error("[getConversations] Supabase error:", error);
            res.status(500).json({ ok: false, error: "Failed to fetch conversations" });
            return;
        }
        console.log("[getConversations] Success - found", conversations?.length || 0, "conversations");
        res.json({
            ok: true,
            data: conversations || [],
        });
    }
    catch (error) {
        console.error("[getConversations] Exception:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
}
/**
 * DELETE /api/chat/:conversationId
 * Delete a conversation and all its messages
 */
async function deleteConversation(req, res) {
    try {
        const userId = req.user_id;
        const { conversationId } = req.params;
        console.log("[deleteConversation] Request from user:", userId, "Conversation:", conversationId);
        if (!userId) {
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        // Verify conversation belongs to user
        const { error: verifyError } = await supabase_1.supabase
            .from("conversations")
            .select("id")
            .eq("id", conversationId)
            .eq("user_id", userId)
            .single();
        if (verifyError) {
            console.error("[deleteConversation] Conversation not found");
            res.status(404).json({ ok: false, error: "Conversation not found" });
            return;
        }
        // Delete conversation (cascade will delete messages)
        const { error } = await supabase_1.supabase
            .from("conversations")
            .delete()
            .eq("id", conversationId);
        if (error) {
            console.error("[deleteConversation] Error deleting:", error);
            res.status(500).json({ ok: false, error: "Failed to delete conversation" });
            return;
        }
        console.log("[deleteConversation] Success");
        res.json({ ok: true });
    }
    catch (error) {
        console.error("[deleteConversation] Exception:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
}
