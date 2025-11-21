"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInvitation = validateInvitation;
exports.createInvitation = createInvitation;
exports.listInvitations = listInvitations;
exports.deleteInvitation = deleteInvitation;
exports.registerWithInvite = registerWithInvite;
const supabase_1 = require("../config/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * GET /api/invitations/validate/:code
 * Public endpoint to validate invitation code without consuming it
 */
async function validateInvitation(req, res) {
    try {
        const { code } = req.params;
        const { email } = req.query;
        if (!code) {
            throw errorHandler_1.Errors.invalidInput("code", "Invitation code is required");
        }
        // Call Supabase function to validate
        const { data, error } = await supabase_1.supabase.rpc("validate_invitation_code", {
            p_code: code,
            p_email: email || null,
        });
        if (error) {
            console.error("Error validating invitation:", error);
            throw (0, errorHandler_1.createError)("Failed to validate invitation", 500, "SUPABASE_ERROR", undefined, true);
        }
        res.json({
            valid: data,
            code: code,
        });
    }
    catch (error) {
        console.error("Validate invitation error:", error);
        if (error instanceof Error && "statusCode" in error) {
            throw error;
        }
        res.status(500).json({ error: "Failed to validate invitation" });
    }
}
/**
 * POST /api/admin/invitations
 * Create new invitation (admin only)
 */
async function createInvitation(req, res) {
    try {
        const userId = req.user_id;
        const { email, maxUses, expiresInDays, metadata } = req.body;
        if (!userId) {
            throw errorHandler_1.Errors.unauthorized();
        }
        // Check if user is admin
        const { data: profile } = await supabase_1.supabase
            .from("profiles")
            .select("role")
            .eq("user_id", userId)
            .single();
        if (!profile || profile.role !== "admin") {
            throw errorHandler_1.Errors.forbidden("Admin access required");
        }
        // Generate invitation code
        const { data: codeData, error: codeError } = await supabase_1.supabase
            .rpc("generate_invitation_code");
        if (codeError || !codeData) {
            console.error("Error generating code:", codeError);
            throw (0, errorHandler_1.createError)("Failed to generate invitation code", 500, "SUPABASE_ERROR");
        }
        const code = codeData;
        // Calculate expiration
        let expiresAt = null;
        if (expiresInDays) {
            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + expiresInDays);
            expiresAt = expireDate.toISOString();
        }
        // Create invitation
        const { data, error } = await supabase_1.supabase
            .from("beta_invitations")
            .insert({
            code,
            created_by: userId,
            email: email || null,
            max_uses: maxUses || null,
            expires_at: expiresAt,
            metadata: metadata || {},
        })
            .select()
            .single();
        if (error) {
            console.error("Error creating invitation:", error);
            throw (0, errorHandler_1.createError)("Failed to create invitation", 500, "SUPABASE_ERROR");
        }
        res.status(201).json({ invitation: data });
    }
    catch (error) {
        console.error("Create invitation error:", error);
        if (error instanceof Error && "statusCode" in error) {
            throw error;
        }
        res.status(500).json({ error: "Failed to create invitation" });
    }
}
/**
 * GET /api/admin/invitations
 * List all invitations (admin only)
 */
async function listInvitations(req, res) {
    try {
        const userId = req.user_id;
        if (!userId) {
            throw errorHandler_1.Errors.unauthorized();
        }
        // Check if user is admin
        const { data: profile } = await supabase_1.supabase
            .from("profiles")
            .select("role")
            .eq("user_id", userId)
            .single();
        if (!profile || profile.role !== "admin") {
            throw errorHandler_1.Errors.forbidden("Admin access required");
        }
        // Get all invitations
        const { data, error } = await supabase_1.supabase
            .from("beta_invitations")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            console.error("Error listing invitations:", error);
            throw (0, errorHandler_1.createError)("Failed to list invitations", 500, "SUPABASE_ERROR");
        }
        res.json({ invitations: data || [] });
    }
    catch (error) {
        console.error("List invitations error:", error);
        if (error instanceof Error && "statusCode" in error) {
            throw error;
        }
        res.status(500).json({ error: "Failed to list invitations" });
    }
}
/**
 * DELETE /api/admin/invitations/:id
 * Delete/revoke invitation (admin only)
 */
async function deleteInvitation(req, res) {
    try {
        const userId = req.user_id;
        const { id } = req.params;
        if (!userId) {
            throw errorHandler_1.Errors.unauthorized();
        }
        // Check if user is admin
        const { data: profile } = await supabase_1.supabase
            .from("profiles")
            .select("role")
            .eq("user_id", userId)
            .single();
        if (!profile || profile.role !== "admin") {
            throw errorHandler_1.Errors.forbidden("Admin access required");
        }
        // Delete invitation
        const { error } = await supabase_1.supabase
            .from("beta_invitations")
            .delete()
            .eq("id", id);
        if (error) {
            console.error("Error deleting invitation:", error);
            throw (0, errorHandler_1.createError)("Failed to delete invitation", 500, "SUPABASE_ERROR");
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error("Delete invitation error:", error);
        if (error instanceof Error && "statusCode" in error) {
            throw error;
        }
        res.status(500).json({ error: "Failed to delete invitation" });
    }
}
/**
 * POST /api/auth/register-with-invite
 * Register new user with invitation code
 */
async function registerWithInvite(req, res) {
    try {
        const { email, password, displayName, inviteCode } = req.body;
        // Validate required fields
        if (!email || !password || !displayName || !inviteCode) {
            throw errorHandler_1.Errors.invalidInput("required_fields", "Email, password, display name, and invite code are required");
        }
        // Validate invitation code
        const { data: isValid, error: validateError } = await supabase_1.supabase
            .rpc("validate_invitation_code", {
            p_code: inviteCode,
            p_email: email,
        });
        if (validateError) {
            console.error("Error validating invitation:", validateError);
            throw (0, errorHandler_1.createError)("Failed to validate invitation", 500, "SUPABASE_ERROR");
        }
        if (!isValid) {
            throw (0, errorHandler_1.createError)("Invalid, expired, or already used invitation code", 400, "INVALID_INVITATION", undefined, false);
        }
        // Create auth user
        const { data: authData, error: authError } = await supabase_1.supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for beta
        });
        if (authError || !authData.user) {
            console.error("Error creating auth user:", authError);
            throw (0, errorHandler_1.createError)("Failed to create user account", 500, "AUTH_ERROR");
        }
        // Create profile
        const { error: profileError } = await supabase_1.supabase
            .from("profiles")
            .insert({
            user_id: authData.user.id,
            display_name: displayName,
            role: "user",
        });
        if (profileError) {
            console.error("Error creating profile:", profileError);
            // Rollback: delete auth user
            await supabase_1.supabase.auth.admin.deleteUser(authData.user.id);
            throw (0, errorHandler_1.createError)("Failed to create user profile", 500, "SUPABASE_ERROR");
        }
        // Consume invitation code
        const { error: consumeError } = await supabase_1.supabase
            .rpc("consume_invitation_code", {
            p_code: inviteCode,
            p_user_id: authData.user.id,
        });
        if (consumeError) {
            console.error("Error consuming invitation:", consumeError);
            // Note: We don't rollback here as user is already created
        }
        res.status(201).json({
            user: {
                id: authData.user.id,
                email: authData.user.email,
                displayName,
            },
            message: "Registration successful",
        });
    }
    catch (error) {
        console.error("Register with invite error:", error);
        if (error instanceof Error && "statusCode" in error) {
            throw error;
        }
        res.status(500).json({ error: "Registration failed" });
    }
}
