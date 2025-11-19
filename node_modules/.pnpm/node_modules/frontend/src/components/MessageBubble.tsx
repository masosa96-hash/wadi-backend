import { useState } from "react";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";
import type { Tag } from "../store/tagsStore";
import TagChip from "./TagChip";
import { fadeVariants } from "../utils/animations";

interface MessageBubbleProps {
  type: "user" | "ai";
  content: string;
  timestamp?: string;
  model?: string;
  customName?: string;
  onRename?: () => void;
  tags?: Tag[];
  onTagRemove?: (tagId: string) => void;
  onTagAdd?: () => void;
  onExport?: () => void;
  runId?: string;
}

export default function MessageBubble({ 
  type, 
  content, 
  timestamp, 
  model, 
  customName, 
  onRename,
  tags = [],
  onTagRemove,
  onTagAdd,
  onExport,
}: MessageBubbleProps) {
  const isUser = type === "user";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: theme.spacing.xl,
      }}
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
        style={{
          maxWidth: isUser ? '65%' : '75%',
          ...(isUser ? theme.glass.light : theme.glass.accent),
          borderRadius: isUser 
            ? '16px 16px 4px 16px' 
            : '16px 16px 16px 4px',
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          color: theme.colors.text.primary,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily.primary,
          lineHeight: theme.typography.lineHeight.normal,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          position: 'relative',
        }}
      >
        {content}
        
        {/* Action buttons (visible on hover) */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              top: theme.spacing.sm,
              right: theme.spacing.sm,
              display: 'flex',
              gap: theme.spacing.xs,
            }}
          >
            {onExport && (
              <button
                onClick={onExport}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: theme.borderRadius.small,
                  padding: '4px 8px',
                  color: theme.colors.text.secondary,
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.caption,
                  transition: theme.transitions.fast,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = theme.colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = theme.colors.text.secondary;
                }}
                title="Export"
              >
                ↓
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
      
      {/* Tags section */}
      {tags.length > 0 && (
        <div style={{
          display: 'flex',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.sm,
          flexWrap: 'wrap',
          maxWidth: isUser ? '65%' : '75%',
        }}>
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              size="small"
              onRemove={onTagRemove ? () => onTagRemove(tag.id) : undefined}
            />
          ))}
          {onTagAdd && (
            <button
              onClick={onTagAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '20px',
                padding: `2px ${theme.spacing.sm}`,
                borderRadius: theme.borderRadius.small,
                background: 'transparent',
                border: `1px dashed ${theme.colors.border.accent}`,
                color: theme.colors.text.tertiary,
                fontSize: theme.typography.fontSize.caption,
                cursor: 'pointer',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.accent.primary;
                e.currentTarget.style.color = theme.colors.accent.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.accent;
                e.currentTarget.style.color = theme.colors.text.tertiary;
              }}
              title="Add tag"
            >
              + Tag
            </button>
          )}
        </div>
      )}
      
      
      <div style={{
        display: 'flex',
        gap: theme.spacing.md,
        marginTop: theme.spacing.sm,
        fontSize: theme.typography.fontSize.caption,
        color: theme.colors.text.tertiary,
        fontFamily: theme.typography.fontFamily.primary,
        alignItems: 'center',
      }}>
        {customName && (
          <>
            <span style={{ color: theme.colors.accent.primary, fontWeight: theme.typography.fontWeight.medium }}>
              {customName}
            </span>
            <span>•</span>
          </>
        )}
        {timestamp && <span>{new Date(timestamp).toLocaleString()}</span>}
        {model && !isUser && (
          <>
            <span>•</span>
            <span>Model: {model}</span>
          </>
        )}
        {onRename && (
          <>
            <span>•</span>
            <button
              onClick={onRename}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.text.tertiary,
                cursor: 'pointer',
                padding: '2px 4px',
                fontSize: theme.typography.fontSize.caption,
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.accent.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.text.tertiary;
              }}
            >
              Rename
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
