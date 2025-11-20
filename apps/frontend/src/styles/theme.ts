/**
 * WADI Design System - Y2K Banking Light Theme
 * Centralized design tokens for fintech-inspired UI with subtle Y2K nostalgia
 */

export const theme = {
  // Color Palette - Banking Light Theme with Y2K touches
  colors: {
    // Base Colors (Light Theme)
    background: {
      primary: '#F3F6FB',     // Main background - soft bluish white
      secondary: '#FFFFFF',   // Card backgrounds - pure white
      tertiary: '#E8EEF7',    // Elevated elements, input fields
      mobile: '#FAFBFD',      // Mobile container background
    },
    
    // Borders
    border: {
      subtle: '#D6E1F2',      // Default borders - soft blue-gray
      accent: '#C5D4EB',      // Hover borders
      light: '#E8EEF7',       // Very light borders
    },
    
    // Text Colors
    text: {
      primary: '#0F172A',     // Main text - deep blue-black
      secondary: '#6B7280',   // Secondary text - medium gray
      tertiary: '#9CA3AF',    // Metadata, timestamps - light gray
    },
    
    // Accent Colors - Y2K Blue gradient
    accent: {
      primary: '#255FF5',     // Royal blue - primary actions
      secondary: '#7B8CFF',   // Light purple-blue
      y2k: '#C5B3FF',         // Lavender - Y2K accent
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
  
  // Shadows - Soft, banking-style depth
  shadows: {
    subtle: '0 1px 3px rgba(15, 23, 42, 0.08)',
    medium: '0 4px 12px rgba(15, 23, 42, 0.1)',
    strong: '0 8px 24px rgba(15, 23, 42, 0.12)',
    glow: '0 0 24px rgba(37, 95, 245, 0.15)',          // Blue glow
    y2kGlow: '0 0 32px rgba(197, 179, 255, 0.25)',     // Y2K lavender glow
    card: '0 2px 8px rgba(15, 23, 42, 0.06)',
    mobileFrame: '0 8px 40px rgba(15, 23, 42, 0.1)',   // Desktop "phone" shadow
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
    mobileMaxWidth: '480px',      // Max width for mobile container on desktop
    mobileMaxWidthLarge: '600px', // Larger mobile container option
  },
  
  // Gradients - Y2K Banking Style
  gradients: {
    primary: 'linear-gradient(135deg, #255FF5 0%, #7B8CFF 50%, #C5B3FF 100%)',  // Blue → Purple-blue → Lavender
    hero: 'linear-gradient(135deg, #255FF5 0%, #7B8CFF 100%)',                  // Hero card gradient
    subtle: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFD 100%)',                 // Subtle card gradient
    button: 'linear-gradient(135deg, #255FF5 0%, #4A7BF7 100%)',                 // Button gradient
    y2kAccent: 'linear-gradient(135deg, #7B8CFF 0%, #C5B3FF 100%)',             // Y2K accent gradient
  },
  
  // Glass Morphism Effects - Light theme with soft blur
  glass: {
    // Light glass effect (for primary surfaces)
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(214, 225, 242, 0.5)',
      boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
    },
    
    // Medium glass effect (for cards, modals)
    medium: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(214, 225, 242, 0.6)',
      boxShadow: '0 12px 48px rgba(15, 23, 42, 0.1)',
    },
    
    // Heavy glass effect (for overlays, modals)
    heavy: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(24px) saturate(200%)',
      border: '1px solid rgba(214, 225, 242, 0.8)',
      boxShadow: '0 16px 64px rgba(15, 23, 42, 0.12)',
    },
    
    // Accent glass (with blue tint)
    accent: {
      background: 'rgba(37, 95, 245, 0.06)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(37, 95, 245, 0.15)',
      boxShadow: '0 8px 32px rgba(37, 95, 245, 0.1)',
    },
    
    // Y2K accent glass (lavender tint)
    y2k: {
      background: 'rgba(197, 179, 255, 0.08)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(197, 179, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(197, 179, 255, 0.15)',
    },
  },
  
  // Hover states for glass elements
  glassHover: {
    light: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: '1px solid rgba(214, 225, 242, 0.7)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(214, 225, 242, 0.8)',
    },
    accent: {
      background: 'rgba(37, 95, 245, 0.1)',
      border: '1px solid rgba(37, 95, 245, 0.25)',
    },
  },
} as const;

export type Theme = typeof theme;
