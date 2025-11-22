// WADI Theme - AI Professional Design System

export const theme = {
  colors: {
    background: {
      primary: '#09090B', // Deep matte black
      secondary: '#18181B', // Zinc 900
      tertiary: '#27272A', // Zinc 800
      overlay: 'rgba(0, 0, 0, 0.7)',
      mobile: '#09090B',
      surface: '#121214', // Slightly lighter for cards
    },
    border: {
      subtle: '#27272A',
      default: '#3F3F46',
      light: '#52525B',
      accent: '#71717A',
      hover: '#A1A1AA',
      active: '#E4E4E7',
    },
    text: {
      primary: '#FAFAFA', // Zinc 50
      secondary: '#A1A1AA', // Zinc 400
      tertiary: '#71717A', // Zinc 500
      inverse: '#09090B',
    },
    accent: {
      primary: '#FAFAFA', // White accent
      secondary: '#A1A1AA',
      highlight: '#3B82F6', // Keep blue for critical actions
      y2k: '#E4E4E7',
    },
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: 'Inter, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      display: '48px', // New display size
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
    sm: '4px', // Sharper corners for matte look
    md: '6px',
    lg: '8px',
    full: '9999px',
    small: '4px',
    medium: '6px',
    large: '8px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    glow: '0 0 20px rgba(255, 255, 255, 0.1)', // Subtle glow
  },

  transitions: {
    default: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    medium: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  layout: {
    sidebarWidth: '260px',
    headerHeight: '64px',
    maxWidth: '1200px',
    maxContentWidth: '1200px',
    mobileMaxWidth: '480px',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #FAFAFA 0%, #A1A1AA 100%)', // Matte white/gray
    hero: 'radial-gradient(circle at center, #27272A 0%, #09090B 100%)', // Deep depth
    subtle: 'linear-gradient(to bottom, #18181B, #09090B)',
    button: '#FAFAFA', // High contrast button
    buttonHover: '#E4E4E7',
    surface: 'linear-gradient(180deg, rgba(39, 39, 42, 0.5) 0%, rgba(24, 24, 27, 0.5) 100%)',
  },

  glass: {
    light: {
      background: 'rgba(24, 24, 27, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(63, 63, 70, 0.4)',
    },
    medium: {
      background: 'rgba(24, 24, 27, 0.8)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(63, 63, 70, 0.5)',
    },
    heavy: {
      background: '#18181B',
      border: '1px solid #3F3F46',
    },
    accent: {
      background: 'rgba(39, 39, 42, 0.5)',
      border: '1px solid rgba(82, 82, 91, 0.5)',
    },
  },
  glassHover: {
    light: { background: 'rgba(39, 39, 42, 0.6)' },
    medium: { background: 'rgba(39, 39, 42, 0.8)' },
    accent: { background: 'rgba(63, 63, 70, 0.5)' },
  }
} as const;

export type Theme = typeof theme;
