import type { Request, Response, NextFunction } from "express";

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Authentication Errors
  AUTH_MISSING: "AUTH_MISSING",
  AUTH_INVALID: "AUTH_INVALID",
  AUTH_EXPIRED: "AUTH_EXPIRED",
  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",

  // Resource Errors
  PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  RUN_NOT_FOUND: "RUN_NOT_FOUND",
  TASK_NOT_FOUND: "TASK_NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // Validation Errors
  INVALID_INPUT: "INVALID_INPUT",
  INVALID_PROJECT_NAME: "INVALID_PROJECT_NAME",
  INVALID_EMAIL: "INVALID_EMAIL",
  WEAK_PASSWORD: "WEAK_PASSWORD",

  // External Service Errors
  OPENAI_API_ERROR: "OPENAI_API_ERROR",
  OPENAI_RATE_LIMIT: "OPENAI_RATE_LIMIT",
  SUPABASE_ERROR: "SUPABASE_ERROR",

  // General Errors
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
} as const;

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  timestamp: string;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, unknown>;
  public retryable: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ErrorCodes.INTERNAL_SERVER_ERROR,
    details?: Record<string, unknown>,
    retryable: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.retryable = retryable;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handler middleware
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  console.error("[Error Handler]", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user_id,
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    const response: ErrorResponse = {
      error: err.message,
      code: err.code,
      details: err.details,
      retryable: err.retryable,
      timestamp: new Date().toISOString(),
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle known error types
  if (err.message?.includes("JWT") || err.message?.includes("token")) {
    const response: ErrorResponse = {
      error: "Authentication failed",
      code: ErrorCodes.AUTH_INVALID,
      retryable: false,
      timestamp: new Date().toISOString(),
    };
    res.status(401).json(response);
    return;
  }

  // Handle Supabase errors
  if (err.message?.includes("Supabase") || err.message?.includes("Database")) {
    const response: ErrorResponse = {
      error: "Database operation failed",
      code: ErrorCodes.SUPABASE_ERROR,
      retryable: true,
      timestamp: new Date().toISOString(),
    };
    res.status(503).json(response);
    return;
  }

  // Default 500 error
  const response: ErrorResponse = {
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
    code: ErrorCodes.INTERNAL_SERVER_ERROR,
    retryable: true,
    timestamp: new Date().toISOString(),
  };
  res.status(500).json(response);
}

/**
 * Helper function to create standardized errors
 */
export function createError(
  message: string,
  statusCode: number = 500,
  code: string = ErrorCodes.INTERNAL_SERVER_ERROR,
  details?: Record<string, unknown>,
  retryable: boolean = false
): ApiError {
  return new ApiError(message, statusCode, code, details, retryable);
}

/**
 * Common error creators
 */
export const Errors = {
  notFound: (resource: string) =>
    createError(
      `${resource} not found`,
      404,
      `${resource.toUpperCase()}_NOT_FOUND`,
      undefined,
      false
    ),

  unauthorized: (message: string = "Unauthorized") =>
    createError(message, 401, ErrorCodes.AUTH_INVALID, undefined, false),

  forbidden: (message: string = "Insufficient permissions") =>
    createError(message, 403, ErrorCodes.INSUFFICIENT_PERMISSIONS, undefined, false),

  invalidInput: (field: string, constraint: string) =>
    createError(
      `Invalid input: ${field}`,
      400,
      ErrorCodes.INVALID_INPUT,
      { field, constraint },
      false
    ),

  rateLimit: (retryAfter: number) =>
    createError(
      "Rate limit exceeded",
      429,
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      { retryAfter },
      true
    ),

  openaiError: (message: string) =>
    createError(
      message,
      503,
      ErrorCodes.OPENAI_API_ERROR,
      undefined,
      true
    ),
};
