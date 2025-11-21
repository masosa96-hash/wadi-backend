import { theme } from "../styles/theme";

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    style?: React.CSSProperties;
}

export function Skeleton({
    width = "100%",
    height = "20px",
    borderRadius = theme.borderRadius.sm,
    style
}: SkeletonProps) {
    return (
        <div
            style={{
                width,
                height,
                borderRadius,
                background: `linear-gradient(90deg, ${theme.colors.background.secondary} 25%, ${theme.colors.background.tertiary} 50%, ${theme.colors.background.secondary} 75%)`,
                backgroundSize: "200% 100%",
                animation: "skeleton-loading 1.5s ease-in-out infinite",
                ...style,
            }}
        />
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="16px"
                    width={i === lines - 1 ? "70%" : "100%"}
                />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div style={{
            padding: theme.spacing.lg,
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border.subtle}`,
        }}>
            <Skeleton height="24px" width="60%" style={{ marginBottom: theme.spacing.md }} />
            <SkeletonText lines={2} />
        </div>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

// Add keyframes to global styles
if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = `
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
    document.head.appendChild(style);
}
