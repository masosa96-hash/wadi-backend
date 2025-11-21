"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserMemory = getUserMemory;
exports.saveMemory = saveMemory;
exports.deleteMemory = deleteMemory;
exports.getMemoryContext = getMemoryContext;
const supabase_1 = require("../config/supabase");
/**
 * GET /api/memory
 * Get all active memory for the authenticated user
 */
async function getUserMemory(req, res) {
    try {
        const userId = req.user_id;
        console.log("[getUserMemory] Request from user:", userId);
        if (!userId) {
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        const { data, error } = await supabase_1.supabase
            .rpc("get_user_memory_for_chat", { p_user_id: userId });
        if (error) {
            console.error("[getUserMemory] Error:", error);
            res.status(500).json({ ok: false, error: "Failed to fetch memory" });
            return;
        }
        console.log(`[getUserMemory] Success: Found ${data?.length || 0} memories`);
        res.json({ ok: true, data: data || [] });
    }
    catch (error) {
        console.error("[getUserMemory] Exception:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
}
/**
 * POST /api/memory
 * Save or update a memory entry
 */
async function saveMemory(req, res) {
    try {
        const userId = req.user_id;
        const { key, value, type, category, source, confidence, metadata } = req.body;
        console.log("[saveMemory] Request from user:", userId, { key, type });
        if (!userId) {
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        // Validation
        if (!key || !value || !type) {
            res.status(400).json({ ok: false, error: "key, value, and type are required" });
            return;
        }
        const { data, error } = await supabase_1.supabase.rpc("upsert_user_memory", {
            p_user_id: userId,
            p_key: key,
            p_value: value,
            p_type: type,
            p_category: category || null,
            p_source: source || "explicit",
            p_confidence: confidence || 1.0,
            p_metadata: metadata || {},
        });
        if (error) {
            console.error("[saveMemory] Error:", error);
            res.status(500).json({ ok: false, error: "Failed to save memory" });
            return;
        }
        console.log("[saveMemory] Success:", key);
        res.status(201).json({ ok: true, data });
    }
    catch (error) {
        console.error("[saveMemory] Exception:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
}
/**
 * DELETE /api/memory/:memoryId
 * Delete a specific memory entry
 */
async function deleteMemory(req, res) {
    try {
        const userId = req.user_id;
        const { memoryId } = req.params;
        console.log("[deleteMemory] Request from user:", userId, "Memory:", memoryId);
        if (!userId) {
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        const { error } = await supabase_1.supabase
            .from("user_memory")
            .delete()
            .eq("id", memoryId)
            .eq("user_id", userId);
        if (error) {
            console.error("[deleteMemory] Error:", error);
            res.status(500).json({ ok: false, error: "Failed to delete memory" });
            return;
        }
        console.log("[deleteMemory] Success");
        res.json({ ok: true, message: "Memory deleted successfully" });
    }
    catch (error) {
        console.error("[deleteMemory] Exception:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
}
/**
 * GET /api/memory/context
 * Get formatted memory context for chat
 */
async function getMemoryContext(req, res) {
    try {
        const userId = req.user_id;
        if (!userId) {
            res.status(401).json({ ok: false, error: "Unauthorized" });
            return;
        }
        const { data, error } = await supabase_1.supabase
            .rpc("get_user_memory_for_chat", { p_user_id: userId });
        if (error) {
            console.error("[getMemoryContext] Error:", error);
            res.status(500).json({ ok: false, error: "Failed to fetch memory context" });
            return;
        }
        // Format memory into contextual strings
        const memoryByCategory = {};
        (data || []).forEach((mem) => {
            const cat = mem.category || mem.memory_type;
            if (!memoryByCategory[cat]) {
                memoryByCategory[cat] = [];
            }
            memoryByCategory[cat].push(mem);
        });
        const contextStrings = [];
        // Preferences
        if (memoryByCategory.communication || memoryByCategory.preference) {
            const prefs = [...(memoryByCategory.communication || []), ...(memoryByCategory.preference || [])];
            contextStrings.push("Preferencias del usuario:", ...prefs.map((m) => `- ${m.key}: ${m.value}`));
        }
        // Facts and context
        if (memoryByCategory.fact || memoryByCategory.context) {
            const facts = [...(memoryByCategory.fact || []), ...(memoryByCategory.context || [])];
            contextStrings.push("\nContexto importante:", ...facts.map((m) => `- ${m.value}`));
        }
        const formattedContext = contextStrings.join("\n");
        res.json({
            ok: true,
            data: {
                raw: data || [],
                formatted: formattedContext,
                by_category: memoryByCategory,
            }
        });
    }
    catch (error) {
        console.error("[getMemoryContext] Exception:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
}
