/**
 * WADI Design System - AI Professional Theme
 * Minimalist, clean, and high-performance aesthetic.
 */

export const theme = {
  colors: {
    background: {
      primary: '#FFFFFF',     // Pure white
      secondary: '#FAFAFA',   // Very light gray for sidebars/panels
      tertiary: '#F4F4F5',    // Inputs, hover states
      overlay: 'rgba(0, 0, 0, 0.4)',
    },

    border: {
      subtle: '#E4E4E7',      // Zinc-200
      default: '#D4D4D8',     // Zinc-300
      hover: '#A1A1AA',       // Zinc-400
      active: '#18181B',      // Zinc-900
    },

    text: {
      primary: '#18181B',     // Zinc-900
      secondary: '#71717A',   // Zinc-500
      tertiary: '#A1A1AA',    // Zinc-400
      inverse: '#FFFFFF',
    },

    accent: {
      primary: '#18181B',     // Black (Monochrome primary)
      secondary: '#52525B',   // Zinc-600
      highlight: '#3B82F6',   // Blue-500 (Subtle functional accent)
    },

    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },

  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  transitions: {
    default: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  layout: {
    sidebarWidth: '260px',
    headerHeight: '56px',
    maxWidth: '1200px',
  },

  // Compatibility Layer for Legacy Components
  gradients: {
    primary: '#18181B', // Flat black for "primary"
    hero: '#FAFAFA',    // Light gray for hero
    subtle: '#FFFFFF',
    button: '#18181B',  // Black button
    y2kAccent: '#52525B',
  },

  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #E4E4E7',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(16px)',
      border: '1px solid #E4E4E7',
    },
    heavy: {
      background: '#FFFFFF',
      border: '1px solid #E4E4E7',
    },
    accent: {
      background: '#F4F4F5',
      border: '1px solid #E4E4E7',
    },
    y2k: {
      background: '#FAFAFA',
      border: '1px solid #E4E4E7',
    },
  },
  glassHover: {
    light: { background: '#FAFAFA' },
    medium: { background: '#FAFAFA' },
    accent: { background: '#E4E4E7' },
  }
} as const;

export type Theme = typeof theme;
