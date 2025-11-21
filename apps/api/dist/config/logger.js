"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logRequest = logRequest;
exports.logResponse = logResponse;
exports.logAuth = logAuth;
exports.logExternalApi = logExternalApi;
exports.logError = logError;
exports.sanitizeLogData = sanitizeLogData;
const winston_1 = __importDefault(require("winston"));
/**
 * Structured logging configuration using Winston
 */
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");
/**
 * Custom format for console output
 */
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
        // Filter out empty objects and null values
        const filteredMeta = Object.entries(meta)
            .filter(([_, value]) => value !== null && value !== undefined && value !== "")
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        if (Object.keys(filteredMeta).length > 0) {
            log += `\n${JSON.stringify(filteredMeta, null, 2)}`;
        }
    }
    return log;
}));
/**
 * JSON format for file output
 */
const jsonFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
/**
 * Create Winston logger instance
 */
exports.logger = winston_1.default.createLogger({
    level: logLevel,
    format: jsonFormat,
    defaultMeta: { service: "wadi-api" },
    transports: [
        // Console output for development
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
        // File output for errors (always enabled)
        new winston_1.default.transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
        }),
        // File output for all logs (production only)
        ...(process.env.NODE_ENV === "production"
            ? [
                new winston_1.default.transports.File({
                    filename: "logs/combined.log",
                    maxsize: 10 * 1024 * 1024, // 10MB
                    maxFiles: 3,
                }),
            ]
            : []),
    ],
});
/**
 * Log HTTP request
 */
function logRequest(method, path, userId, duration) {
    exports.logger.info("HTTP Request", {
        method,
        path,
        userId,
        duration,
        type: "request",
    });
}
/**
 * Log HTTP response
 */
function logResponse(method, path, statusCode, userId, duration) {
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    exports.logger.log(level, "HTTP Response", {
        method,
        path,
        statusCode,
        userId,
        duration,
        type: "response",
    });
}
/**
 * Log authentication attempt
 */
function logAuth(event, userId, success = true, details) {
    exports.logger.info(`Auth: ${event}`, {
        event,
        userId,
        success,
        ...details,
        type: "auth",
    });
}
/**
 * Log external API call
 */
function logExternalApi(service, operation, duration, success, error) {
    const level = success ? "info" : "error";
    exports.logger.log(level, `External API: ${service}`, {
        service,
        operation,
        duration,
        success,
        error,
        type: "external_api",
    });
}
/**
 * Log error with context
 */
function logError(error, context) {
    exports.logger.error(error.message, {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        ...context,
        type: "error",
    });
}
/**
 * Sanitize sensitive data from logs
 */
function sanitizeLogData(data) {
    const sensitiveKeys = ["password", "token", "apiKey", "secret", "authorization"];
    const sanitized = { ...data };
    for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
            sanitized[key] = "[REDACTED]";
        }
    }
    return sanitized;
}
