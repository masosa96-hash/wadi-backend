import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'es-MX'; // Default to Spanish MX
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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
        marginBottom: theme.spacing.lg,
        maxWidth: '100%',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        position: 'relative',
      }}>
        {/* Message Content */}
        <div style={{
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          borderRadius: isUser
            ? `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 ${theme.borderRadius.lg}`
            : `${theme.borderRadius.lg} ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0`,
          background: isUser
            ? theme.colors.accent.primary
            : theme.colors.background.surface,
          color: isUser
            ? '#FFFFFF'
            : theme.colors.text.primary,
          border: isUser
            ? 'none'
            : `1px solid ${theme.colors.border.subtle}`,
          boxShadow: theme.shadows.sm,
          fontSize: theme.typography.fontSize.body,
          lineHeight: 1.6,
          position: 'relative',
        }}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code {...props} className={className} style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '2px 4px',
                    borderRadius: '4px',
                  }}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>

          {/* TTS Button (Only for AI messages) */}
          {type === 'ai' && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '8px',
              borderTop: `1px solid ${theme.colors.border.subtle}`,
              paddingTop: '8px',
              width: '100%'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isSpeaking ? theme.colors.accent.primary : theme.colors.text.tertiary,
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                <span>{isSpeaking ? '⏹️' : '🔊'}</span>
                <span>{isSpeaking ? 'Detener' : 'Escuchar'}</span>
              </button>
            </div>
          )}
        </div>
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
      </div>

      {/* Tags section */}
      {
        tags.length > 0 && (
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
        )
      }


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
    </motion.div >
  );
}
