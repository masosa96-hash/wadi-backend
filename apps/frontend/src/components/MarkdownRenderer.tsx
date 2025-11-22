import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { theme } from "../styles/theme";

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyToClipboard = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(`code-${index}`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    let codeBlockIndex = 0;

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    const currentIndex = codeBlockIndex++;

                    if (!inline && match) {
                        return (
                            <div style={{
                                position: "relative",
                                marginBottom: theme.spacing.md,
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                                    background: "#1E293B",
                                    borderTopLeftRadius: theme.borderRadius.sm,
                                    borderTopRightRadius: theme.borderRadius.sm,
                                    fontSize: theme.typography.fontSize.xs,
                                    color: "#94A3B8",
                                }}>
                                    <span>{match[1]}</span>
                                    <button
                                        onClick={() => copyToClipboard(codeString, currentIndex)}
                                        style={{
                                            background: copiedCode === `code-${currentIndex}` ? "#10B981" : "transparent",
                                            border: "1px solid #475569",
                                            borderRadius: theme.borderRadius.sm,
                                            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                                            color: "#FFFFFF",
                                            fontSize: theme.typography.fontSize.xs,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        {copiedCode === `code-${currentIndex}` ? "✓ Copiado" : "Copiar"}
                                    </button>
                                </div>
                                <pre style={{
                                    margin: 0,
                                    padding: theme.spacing.md,
                                    background: "#0F172A",
                                    borderBottomLeftRadius: theme.borderRadius.sm,
                                    borderBottomRightRadius: theme.borderRadius.sm,
                                    overflowX: "auto",
                                }}>
                                    <code
                                        className={className}
                                        {...props}
                                        style={{
                                            fontFamily: "Monaco, Consolas, monospace",
                                            fontSize: theme.typography.fontSize.sm,
                                            color: "#E2E8F0",
                                        }}
                                    >
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        );
                    }

                    return (
                        <code
                            className={className}
                            {...props}
                            style={{
                                background: "rgba(0, 0, 0, 0.05)",
                                padding: "2px 6px",
                                borderRadius: "3px",
                                fontFamily: "Monaco, Consolas, monospace",
                                fontSize: "0.9em",
                            }}
                        >
                            {children}
                        </code>
                    );
                },
                a({ children, ...props }: any) {
                    return (
                        <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: theme.colors.accent.primary,
                                textDecoration: "underline",
                            }}
                        >
                            {children}
                        </a>
                    );
                },
                table({ children, ...props }: any) {
                    return (
                        <div style={{ overflowX: "auto", marginBottom: theme.spacing.md }}>
                            <table
                                {...props}
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: theme.typography.fontSize.sm,
                                }}
                            >
                                {children}
                            </table>
                        </div>
                    );
                },
                th({ children, ...props }: any) {
                    return (
                        <th
                            {...props}
                            style={{
                                padding: theme.spacing.sm,
                                borderBottom: `2px solid ${theme.colors.border.default}`,
                                textAlign: "left",
                                fontWeight: theme.typography.fontWeight.semibold,
                                background: theme.colors.background.secondary,
                            }}
                        >
                            {children}
                        </th>
                    );
                },
                td({ children, ...props }: any) {
                    return (
                        <td
                            {...props}
                            style={{
                                padding: theme.spacing.sm,
                                borderBottom: `1px solid ${theme.colors.border.subtle}`,
                            }}
                        >
                            {children}
                        </td>
                    );
                },
                ul({ children, ...props }: any) {
                    return (
                        <ul
                            {...props}
                            style={{
                                paddingLeft: theme.spacing.xl,
                                marginBottom: theme.spacing.md,
                            }}
                        >
                            {children}
                        </ul>
                    );
                },
                ol({ children, ...props }: any) {
                    return (
                        <ol
                            {...props}
                            style={{
                                paddingLeft: theme.spacing.xl,
                                marginBottom: theme.spacing.md,
                            }}
                        >
                            {children}
                        </ol>
                    );
                },
                blockquote({ children, ...props }: any) {
                    return (
                        <blockquote
                            {...props}
                            style={{
                                borderLeft: `4px solid ${theme.colors.accent.primary}`,
                                paddingLeft: theme.spacing.md,
                                marginLeft: 0,
                                marginBottom: theme.spacing.md,
                                color: theme.colors.text.secondary,
                                fontStyle: "italic",
                            }}
                        >
                            {children}
                        </blockquote>
                    );
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
