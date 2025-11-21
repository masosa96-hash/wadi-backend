import { Component, ReactNode } from "react";
import { theme } from "../styles/theme";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("ErrorBoundary caught:", error, errorInfo);
        // TODO: Send to error tracking service (Sentry)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

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
                        ⚠️
                    </div>
                    <h1 style={{
                        margin: `0 0 ${theme.spacing.sm} 0`,
                        fontSize: theme.typography.fontSize["2xl"],
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.text.primary,
                    }}>
                        Algo salió mal
                    </h1>
                    <p style={{
                        margin: `0 0 ${theme.spacing.lg} 0`,
                        fontSize: theme.typography.fontSize.base,
                        color: theme.colors.text.secondary,
                        maxWidth: "400px",
                    }}>
                        Lo sentimos, ocurrió un error inesperado. Por favor, recarga la página.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                            background: theme.colors.accent.primary,
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: theme.borderRadius.md,
                            fontSize: theme.typography.fontSize.base,
                            fontWeight: theme.typography.fontWeight.medium,
                            cursor: "pointer",
                        }}
                    >
                        Recargar página
                    </button>
                    {this.state.error && (
                        <details style={{
                            marginTop: theme.spacing.xl,
                            padding: theme.spacing.md,
                            background: theme.colors.background.secondary,
                            borderRadius: theme.borderRadius.sm,
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.text.tertiary,
                            textAlign: "left",
                            maxWidth: "600px",
                        }}>
                            <summary style={{ cursor: "pointer", marginBottom: theme.spacing.sm }}>
                                Detalles técnicos
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
