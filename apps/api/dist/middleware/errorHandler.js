"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.ApiError = exports.ErrorCodes = void 0;
exports.errorHandler = errorHandler;
exports.createError = createError;
/**
 * Standard error codes
 */
exports.ErrorCodes = {
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
};
/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(message, statusCode = 500, code = exports.ErrorCodes.INTERNAL_SERVER_ERROR, details, retryable = false) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.retryable = retryable;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
/**
 * Centralized error handler middleware
 */
function errorHandler(err, req, res, next) {
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
        const response = {
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
        const response = {
            error: "Authentication failed",
            code: exports.ErrorCodes.AUTH_INVALID,
            retryable: false,
            timestamp: new Date().toISOString(),
        };
        res.status(401).json(response);
        return;
    }
    // Handle Supabase errors
    if (err.message?.includes("Supabase") || err.message?.includes("Database")) {
        const response = {
            error: "Database operation failed",
            code: exports.ErrorCodes.SUPABASE_ERROR,
            retryable: true,
            timestamp: new Date().toISOString(),
        };
        res.status(503).json(response);
        return;
    }
    // Default 500 error
    const response = {
        error: process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
        code: exports.ErrorCodes.INTERNAL_SERVER_ERROR,
        retryable: true,
        timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
}
/**
 * Helper function to create standardized errors
 */
function createError(message, statusCode = 500, code = exports.ErrorCodes.INTERNAL_SERVER_ERROR, details, retryable = false) {
    return new ApiError(message, statusCode, code, details, retryable);
}
/**
 * Common error creators
 */
exports.Errors = {
    notFound: (resource) => createError(`${resource} not found`, 404, `${resource.toUpperCase()}_NOT_FOUND`, undefined, false),
    unauthorized: (message = "Unauthorized") => createError(message, 401, exports.ErrorCodes.AUTH_INVALID, undefined, false),
    forbidden: (message = "Insufficient permissions") => createError(message, 403, exports.ErrorCodes.INSUFFICIENT_PERMISSIONS, undefined, false),
    invalidInput: (field, constraint) => createError(`Invalid input: ${field}`, 400, exports.ErrorCodes.INVALID_INPUT, { field, constraint }, false),
    rateLimit: (retryAfter) => createError("Rate limit exceeded", 429, exports.ErrorCodes.RATE_LIMIT_EXCEEDED, { retryAfter }, true),
    openaiError: (message) => createError(message, 503, exports.ErrorCodes.OPENAI_API_ERROR, undefined, true),
};
