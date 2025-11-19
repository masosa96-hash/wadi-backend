import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { theme } from "../styles/theme";
import type { Tag } from "../store/tagsStore";
import { chipVariants, chipTransition } from "../utils/animations";

interface TagChipProps {
  tag: Tag;
  size?: "small" | "medium";
  onRemove?: () => void;
  onClick?: () => void;
}

export default function TagChip({ 
  tag, 
  size = "small",
  onRemove,
  onClick,
}: TagChipProps) {
  const height = size === "small" ? "20px" : "24px";
  const fontSize = size === "small" ? theme.typography.fontSize.caption : theme.typography.fontSize.bodySmall;
  
  const chipStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    height,
    padding: `2px ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.small,
    background: `${tag.color}20`,
    border: `1px solid ${tag.color}`,
    color: theme.colors.text.primary,
    fontSize,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily.primary,
    cursor: onClick ? "pointer" : "default",
    transition: theme.transitions.fast,
    whiteSpace: "nowrap",
  };

  const removeButtonStyle: CSSProperties = {
    background: "transparent",
    border: "none",
    color: tag.color,
    cursor: "pointer",
    padding: 0,
    marginLeft: "2px",
    fontSize: size === "small" ? "12px" : "14px",
    lineHeight: 1,
    transition: theme.transitions.fast,
  };

  const handleClick = () => {
    if (onClick && !onRemove) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <motion.span 
      style={chipStyle}
      onClick={handleClick}
      variants={chipVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={chipTransition}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = `${tag.color}30`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${tag.color}20`;
      }}
    >
      <span>{tag.name}</span>
      {onRemove && (
        <button
          onClick={handleRemove}
          style={removeButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          title="Remove tag"
        >
          ×
        </button>
      )}
    </motion.span>
  );
}
