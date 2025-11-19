import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

/**
 * Rate limit configuration for different endpoint types
 */

/**
 * Rate limiter for AI run creation
 * Prevents abuse of OpenAI API
 */
export const runCreationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    error: "Rate limit exceeded",
    code: "RATE_LIMIT_EXCEEDED",
    retryable: true,
    limit: 20,
    window: "1 minute",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request) => {
    // Use user_id if authenticated, otherwise IP address
    return req.user_id || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    const retryAfter = 60; // 1 minute in seconds
    res.status(429).json({
      error: "Rate limit exceeded. Too many AI runs created.",
      code: "RATE_LIMIT_EXCEEDED",
      retryable: true,
      retryAfter,
      limit: 20,
      window: "1 minute",
    });
  },
});

/**
 * Rate limiter for session creation
 * Prevents session spam
 */
export const sessionCreationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 sessions per minute
  message: {
    error: "Rate limit exceeded",
    code: "RATE_LIMIT_EXCEEDED",
    retryable: true,
    limit: 10,
    window: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user_id || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    const retryAfter = 60; // 1 minute in seconds
    res.status(429).json({
      error: "Rate limit exceeded. Too many sessions created.",
      code: "RATE_LIMIT_EXCEEDED",
      retryable: true,
      retryAfter,
      limit: 10,
      window: "1 minute",
    });
  },
});

/**
 * Rate limiter for share link creation
 * Prevents share link spam
 */
export const shareLinkLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 share links per 5 minutes
  message: {
    error: "Rate limit exceeded",
    code: "RATE_LIMIT_EXCEEDED",
    retryable: true,
    limit: 10,
    window: "5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user_id || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    const retryAfter = 300; // 5 minutes in seconds
    res.status(429).json({
      error: "Rate limit exceeded. Too many share links created.",
      code: "RATE_LIMIT_EXCEEDED",
      retryable: true,
      retryAfter,
      limit: 10,
      window: "5 minutes",
    });
  },
});

/**
 * General API rate limiter for all endpoints
 * Prevents general API abuse
 */
export const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: "Rate limit exceeded",
    code: "RATE_LIMIT_EXCEEDED",
    retryable: true,
    limit: 100,
    window: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user_id || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    const retryAfter = 60; // 1 minute in seconds
    res.status(429).json({
      error: "Rate limit exceeded. Please slow down your requests.",
      code: "RATE_LIMIT_EXCEEDED",
      retryable: true,
      retryAfter,
      limit: 100,
      window: "1 minute",
    });
  },
});
