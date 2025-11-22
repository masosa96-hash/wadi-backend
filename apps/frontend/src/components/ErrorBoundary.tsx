import { Component, ReactNode } from "react";
import { theme } from "../styles/theme";
import { errorHandler, AppError } from "../utils/errorHandler";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: AppError;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error: error as AppError };
    }

    componentDidCatch(error: Error, errorInfo: unknown) {
        // Use centralized error handler
        errorHandler.handleError(error, "ErrorBoundary");
        console.error("React Error Info:", errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const userMessage = errorHandler.getUserMessage(this.state.error);
            const isRecoverable = this.state.error.isRecoverable;

            return (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    padding: theme.spacing.xl,
                    background: theme.colors.background.primary,
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: "64px", marginBottom: theme.spacing.lg }}>
                        {isRecoverable ? "📡" : "⚠️"}
                    </div>
                    <h1 style={{
                        margin: `0 0 ${theme.spacing.sm} 0`,
                        fontSize: theme.typography.fontSize["2xl"],
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.text.primary,
                    }}>
                        {isRecoverable ? "Problema de conexión" : "Algo salió mal"}
                    </h1>
                    <p style={{
                        margin: `0 0 ${theme.spacing.lg} 0`,
                        fontSize: theme.typography.fontSize.base,
                        color: theme.colors.text.secondary,
                        maxWidth: "400px",
                    }}>
                        {userMessage}
                    </p>
                    <div style={{ display: "flex", gap: theme.spacing.md }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                                background: theme.colors.text.primary,
                                color: theme.colors.background.primary,
                                border: "none",
                                borderRadius: theme.borderRadius.md,
                                fontSize: theme.typography.fontSize.base,
                                fontWeight: theme.typography.fontWeight.medium,
                                cursor: "pointer",
                            }}
                        >
                            Recargar página
                        </button>
                        {isRecoverable && (
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                style={{
                                    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                                    background: "transparent",
                                    border: `1px solid ${theme.colors.border.default}`,
                                    color: theme.colors.text.primary,
                                    borderRadius: theme.borderRadius.md,
                                    fontSize: theme.typography.fontSize.base,
                                    fontWeight: theme.typography.fontWeight.medium,
                                    cursor: "pointer",
                                }}
                            >
                                Reintentar
                            </button>
                        )}
                    </div>

                    {import.meta.env.DEV && this.state.error && (
                        <details style={{
                            marginTop: theme.spacing.xl,
                            padding: theme.spacing.md,
                            background: theme.colors.background.surface || theme.colors.background.secondary,
                            borderRadius: theme.borderRadius.sm,
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.text.tertiary,
                            textAlign: "left",
                            maxWidth: "600px",
                            width: "100%",
                            overflow: "auto",
                        }}>
                            <summary style={{ cursor: "pointer", marginBottom: theme.spacing.sm }}>
                                Detalles técnicos ({this.state.error.type})
                            </summary>
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {this.state.error.message}
                                {"\n\n"}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
