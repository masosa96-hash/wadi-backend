import { motion } from "framer-motion";
import { theme } from "../styles/theme";

interface FileAttachmentProps {
  file: {
    id: string;
    original_filename: string;
    file_type: string;
    file_size: number;
    processing_status: "pending" | "processing" | "completed" | "failed";
    summary?: string;
  };
  onView?: () => void;
  onAsk?: () => void;
  compact?: boolean;
}

export default function FileAttachment({ 
  file, 
  onView, 
  onAsk,
  compact = false 
}: FileAttachmentProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "image":
        return "🖼️";
      case "docx":
        return "📝";
      case "text":
        return "📃";
      default:
        return "📎";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "En cola", color: theme.colors.text.tertiary };
      case "processing":
        return { text: "Procesando...", color: theme.colors.accent.primary };
      case "completed":
        return { text: "Listo", color: "#10B981" };
      case "failed":
        return { text: "Error", color: theme.colors.error };
      default:
        return { text: status, color: theme.colors.text.tertiary };
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusBadge = getStatusBadge(file.processing_status);

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: theme.spacing.xs,
          background: "rgba(37, 95, 245, 0.1)",
          borderRadius: "8px",
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.bodySmall,
          color: theme.colors.text.primary,
          cursor: onView ? "pointer" : "default",
        }}
        onClick={onView}
      >
        <span style={{ fontSize: "16px" }}>{getFileIcon(file.file_type)}</span>
        <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
          {file.original_filename}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-surface"
      style={{
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.md,
        marginTop: theme.spacing.sm,
        border: `1px solid ${theme.colors.border.light}`,
      }}
    >
      <div style={{ display: "flex", gap: theme.spacing.md, alignItems: "flex-start" }}>
        {/* File Icon */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "rgba(37, 95, 245, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            flexShrink: 0,
          }}
        >
          {getFileIcon(file.file_type)}
        </div>

        {/* File Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.xs,
              marginBottom: theme.spacing.xs,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize.body,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.original_filename}
            </div>
            
            <div
              style={{
                fontSize: theme.typography.fontSize.caption,
                color: statusBadge.color,
                background: `${statusBadge.color}20`,
                padding: `2px ${theme.spacing.xs}`,
                borderRadius: "4px",
                fontWeight: theme.typography.fontWeight.medium,
                flexShrink: 0,
              }}
            >
              {statusBadge.text}
            </div>
          </div>

          <div
            style={{
              fontSize: theme.typography.fontSize.bodySmall,
              color: theme.colors.text.tertiary,
              marginBottom: file.summary ? theme.spacing.sm : 0,
            }}
          >
            {formatFileSize(file.file_size)}
          </div>

          {/* Summary */}
          {file.summary && file.processing_status === "completed" && (
            <div
              style={{
                fontSize: theme.typography.fontSize.bodySmall,
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.sm,
                padding: theme.spacing.sm,
                background: "rgba(37, 95, 245, 0.05)",
                borderRadius: "6px",
                borderLeft: `3px solid ${theme.colors.accent.primary}`,
              }}
            >
              <div style={{ fontWeight: theme.typography.fontWeight.semibold, marginBottom: "4px" }}>
                Resumen:
              </div>
              {file.summary}
            </div>
          )}

          {/* Actions */}
          {file.processing_status === "completed" && (
            <div style={{ display: "flex", gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
              {onView && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onView}
                  style={{
                    background: "transparent",
                    border: `1px solid ${theme.colors.border.light}`,
                    borderRadius: "6px",
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    fontSize: theme.typography.fontSize.bodySmall,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.secondary,
                    cursor: "pointer",
                  }}
                >
                  Ver archivo
                </motion.button>
              )}
              
              {onAsk && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAsk}
                  style={{
                    background: theme.gradients.button,
                    border: "none",
                    borderRadius: "6px",
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    fontSize: theme.typography.fontSize.bodySmall,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  Preguntarle a WADI
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
