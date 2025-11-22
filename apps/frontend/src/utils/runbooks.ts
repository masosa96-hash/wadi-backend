import { logger } from './logger';
import { AppError, ErrorType } from './errorHandler';

export class RunbookExecutor {
    public static async execute(error: AppError): Promise<boolean> {
        logger.info(`Executing runbook for error type: ${error.type}`);

        switch (error.type) {
            case ErrorType.AUTH:
                return this.handleAuthError();
            case ErrorType.NETWORK:
                return this.handleNetworkError();
            case ErrorType.DATABASE:
                return this.handleDatabaseError();
            default:
                logger.warn('No runbook found for this error type.');
                return false;
        }
    }

    private static handleAuthError(): boolean {
        // Runbook:
        // 1. Clear local storage (except critical flags)
        // 2. Redirect to login
        logger.info('Runbook: Clearing session and redirecting to login.');

        // Preserve some settings if needed
        const theme = localStorage.getItem('theme-storage');
        localStorage.clear();
        if (theme) localStorage.setItem('theme-storage', theme);

        window.location.href = '/login';
        return true;
    }

    private static handleNetworkError(): boolean {
        // Runbook:
        // 1. Check online status
        // 2. If online, maybe just a glitch, suggest retry (handled by UI)
        // 3. If offline, show offline banner (could be a global store action)

        if (!navigator.onLine) {
            logger.warn('Runbook: User is offline.');
            // TODO: Trigger global offline toast/banner
            return true;
        }
        return false; // Let the UI handle the retry button
    }

    private static handleDatabaseError(): boolean {
        // Runbook:
        // 1. Log critical error
        // 2. If it's a connection issue, treat as network
        // 3. Otherwise, it's likely a bug, nothing to auto-heal
        logger.error('Runbook: Critical Database Error. Manual intervention required.');
        return false;
    }
}
