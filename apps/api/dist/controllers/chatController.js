"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.getChatSummary = getChatSummary;
exports.getConversation = getConversation;
exports.getConversations = getConversations;
exports.deleteConversation = deleteConversation;
const supabase_1 = require("../config/supabase");
const openai_1 = require("../services/openai");
const kivo_1 = require("../services/brain/kivo");
const wadi_1 = require("../services/brain/wadi");
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
        const guestId = req.guest_id;
        const { message, conversationId, messages: historyMessages } = req.body; // historyMessages from client for guest
        console.log("[sendMessage] Request from:", userId ? `User ${userId}` : `Guest ${guestId}`, { message: message?.substring(0, 50), conversationId });
        // If neither user nor guest ID is present, reject the request.
        if (!userId && !guestId) {
            console.error("[sendMessage] Unauthorized: No user_id or guest_id");
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        if (!message || typeof message !== "string" || message.trim().length === 0) {
            console.error("[sendMessage] Invalid message");
            res.status(400).json({ ok: false, error: "Message is required" });
            return;
        }
        let currentConversationId = conversationId;
        let history = [];
        let userMessage = null;
        if (userId) {
            // --- AUTHENTICATED USER FLOW (SUPABASE) ---
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
            const { data: savedUserMsg, error: userMessageError } = await supabase_1.supabase
                .from("messages")
                .insert({
                conversation_id: currentConversationId,
                role: "user",
                content: message.trim(),
            })
                .select()
                .single();
            if (userMessageError || !savedUserMsg) {
                console.error("[sendMessage] Error saving user message:", userMessageError);
                res.status(500).json({ ok: false, error: "Failed to save message" });
                return;
            }
            userMessage = savedUserMsg;
            console.log("[sendMessage] User message saved:", userMessage.id);
            // Get conversation history (last 10 messages for context)
            const { data: dbHistory, error: historyError } = await supabase_1.supabase
                .from("messages")
                .select("role, content")
                .eq("conversation_id", currentConversationId)
                .order("created_at", { ascending: true })
                .limit(10);
            if (historyError) {
                console.error("[sendMessage] Error fetching history:", historyError);
            }
            else {
                history = dbHistory;
            }
        }
        else {
            // --- GUEST FLOW (NO DB) ---
            console.log("[sendMessage] Guest mode: Using client-provided history");
            history = historyMessages || [];
            // We don't save to DB in guest mode
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
            // If guest, the current message is NOT in history yet (unlike DB flow where we just inserted it)
            // Wait, in DB flow we fetch history including the new message? 
            // No, usually we fetch previous messages.
            // Let's check the original code:
            // It inserted the message, THEN fetched history. So history INCLUDED the new message.
            // For guest, 'historyMessages' from client should be previous messages.
            // We need to add the current message to the prompt.
        ];
        // If using DB flow, history likely included the new message because we inserted it before fetching.
        // Let's verify:
        // Original: insert message -> fetch messages limit 10 order by created_at. 
        // Yes, it includes the new message.
        // So for guest, we append the current message manually.
        if (!userId) {
            messages.push({
                role: "user",
                content: message
            });
        }
        console.log("[sendMessage] Calling OpenAI with", messages.length, "messages");
        // Generate AI response
        let aiResponse;
        // 1. Brain Analysis (Kivo)
        const thought = await (0, kivo_1.pensar)(message);
        console.log("[sendMessage] Kivo thought:", thought);
        let assistantResponseText = "";
        // 2. Execution (Wadi)
        if (thought.intent === "chat") {
            // Standard chat flow
            // We already prepared 'messages' above, but 'generateChatCompletion' takes the full array
            // The original code re-constructed the array inside the 'if'. Let's reuse 'messages'.
            assistantResponseText = await (0, openai_1.generateChatCompletion)(messages);
        }
        else {
            // Tool execution flow
            const action = await (0, wadi_1.ejecutar)(thought);
            console.log("[sendMessage] Wadi action:", action);
            if (action.type === "tool_call") {
                // Mock tool execution for now
                assistantResponseText = `[Simulación] He ejecutado la acción: ${action.payload.tool}. (La lógica real se implementará en la Fase 3)`;
            }
            else {
                assistantResponseText = action.payload.text || "No pude procesar tu solicitud.";
            }
        }
        // 3. Save assistant message (ONLY FOR AUTH USERS)
        let assistantMessage = null;
        if (userId) {
            const { data: savedMsg, error: assistantError } = await supabase_1.supabase
                .from("messages")
                .insert({
                conversation_id: currentConversationId,
                role: "assistant",
                content: assistantResponseText,
                model: "gpt-3.5-turbo",
            })
                .select()
                .single();
            if (assistantError) {
                console.error("[sendMessage] Error saving assistant message:", assistantError);
                // Don't fail the request, just log it
            }
            else {
                assistantMessage = savedMsg;
            }
        }
        res.json({
            ok: true,
            data: {
                conversationId: currentConversationId,
                // For guest, we mock the message objects
                userMessage: userId ? null : { role: 'user', content: message, created_at: new Date().toISOString() },
                assistantMessage: userId ? assistantMessage : { role: 'assistant', content: assistantResponseText, created_at: new Date().toISOString() },
                reply: assistantResponseText, // Explicitly return reply for guest convenience
                thought,
            },
        });
    }
    catch (error) {
        console.error("[sendMessage] Exception:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
}
/**
 * GET /api/chat/summary
 * Get a summary of user's chat activity (total conversations, recent conversations)
 */
async function getChatSummary(req, res) {
    try {
        const userId = req.user_id;
        if (!userId) {
            console.error("[getChatSummary] Unauthorized: No user_id");
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        // Get total conversations
        const { count: totalConversations, error: countError } = await supabase_1.supabase
            .from("conversations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
        if (countError) {
            console.error("[getChatSummary] Error counting conversations:", countError);
            throw countError;
        }
        // Get recent conversations
        const { data: recentConversations, error: recentError } = await supabase_1.supabase
            .from("conversations")
            .select("*")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })
            .limit(3);
        if (recentError) {
            console.error("[getChatSummary] Error fetching recent conversations:", recentError);
            throw recentError;
        }
        // total_messages is not directly available from messages table by user_id.
        // For now, we'll set it to 0 or implement a more complex query if needed.
        const totalMessages = 0;
        const summary = {
            total_conversations: totalConversations || 0,
            total_messages: totalMessages, // Set to 0 as direct count by user_id is not feasible with current schema
            recent_conversations: recentConversations || [],
        };
        console.log("[getChatSummary] Success - summary for user:", userId);
        res.json({ ok: true, data: summary });
    }
    catch (error) {
        console.error("[getChatSummary] Exception:", error);
        res.status(500).json({ ok: false, error: "Failed to get chat summary" });
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
