/**
 * Centralized animation variants for consistent motion design
 */

// Page transitions
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // Custom easing
};

// Modal animations
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalTransition = {
  duration: 0.2,
  ease: "easeOut" as const,
};

// List item animations (for runs, sessions, projects)
export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut" as const,
    },
  }),
  exit: { opacity: 0, x: 20 },
};

// Hover animations for interactive elements
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15 },
};

export const hoverGlow = {
  whileHover: { boxShadow: "0 0 20px rgba(100, 100, 255, 0.3)" },
  transition: { duration: 0.2 },
};

// Button animations
export const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export const buttonTransition = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

// Collapse/expand animations
export const collapseVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
};

export const collapseTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
};

// Tag chip animations
export const chipVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
};

export const chipTransition = {
  duration: 0.2,
  ease: "backOut" as const,
};

// Loading spinner animations
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

// Stagger children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Fade in/out
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeTransition = {
  duration: 0.2,
};

// Slide in from direction
export const slideInVariants = (direction: "left" | "right" | "top" | "bottom") => {
  const offset = 30;
  const coords = {
    left: { x: -offset, y: 0 },
    right: { x: offset, y: 0 },
    top: { x: 0, y: -offset },
    bottom: { x: 0, y: offset },
  };

  return {
    hidden: { opacity: 0, ...coords[direction] },
    visible: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...coords[direction] },
  };
};

// Error shake animation
export const shakeVariants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

// Success pulse animation
export const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
      repeat: 1,
    },
  },
};
