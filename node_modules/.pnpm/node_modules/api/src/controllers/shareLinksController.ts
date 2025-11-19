import type { Request, Response } from "express";
import { supabase } from "../config/supabase";
import bcrypt from "bcrypt";

/**
 * Create a new share link
 * POST /api/shares
 */
export async function createShareLink(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { run_id, session_id, expires_in_days, password, max_views } = req.body;

    // Validate that exactly one of run_id or session_id is provided
    if ((run_id && session_id) || (!run_id && !session_id)) {
      res.status(400).json({ error: "Provide either run_id or session_id, not both" });
      return;
    }

    // Verify ownership
    if (run_id) {
      const { data: run } = await supabase
        .from("runs")
        .select("id")
        .eq("id", run_id)
        .eq("user_id", userId)
        .single();

      if (!run) {
        res.status(404).json({ error: "Run not found or unauthorized" });
        return;
      }
    }

    if (session_id) {
      const { data: session } = await supabase
        .from("sessions")
        .select("id")
        .eq("id", session_id)
        .eq("user_id", userId)
        .single();

      if (!session) {
        res.status(404).json({ error: "Session not found or unauthorized" });
        return;
      }
    }

    // Generate token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc("generate_share_token");

    if (tokenError || !tokenData) {
      res.status(500).json({ error: "Failed to generate share token" });
      return;
    }

    const token = tokenData as string;

    // Calculate expiration
    let expires_at = null;
    if (expires_in_days && expires_in_days > 0) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expires_in_days);
      expires_at = expirationDate.toISOString();
    }

    // Hash password if provided
    let password_hash = null;
    if (password && password.trim()) {
      password_hash = await bcrypt.hash(password.trim(), 10);
    }

    // Create share link
    const { data, error } = await supabase
      .from("share_links")
      .insert({
        user_id: userId,
        run_id: run_id || null,
        session_id: session_id || null,
        token,
        expires_at,
        password_hash,
        max_views: max_views || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating share link:", error);
      res.status(500).json({ error: "Failed to create share link" });
      return;
    }

    // Return share link without password_hash
    const { password_hash: _, ...shareLink } = data;
    res.status(201).json(shareLink);
  } catch (error) {
    console.error("Error in createShareLink:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get all share links for the authenticated user
 * GET /api/shares
 */
export async function getUserShareLinks(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase
      .from("share_links")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching share links:", error);
      res.status(500).json({ error: "Failed to fetch share links" });
      return;
    }

    // Remove password_hash from response
    const shareLinks = data.map(({ password_hash, ...link }) => ({
      ...link,
      has_password: !!password_hash,
    }));

    res.json(shareLinks);
  } catch (error) {
    console.error("Error in getUserShareLinks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get shared content by token (public endpoint)
 * GET /api/shares/:token
 */
export async function getSharedContent(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    // Fetch share link (bypassing RLS for public access)
    const { data: shareLink, error: shareLinkError } = await supabase
      .from("share_links")
      .select("*")
      .eq("token", token)
      .single();

    if (shareLinkError || !shareLink) {
      res.status(404).json({ error: "Share link not found" });
      return;
    }

    // Check expiration
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      res.status(410).json({ error: "Share link has expired" });
      return;
    }

    // Check max views
    if (shareLink.max_views && shareLink.view_count >= shareLink.max_views) {
      res.status(410).json({ error: "Share link has reached maximum views" });
      return;
    }

    // Check password
    if (shareLink.password_hash) {
      if (!password) {
        res.status(401).json({ error: "Password required", requires_password: true });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, shareLink.password_hash);
      if (!passwordMatch) {
        res.status(401).json({ error: "Incorrect password" });
        return;
      }
    }

    // Increment view count and update last accessed
    await supabase
      .from("share_links")
      .update({
        view_count: shareLink.view_count + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq("id", shareLink.id);

    // Fetch content based on what's being shared
    let content;

    if (shareLink.run_id) {
      // Fetch single run
      const { data: run, error: runError } = await supabase
        .from("runs")
        .select("*")
        .eq("id", shareLink.run_id)
        .single();

      if (runError || !run) {
        res.status(404).json({ error: "Shared run not found" });
        return;
      }

      content = {
        type: "run",
        data: run,
      };
    } else if (shareLink.session_id) {
      // Fetch session with all runs
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", shareLink.session_id)
        .single();

      if (sessionError || !session) {
        res.status(404).json({ error: "Shared session not found" });
        return;
      }

      const { data: runs, error: runsError } = await supabase
        .from("runs")
        .select("*")
        .eq("session_id", shareLink.session_id)
        .order("created_at", { ascending: true });

      if (runsError) {
        console.error("Error fetching session runs:", runsError);
        res.status(500).json({ error: "Failed to fetch session runs" });
        return;
      }

      content = {
        type: "session",
        data: {
          session,
          runs: runs || [],
        },
      };
    }

    res.json({
      share_link: {
        token: shareLink.token,
        created_at: shareLink.created_at,
        view_count: shareLink.view_count + 1,
        expires_at: shareLink.expires_at,
      },
      content,
    });
  } catch (error) {
    console.error("Error in getSharedContent:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Delete a share link
 * DELETE /api/shares/:id
 */
export async function deleteShareLink(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    const { error } = await supabase
      .from("share_links")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting share link:", error);
      res.status(500).json({ error: "Failed to delete share link" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteShareLink:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
