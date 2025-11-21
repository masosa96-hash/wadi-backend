"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const supabase_1 = require("../config/supabase");
/**
 * Authentication middleware
 * Validates Supabase JWT token from Authorization header
 * Attaches user_id to request object if valid
 */
async function authMiddleware(req, res, next) {
    try {
        console.log("[Auth] Checking auth for:", req.method, req.path);
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.error("[Auth] Missing or invalid authorization header");
            res.status(401).json({ ok: false, error: { code: "AUTH_MISSING", message: "Missing or invalid authorization header" } });
            return;
        }
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        console.log("[Auth] Token present, verifying...");
        // Verify token with Supabase
        const { data, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !data.user) {
            console.error("[Auth] Token verification failed:", error?.message);
            // Distinguish between expired and invalid tokens
            const isExpired = error?.message?.includes('expired') || error?.message?.includes('JWT expired');
            res.status(401).json({
                ok: false,
                error: {
                    code: isExpired ? "AUTH_EXPIRED" : "AUTH_INVALID",
                    message: isExpired ? "Token expired" : "Invalid token"
                },
                retryable: isExpired
            });
            return;
        }
        // Attach user_id to request
        req.user_id = data.user.id;
        console.log("[Auth] Success: User authenticated:", data.user.id);
        next();
    }
    catch (error) {
        console.error("[Auth] Exception:", error);
        res.status(500).json({ ok: false, error: { code: "AUTH_ERROR", message: "Authentication failed" } });
    }
}
