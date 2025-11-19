/**
 * WADI Design System - Theme Configuration
 * Centralized design tokens for consistent UI/UX
 */

export const theme = {
  // Color Palette
  colors: {
    // Base Colors (Dark Theme)
    background: {
      primary: '#0A0E14',     // Deepest background
      secondary: '#13171F',   // Card backgrounds
      tertiary: '#1A1F2B',    // Input fields, elevated elements
    },
    
    // Borders
    border: {
      subtle: '#252933',      // Default borders
      accent: '#2D3340',      // Hover borders
    },
    
    // Text Colors
    text: {
      primary: '#E6E8EC',     // Main text, highest contrast
      secondary: '#9BA3B4',   // Secondary text, descriptions
      tertiary: '#6B7280',    // Metadata, timestamps
    },
    
    // Accent Colors
    accent: {
      primary: '#00D9A3',     // Mint/teal - primary actions, AI messages
      secondary: '#7C3AED',   // Purple - highlights, links
    },
    
    // Semantic Colors
    success: '#10B981',       // Confirmations
    warning: '#F59E0B',       // Alerts
    error: '#EF4444',         // Errors, destructive actions
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    
    fontSize: {
      display: '32px',        // Page titles
      h1: '24px',            // Section titles
      h2: '20px',            // Subsections
      h3: '16px',            // Card titles
      bodyLarge: '15px',     // Main content
      body: '14px',          // Standard text
      bodySmall: '13px',     // Secondary text
      caption: '12px',       // Labels, metadata
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.6,
      relaxed: 1.4,
    },
  },
  
  // Spacing System (4px grid)
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
  
  // Border Radius
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '16px',
  },
  
  // Shadows
  shadows: {
    subtle: '0 1px 3px rgba(0, 0, 0, 0.2)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.3)',
    strong: '0 8px 24px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(0, 217, 163, 0.15)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    medium: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  
  // Layout
  layout: {
    sidebarWidth: '240px',
    maxContentWidth: '1200px',
    headerHeight: '60px',
    inputHeight: '80px',
  },
  
  // Gradients
  gradients: {
    accent: 'linear-gradient(135deg, #00D9A3 0%, #00A67E 100%)',
    cardGlow: 'linear-gradient(135deg, rgba(0, 217, 163, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
  },
  
  // Glass Morphism Effects
  glass: {
    // Light glass effect (for primary surfaces)
    light: {
      background: 'rgba(19, 23, 31, 0.7)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    
    // Medium glass effect (for cards, modals)
    medium: {
      background: 'rgba(19, 23, 31, 0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
    },
    
    // Heavy glass effect (for overlays, modals)
    heavy: {
      background: 'rgba(19, 23, 31, 0.95)',
      backdropFilter: 'blur(24px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 16px 64px rgba(0, 0, 0, 0.5)',
    },
    
    // Accent glass (with color tint)
    accent: {
      background: 'rgba(0, 217, 163, 0.08)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(0, 217, 163, 0.15)',
      boxShadow: '0 8px 32px rgba(0, 217, 163, 0.1)',
    },
    
    // Purple accent glass
    purple: {
      background: 'rgba(124, 58, 237, 0.08)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(124, 58, 237, 0.15)',
      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.1)',
    },
  },
  
  // Hover states for glass elements
  glassHover: {
    light: {
      background: 'rgba(19, 23, 31, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    medium: {
      background: 'rgba(19, 23, 31, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
    },
    accent: {
      background: 'rgba(0, 217, 163, 0.12)',
      border: '1px solid rgba(0, 217, 163, 0.2)',
    },
  },
} as const;

export type Theme = typeof theme;
