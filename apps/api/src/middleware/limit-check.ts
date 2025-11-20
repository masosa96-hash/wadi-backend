import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

/**
 * Middleware to check if user is within message limit
 */
export async function checkMessageLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user_id;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase.rpc("check_usage_limit", {
      p_user_id: userId,
      p_limit_type: "messages",
      p_increment: 1,
    });

    if (error) {
      console.error("[LimitCheck] Error checking message limit:", error);
      // Allow request to proceed if limit check fails
      next();
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result.within_limit) {
      console.log(`[LimitCheck] User ${userId} exceeded message limit`);
      res.status(429).json({
        ok: false,
        error: "LIMIT_REACHED",
        message: "Alcanzaste el límite de mensajes de tu plan este mes",
        details: {
          limit: result.limit_value,
          current: result.current_usage,
          remaining: result.remaining,
          upgrade_url: "/billing",
        },
      });
      return;
    }

    console.log(
      `[LimitCheck] User ${userId} within limit: ${result.current_usage}/${result.limit_value}`
    );
    next();
  } catch (error) {
    console.error("[LimitCheck] Exception:", error);
    // Allow request to proceed
    next();
  }
}

/**
 * Middleware to check if user is within file upload limit
 */
export async function checkFileLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user_id;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase.rpc("check_usage_limit", {
      p_user_id: userId,
      p_limit_type: "files",
      p_increment: 1,
    });

    if (error) {
      console.error("[LimitCheck] Error checking file limit:", error);
      next();
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result.within_limit) {
      console.log(`[LimitCheck] User ${userId} exceeded file limit`);
      res.status(429).json({
        ok: false,
        error: "LIMIT_REACHED",
        message: "Alcanzaste el límite de archivos de tu plan este mes",
        details: {
          limit: result.limit_value,
          current: result.current_usage,
          remaining: result.remaining,
          upgrade_url: "/billing",
        },
      });
      return;
    }

    console.log(
      `[LimitCheck] User ${userId} within file limit: ${result.current_usage}/${result.limit_value}`
    );
    next();
  } catch (error) {
    console.error("[LimitCheck] Exception:", error);
    next();
  }
}

/**
 * Middleware to check workspace creation limit
 */
export async function checkWorkspaceLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user_id;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase.rpc("check_usage_limit", {
      p_user_id: userId,
      p_limit_type: "workspaces",
      p_increment: 1,
    });

    if (error) {
      console.error("[LimitCheck] Error checking workspace limit:", error);
      next();
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result.within_limit) {
      console.log(`[LimitCheck] User ${userId} exceeded workspace limit`);
      res.status(429).json({
        ok: false,
        error: "LIMIT_REACHED",
        message: "Alcanzaste el límite de espacios de tu plan",
        details: {
          limit: result.limit_value,
          current: result.current_usage,
          remaining: result.remaining,
          upgrade_url: "/billing",
        },
      });
      return;
    }

    console.log(
      `[LimitCheck] User ${userId} within workspace limit: ${result.current_usage}/${result.limit_value}`
    );
    next();
  } catch (error) {
    console.error("[LimitCheck] Exception:", error);
    next();
  }
}

/**
 * Check file size against user's plan limit
 */
export async function checkFileSizeLimit(
  userId: string,
  fileSizeMB: number
): Promise<{ allowed: boolean; maxSize: number }> {
  try {
    const { data: subscription } = await supabase
      .rpc("get_user_active_subscription", { p_user_id: userId })
      .single();

    if (!subscription) {
      // Default to free plan limits
      return { allowed: fileSizeMB <= 5, maxSize: 5 };
    }

    const maxSize = (subscription as any).max_file_size_mb || 5;
    return { allowed: fileSizeMB <= maxSize, maxSize };
  } catch (error) {
    console.error("[LimitCheck] Error checking file size limit:", error);
    return { allowed: fileSizeMB <= 5, maxSize: 5 };
  }
}
