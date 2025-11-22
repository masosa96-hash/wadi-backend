import { logger } from './logger';
import { RunbookExecutor } from './runbooks';

export const ErrorType = {
    AUTH: 'AUTH',
    NETWORK: 'NETWORK',
    VALIDATION: 'VALIDATION',
    DATABASE: 'DATABASE',
    UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface AppError extends Error {
    type: ErrorType;
    originalError?: any;
    isRecoverable: boolean;
}

class ErrorHandler {
    public async handleError(error: any, context?: string): Promise<AppError> {
        const appError = this.classifyError(error);

        logger.error(
            `[${context || 'Global'}] ${appError.message}`,
            appError,
            { type: appError.type, original: error }
        );

        // Attempt to auto-heal
        const healed = await RunbookExecutor.execute(appError);
        if (healed) {
            logger.info(`[${context || 'Global'}] Error auto-healed by runbook.`);
        }

        return appError;
    }

    private classifyError(error: any): AppError {
        const message = error?.message || 'An unexpected error occurred';
        let type: ErrorType = ErrorType.UNKNOWN;
        let isRecoverable = false;

        // Auth Errors
        if (
            message.includes('auth') ||
            message.includes('JWT') ||
            message.includes('session') ||
            error?.status === 401 ||
            error?.status === 403
        ) {
            type = ErrorType.AUTH;
            isRecoverable = true; // Usually recoverable by re-login
        }

        // Network Errors
        else if (
            message.includes('fetch') ||
            message.includes('network') ||
            message.includes('connection')
        ) {
            type = ErrorType.NETWORK;
            isRecoverable = true; // Recoverable by retry
        }

        // Validation Errors
        else if (
            message.includes('validation') ||
            message.includes('invalid') ||
            error?.status === 400
        ) {
            type = ErrorType.VALIDATION;
            isRecoverable = false; // User needs to fix input
        }

        // Database Errors
        else if (
            message.includes('database') ||
            message.includes('duplicate key') ||
            message.includes('foreign key')
        ) {
            type = ErrorType.DATABASE;
            isRecoverable = false; // Usually indicates a bug or conflict
        }

        const appError = new Error(message) as AppError;
        appError.type = type;
        appError.originalError = error;
        appError.isRecoverable = isRecoverable;

        return appError;
    }

    public getUserMessage(error: AppError): string {
        switch (error.type) {
            case ErrorType.AUTH:
                return "Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.";
            case ErrorType.NETWORK:
                return "Error de conexión. Verificá tu internet e intentá de nuevo.";
            case ErrorType.VALIDATION:
                return "Por favor, revisá los datos ingresados.";
            case ErrorType.DATABASE:
                return "Hubo un problema con el sistema. Por favor, contactá a soporte.";
            default:
                return "Ocurrió un error inesperado. Estamos trabajando en ello.";
        }
    }
}

export const errorHandler = new ErrorHandler();
