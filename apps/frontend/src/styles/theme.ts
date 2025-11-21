// WADI Theme - AI Professional Design System

export const theme = {
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
      tertiary: '#F4F4F5',
      overlay: 'rgba(0, 0, 0, 0.4)',
      mobile: '#FFFFFF',
    },
    border: {
      subtle: '#E4E4E7',
      default: '#D4D4D8',
      light: '#E4E4E7',
      accent: '#D4D4D8',
      hover: '#A1A1AA',
      active: '#18181B',
    },
    text: {
      primary: '#18181B',
      secondary: '#71717A',
      tertiary: '#A1A1AA',
      inverse: '#FFFFFF',
    },
    accent: {
      primary: '#18181B',
      secondary: '#52525B',
      highlight: '#3B82F6',
      y2k: '#A1A1AA',
    },
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: 'Inter, sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      caption: '12px',
      bodySmall: '13px',
      body: '14px',
      bodyLarge: '16px',
      h3: '20px',
      h2: '24px',
      h1: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
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
    small: '6px',
    medium: '8px',
    large: '12px',
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
    fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    medium: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  layout: {
    sidebarWidth: '260px',
    headerHeight: '56px',
    maxWidth: '1200px',
    maxContentWidth: '1200px',
    mobileMaxWidth: '480px',
  },

  gradients: {
    primary: '#18181B',
    hero: '#FAFAFA',
    subtle: '#FFFFFF',
    button: '#18181B',
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
