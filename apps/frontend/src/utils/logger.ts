

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
    error?: Error;
}

class Logger {
    private logs: LogEntry[] = [];
    private maxLogs = 100;

    private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            error,
        };

        // Add to internal buffer (for potential error reporting)
        this.logs.unshift(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }

        // Console output with styling
        const style = this.getStyle(level);
        console.groupCollapsed(`%c[${level.toUpperCase()}] ${message}`, style);
        if (context) console.log('Context:', context);
        if (error) console.error('Error:', error);
        console.log('Timestamp:', entry.timestamp);
        console.groupEnd();

        // TODO: Send to external logging service (e.g., Sentry, Datadog) in production
    }

    debug(message: string, context?: Record<string, any>) {
        if (import.meta.env.DEV) {
            this.log('debug', message, context);
        }
    }

    info(message: string, context?: Record<string, any>) {
        this.log('info', message, context);
    }

    warn(message: string, context?: Record<string, any>) {
        this.log('warn', message, context);
    }

    error(message: string, error?: Error, context?: Record<string, any>) {
        this.log('error', message, context, error);
    }

    getLogs() {
        return this.logs;
    }

    private getStyle(level: LogLevel): string {
        switch (level) {
            case 'debug': return 'color: #9CA3AF';
            case 'info': return 'color: #3B82F6';
            case 'warn': return 'color: #F59E0B';
            case 'error': return 'color: #EF4444; font-weight: bold';
        }
    }
}

export const logger = new Logger();
