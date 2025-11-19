import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

// Extend Express Request type to include user_id
declare global {
  namespace Express {
    interface Request {
      user_id?: string;
    }
  }
}

/**
 * Authentication middleware
 * Validates Supabase JWT token from Authorization header
 * Attaches user_id to request object if valid
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      // Distinguish between expired and invalid tokens
      const isExpired = error?.message?.includes('expired') || error?.message?.includes('JWT expired');
      res.status(401).json({ 
        error: isExpired ? "Token expired" : "Invalid token",
        code: isExpired ? "AUTH_EXPIRED" : "AUTH_INVALID",
        retryable: isExpired
      });
      return;
    }

    // Attach user_id to request
    req.user_id = data.user.id;
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
