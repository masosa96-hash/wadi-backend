import type { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * GET /api/search
 * Global search across messages, conversations, and workspaces
 * 
 * Query parameters:
 * - q: string (required) - Search query
 * - workspace_id?: string (optional) - Filter by workspace
 * - date_filter?: 'week' | 'month' | 'quarter' (optional) - Date range filter
 * - limit?: number (optional) - Max results (default: 50)
 * 
 * Response:
 * - results: array of search results with snippets and context
 */
export async function globalSearch(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { q, workspace_id, date_filter, limit = 50 } = req.query;

    console.log("[globalSearch] Request from user:", userId, { q, workspace_id, date_filter, limit });

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      res.status(400).json({ ok: false, error: "Search query is required" });
      return;
    }

    // Sanitize and prepare search query for PostgreSQL full-text search
    const searchQuery = q
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .join(" | "); // OR operator for PostgreSQL

    console.log("[globalSearch] Prepared query:", searchQuery);

    // First, refresh the search index
    // In production, this should be done via a background job
    const { error: refreshError } = await supabase.rpc("refresh_search_index");
    
    if (refreshError) {
      console.warn("[globalSearch] Could not refresh search index:", refreshError.message);
      // Continue with search anyway
    }

    // Execute search using the database function
    const { data: results, error: searchError } = await supabase.rpc("global_search", {
      p_user_id: userId,
      p_query: searchQuery,
      p_workspace_id: workspace_id || null,
      p_date_filter: date_filter || null,
      p_limit: Math.min(Number(limit) || 50, 100), // Cap at 100
    });

    if (searchError) {
      console.error("[globalSearch] Search error:", searchError);
      res.status(500).json({ ok: false, error: "Search failed" });
      return;
    }

    console.log("[globalSearch] Success - found", results?.length || 0, "results");

    res.json({
      ok: true,
      data: {
        query: q,
        results: results || [],
        count: results?.length || 0,
        filters: {
          workspace_id: workspace_id || null,
          date_filter: date_filter || null,
        },
      },
    });
  } catch (error) {
    console.error("[globalSearch] Exception:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

/**
 * GET /api/search/suggestions
 * Get search suggestions based on recent searches and popular terms
 * 
 * Response:
 * - suggestions: array of suggested search terms
 */
export async function getSearchSuggestions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    // Get recent conversation titles and workspace names as suggestions
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("title")
      .eq("user_id", userId)
      .not("title", "is", null)
      .order("updated_at", { ascending: false })
      .limit(5);

    const { data: workspaces, error: workspaceError } = await supabase
      .from("workspaces")
      .select("name")
      .eq("owner_id", userId)
      .order("last_message_at", { ascending: false })
      .limit(5);

    if (convError || workspaceError) {
      console.error("[getSearchSuggestions] Error:", convError || workspaceError);
    }

    const suggestions = [
      ...(conversations || []).map(c => c.title).filter(Boolean),
      ...(workspaces || []).map(w => w.name).filter(Boolean),
    ];

    res.json({
      ok: true,
      data: {
        suggestions: [...new Set(suggestions)].slice(0, 8),
      },
    });
  } catch (error) {
    console.error("[getSearchSuggestions] Exception:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

/**
 * GET /api/search/context/:messageId
 * Get context around a specific message for navigation
 * 
 * Response:
 * - messages: array of messages around the target
 * - conversation: conversation details
 */
export async function getMessageContext(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const { messageId } = req.params;
    const { contextSize = 5 } = req.query;

    console.log("[getMessageContext] Request from user:", userId, "Message:", messageId);

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    // First verify the message belongs to user's conversation
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("id, conversation_id")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      console.error("[getMessageContext] Message not found");
      res.status(404).json({ ok: false, error: "Message not found" });
      return;
    }

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", message.conversation_id)
      .eq("user_id", userId)
      .single();

    if (convError || !conversation) {
      console.error("[getMessageContext] Conversation not found or unauthorized");
      res.status(404).json({ ok: false, error: "Conversation not found" });
      return;
    }

    // Get message context using database function
    const { data: contextMessages, error: contextError } = await supabase.rpc(
      "get_message_context",
      {
        p_message_id: messageId,
        p_context_size: Number(contextSize) || 5,
      }
    );

    if (contextError) {
      console.error("[getMessageContext] Error getting context:", contextError);
      res.status(500).json({ ok: false, error: "Failed to get context" });
      return;
    }

    console.log("[getMessageContext] Success - found", contextMessages?.length || 0, "messages");

    res.json({
      ok: true,
      data: {
        conversation,
        messages: contextMessages || [],
        targetMessageId: messageId,
      },
    });
  } catch (error) {
    console.error("[getMessageContext] Exception:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

/**
 * GET /api/search/recent
 * Get recent searches for the user (from local storage on frontend)
 * This is a placeholder - actual implementation would store in DB
 * 
 * Response:
 * - recent: array of recent search terms
 */
export async function getRecentSearches(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    // For now, return empty array
    // In production, this would query a recent_searches table
    res.json({
      ok: true,
      data: {
        recent: [],
      },
    });
  } catch (error) {
    console.error("[getRecentSearches] Exception:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
