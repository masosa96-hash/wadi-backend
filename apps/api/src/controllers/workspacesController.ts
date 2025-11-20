import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * GET /api/workspaces
 * Returns all workspaces where the authenticated user is a member
 */
export async function getWorkspaces(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    console.log("[getWorkspaces] Request from user:", userId);

    if (!userId) {
      console.error("[getWorkspaces] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    // Get workspaces where user is a member
    const { data: memberData, error: memberError } = await supabase
      .from("workspace_members")
      .select(`
        role,
        workspace:workspaces(
          id,
          name,
          description,
          owner_id,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", userId);

    if (memberError) {
      console.error("[getWorkspaces] Supabase error:", memberError);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to fetch workspaces" } });
      return;
    }

    // Transform data to include role at workspace level
    const workspaces = memberData?.map(item => ({
      ...item.workspace,
      user_role: item.role
    })) || [];

    console.log(`[getWorkspaces] Success: Found ${workspaces.length} workspaces`);
    res.json({ ok: true, data: workspaces });
  } catch (error) {
    console.error("[getWorkspaces] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * POST /api/workspaces
 * Creates a new workspace for the authenticated user
 */
export async function createWorkspace(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    console.log("[createWorkspace] Request from user:", userId, "Body:", req.body);

    if (!userId) {
      console.error("[createWorkspace] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    const { name, description } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      console.error("[createWorkspace] Validation failed: Missing name");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Workspace name is required" } });
      return;
    }

    if (name.length > 100) {
      console.error("[createWorkspace] Validation failed: Name too long");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Workspace name must be 100 characters or less" } });
      return;
    }

    if (description && typeof description === "string" && description.length > 500) {
      console.error("[createWorkspace] Validation failed: Description too long");
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Description must be 500 characters or less" } });
      return;
    }

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({
        owner_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (workspaceError) {
      console.error("[createWorkspace] Supabase error:", workspaceError);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to create workspace" } });
      return;
    }

    // Add owner as member
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: "owner"
      });

    if (memberError) {
      console.error("[createWorkspace] Failed to add owner as member:", memberError);
      // Rollback workspace creation
      await supabase.from("workspaces").delete().eq("id", workspace.id);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to create workspace membership" } });
      return;
    }

    console.log("[createWorkspace] Success: Created workspace", workspace.id);
    res.status(201).json({ ok: true, data: { ...workspace, user_role: "owner" } });
  } catch (error) {
    console.error("[createWorkspace] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * GET /api/workspaces/:id
 * Returns a specific workspace
 */
export async function getWorkspace(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const workspaceId = req.params.id;
    console.log("[getWorkspace] Request from user:", userId, "Workspace:", workspaceId);

    if (!userId) {
      console.error("[getWorkspace] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    // Verify user is a member
    const { data: memberData, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (memberError || !memberData) {
      console.error("[getWorkspace] Not a member:", memberError);
      res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "You are not a member of this workspace" } });
      return;
    }

    // Get workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error("[getWorkspace] Not found:", workspaceError);
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Workspace not found" } });
      return;
    }

    console.log("[getWorkspace] Success:", workspace.name);
    res.json({ ok: true, data: { ...workspace, user_role: memberData.role } });
  } catch (error) {
    console.error("[getWorkspace] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * PATCH /api/workspaces/:id
 * Updates a workspace (admin/owner only)
 */
export async function updateWorkspace(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const workspaceId = req.params.id;
    console.log("[updateWorkspace] Request from user:", userId, "Workspace:", workspaceId);

    if (!userId) {
      console.error("[updateWorkspace] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    // Verify user is admin or owner
    const { data: memberData, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (memberError || !memberData || !["owner", "admin"].includes(memberData.role)) {
      console.error("[updateWorkspace] Forbidden:", memberError);
      res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "Only admins and owners can update workspaces" } });
      return;
    }

    const { name, description } = req.body;
    const updates: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Workspace name cannot be empty" } });
        return;
      }
      if (name.length > 100) {
        res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Workspace name must be 100 characters or less" } });
        return;
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      if (description && typeof description === "string" && description.length > 500) {
        res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Description must be 500 characters or less" } });
        return;
      }
      updates.description = description?.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "No valid fields to update" } });
      return;
    }

    const { data, error } = await supabase
      .from("workspaces")
      .update(updates)
      .eq("id", workspaceId)
      .select()
      .single();

    if (error) {
      console.error("[updateWorkspace] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to update workspace" } });
      return;
    }

    console.log("[updateWorkspace] Success:", data.id);
    res.json({ ok: true, data });
  } catch (error) {
    console.error("[updateWorkspace] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * DELETE /api/workspaces/:id
 * Deletes a workspace (owner only)
 */
export async function deleteWorkspace(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const workspaceId = req.params.id;
    console.log("[deleteWorkspace] Request from user:", userId, "Workspace:", workspaceId);

    if (!userId) {
      console.error("[deleteWorkspace] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    // Verify user is owner
    const { data: memberData, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (memberError || !memberData || memberData.role !== "owner") {
      console.error("[deleteWorkspace] Forbidden:", memberError);
      res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "Only workspace owners can delete workspaces" } });
      return;
    }

    const { error } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", workspaceId);

    if (error) {
      console.error("[deleteWorkspace] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to delete workspace" } });
      return;
    }

    console.log("[deleteWorkspace] Success:", workspaceId);
    res.json({ ok: true, message: "Workspace deleted successfully" });
  } catch (error) {
    console.error("[deleteWorkspace] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * GET /api/workspaces/:id/members
 * Returns all members of a workspace
 */
export async function getWorkspaceMembers(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const workspaceId = req.params.id;
    console.log("[getWorkspaceMembers] Request from user:", userId, "Workspace:", workspaceId);

    if (!userId) {
      console.error("[getWorkspaceMembers] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    // Verify user is a member
    const { data: memberCheck, error: memberCheckError } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (memberCheckError || !memberCheck) {
      console.error("[getWorkspaceMembers] Forbidden:", memberCheckError);
      res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "You are not a member of this workspace" } });
      return;
    }

    // Get all members
    const { data, error } = await supabase
      .from("workspace_members")
      .select(`
        id,
        user_id,
        role,
        created_at,
        profiles:user_id (
          email,
          name
        )
      `)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getWorkspaceMembers] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to fetch members" } });
      return;
    }

    console.log(`[getWorkspaceMembers] Success: Found ${data?.length || 0} members`);
    res.json({ ok: true, data: data || [] });
  } catch (error) {
    console.error("[getWorkspaceMembers] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * POST /api/workspaces/:id/invite
 * Invites a user to a workspace (admin/owner only)
 */
export async function inviteMember(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const workspaceId = req.params.id;
    const { email, role = "member" } = req.body;

    console.log("[inviteMember] Request from user:", userId, "Workspace:", workspaceId, "Email:", email);

    if (!userId) {
      console.error("[inviteMember] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    // Verify user is admin or owner
    const { data: memberData, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (memberError || !memberData || !["owner", "admin"].includes(memberData.role)) {
      console.error("[inviteMember] Forbidden:", memberError);
      res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "Only admins and owners can invite members" } });
      return;
    }

    // Validate email
    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Valid email is required" } });
      return;
    }

    // Validate role
    if (!["owner", "admin", "member"].includes(role)) {
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Invalid role" } });
      return;
    }

    // Find user by email
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email.toLowerCase())
      .single();

    if (profileError || !profileData) {
      console.error("[inviteMember] User not found:", profileError);
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "User not found" } });
      return;
    }

    const invitedUserId = profileData.user_id;

    // Check if user is already a member
    const { data: existingMember, error: existingError } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", invitedUserId)
      .single();

    if (existingMember) {
      res.status(409).json({ ok: false, error: { code: "ALREADY_MEMBER", message: "User is already a member" } });
      return;
    }

    // Add member
    const { data, error } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspaceId,
        user_id: invitedUserId,
        role: role
      })
      .select()
      .single();

    if (error) {
      console.error("[inviteMember] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to add member" } });
      return;
    }

    console.log("[inviteMember] Success: Added member", data.id);
    res.status(201).json({ ok: true, data });
  } catch (error) {
    console.error("[inviteMember] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * PATCH /api/workspaces/:id/members/:memberId
 * Updates a member's role (admin/owner only)
 */
export async function updateMember(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const workspaceId = req.params.id;
    const memberId = req.params.memberId;
    const { role } = req.body;

    console.log("[updateMember] Request from user:", userId, "Workspace:", workspaceId, "Member:", memberId);

    if (!userId) {
      console.error("[updateMember] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    // Verify user is admin or owner
    const { data: memberData, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (memberError || !memberData || !["owner", "admin"].includes(memberData.role)) {
      console.error("[updateMember] Forbidden:", memberError);
      res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "Only admins and owners can update members" } });
      return;
    }

    // Validate role
    if (!role || !["owner", "admin", "member"].includes(role)) {
      res.status(400).json({ ok: false, error: { code: "INVALID_INPUT", message: "Valid role is required" } });
      return;
    }

    // Update member
    const { data, error } = await supabase
      .from("workspace_members")
      .update({ role })
      .eq("id", memberId)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    if (error) {
      console.error("[updateMember] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to update member" } });
      return;
    }

    console.log("[updateMember] Success:", data.id);
    res.json({ ok: true, data });
  } catch (error) {
    console.error("[updateMember] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}

/**
 * DELETE /api/workspaces/:id/members/:memberId
 * Removes a member from a workspace (admin/owner only)
 */
export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user_id;
    const workspaceId = req.params.id;
    const memberId = req.params.memberId;

    console.log("[removeMember] Request from user:", userId, "Workspace:", workspaceId, "Member:", memberId);

    if (!userId) {
      console.error("[removeMember] Unauthorized: No user_id");
      res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    // Verify user is admin or owner
    const { data: memberData, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (memberError || !memberData || !["owner", "admin"].includes(memberData.role)) {
      console.error("[removeMember] Forbidden:", memberError);
      res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "Only admins and owners can remove members" } });
      return;
    }

    // Prevent removing the last owner
    const { data: targetMember, error: targetError } = await supabase
      .from("workspace_members")
      .select("role, user_id")
      .eq("id", memberId)
      .eq("workspace_id", workspaceId)
      .single();

    if (targetError || !targetMember) {
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Member not found" } });
      return;
    }

    if (targetMember.role === "owner") {
      const { data: owners, error: ownersError } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("role", "owner");

      if (owners && owners.length <= 1) {
        res.status(400).json({ ok: false, error: { code: "INVALID_OPERATION", message: "Cannot remove the last owner" } });
        return;
      }
    }

    // Remove member
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", memberId)
      .eq("workspace_id", workspaceId);

    if (error) {
      console.error("[removeMember] Supabase error:", error);
      res.status(500).json({ ok: false, error: { code: "DATABASE_ERROR", message: "Failed to remove member" } });
      return;
    }

    console.log("[removeMember] Success:", memberId);
    res.json({ ok: true, message: "Member removed successfully" });
  } catch (error) {
    console.error("[removeMember] Exception:", error);
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
}
