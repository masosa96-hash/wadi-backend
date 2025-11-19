import type { CSSProperties } from "react";
import { theme } from "../styles/theme";
import type { Session } from "../store/sessionsStore";

interface SessionHeaderProps {
  session: Session;
  onRename?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
  isActive?: boolean;
}

export default function SessionHeader({
  session,
  onRename,
  onDelete,
  onToggleCollapse,
  isCollapsed = false,
  isActive = false,
}: SessionHeaderProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const containerStyle: CSSProperties = {
    background: theme.colors.background.secondary,
    border: `1px solid ${isActive ? theme.colors.accent.primary : theme.colors.border.subtle}`,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    cursor: "pointer",
    transition: theme.transitions.fast,
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  };

  const titleRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const metadataStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.lg,
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  };

  const badgeStyle: CSSProperties = {
    background: isActive ? theme.colors.accent.primary : theme.colors.background.tertiary,
    color: isActive ? theme.colors.background.primary : theme.colors.text.secondary,
    padding: `2px ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.small,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const actionsStyle: CSSProperties = {
    display: "flex",
    gap: theme.spacing.sm,
  };

  const buttonStyle: CSSProperties = {
    background: "transparent",
    border: "none",
    color: theme.colors.text.secondary,
    cursor: "pointer",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    fontSize: theme.typography.fontSize.body,
    transition: theme.transitions.fast,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const sessionName = session.name || `Session ${new Date(session.created_at).toLocaleDateString()}`;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleRowStyle} onClick={onToggleCollapse}>
          <span style={{ fontSize: "16px", userSelect: "none" }}>
            {isCollapsed ? "▶" : "▼"}
          </span>
          <div style={{ flex: 1 }}>
            <h3 style={titleStyle}>{sessionName}</h3>
            <div style={metadataStyle}>
              <span>{session.run_count} {session.run_count === 1 ? "run" : "runs"}</span>
              <span>•</span>
              <span>Updated {formatDate(session.updated_at)}</span>
              {isActive && <span style={badgeStyle}>Active</span>}
            </div>
          </div>
        </div>

        <div style={actionsStyle}>
          {onRename && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename(session.id);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.accent.primary;
                e.currentTarget.style.background = `${theme.colors.accent.primary}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.text.secondary;
                e.currentTarget.style.background = "transparent";
              }}
              style={buttonStyle}
              title="Rename session"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete session "${sessionName}"? Runs will not be deleted.`)) {
                  onDelete(session.id);
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.error;
                e.currentTarget.style.background = `${theme.colors.error}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.text.secondary;
                e.currentTarget.style.background = "transparent";
              }}
              style={buttonStyle}
              title="Delete session"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {session.description && !isCollapsed && (
        <p style={{
          margin: `${theme.spacing.md} 0 0 0`,
          fontSize: theme.typography.fontSize.bodySmall,
          color: theme.colors.text.secondary,
          lineHeight: theme.typography.lineHeight.normal,
        }}>
          {session.description}
        </p>
      )}
    </div>
  );
}
