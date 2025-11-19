import winston from "winston";

/**
 * Structured logging configuration using Winston
 */

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");

/**
 * Custom format for console output
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
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
  })
);

/**
 * JSON format for file output
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  level: logLevel,
  format: jsonFormat,
  defaultMeta: { service: "wadi-api" },
  transports: [
    // Console output for development
    new winston.transports.Console({
      format: consoleFormat,
    }),
    
    // File output for errors (always enabled)
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    
    // File output for all logs (production only)
    ...(process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
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
export function logRequest(
  method: string,
  path: string,
  userId?: string,
  duration?: number
) {
  logger.info("HTTP Request", {
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
export function logResponse(
  method: string,
  path: string,
  statusCode: number,
  userId?: string,
  duration?: number
) {
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
  logger.log(level, "HTTP Response", {
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
export function logAuth(
  event: "login" | "logout" | "register" | "refresh",
  userId?: string,
  success: boolean = true,
  details?: Record<string, unknown>
) {
  logger.info(`Auth: ${event}`, {
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
export function logExternalApi(
  service: "openai" | "supabase",
  operation: string,
  duration: number,
  success: boolean,
  error?: string
) {
  const level = success ? "info" : "error";
  logger.log(level, `External API: ${service}`, {
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
export function logError(
  error: Error,
  context: {
    userId?: string;
    path?: string;
    method?: string;
    [key: string]: unknown;
  }
) {
  logger.error(error.message, {
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
export function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ["password", "token", "apiKey", "secret", "authorization"];
  const sanitized = { ...data };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    }
  }
  
  return sanitized;
}
