/**
 * Theme Tokens
 * Centralized system for color, typography, and spacing tokens
 */

// ============================================
// COLOR TOKENS
// ============================================

export const colors = {
  // Semantic colors (primary actions and states)
  primary: {
    DEFAULT: 'hsl(222 84% 58%)',
    foreground: 'hsl(220 15% 92%)',
    background: 'hsl(222 84% 58%)',
    hover: 'hsl(222 84% 52%)',
    active: 'hsl(222 84% 46%)',
    subtle: 'hsl(222 84% 58% / 0.1)',
    glow: 'hsl(222 84% 58% / 0.2)',
  },

  // Success states
  success: {
    DEFAULT: 'hsl(222 84% 58%)',
    foreground: 'hsl(220 15% 92%)',
    background: 'hsl(222 84% 58% / 0.1)',
    border: 'hsl(222 84% 58% / 0.2)',
    bg: 'hsl(222 84% 58% / 0.1)',
    text: 'hsl(222 84% 58%)',
  },

  // Error states
  error: {
    DEFAULT: 'hsl(0 84% 60%)',
    foreground: 'hsl(0 15% 92%)',
    background: 'hsl(0 84% 60% / 0.1)',
    border: 'hsl(0 84% 60% / 0.16)',
    bg: 'hsl(0 84% 60% / 0.1)',
    text: 'hsl(0 84% 60%)',
  },

  // Warning states
  warning: {
    DEFAULT: 'hsl(35 60% 50%)',
    foreground: 'hsl(35 15% 8%)',
    background: 'hsl(35 60% 50% / 0.1)',
    border: 'hsl(35 60% 50% / 0.16)',
    bg: 'hsl(35 60% 50% / 0.1)',
    text: 'hsl(35 60% 50%)',
  },

  // Info states
  info: {
    DEFAULT: 'hsl(220 68% 66%)',
    foreground: 'hsl(220 15% 8%)',
    background: 'hsl(220 68% 66% / 0.1)',
    border: 'hsl(220 68% 66% / 0.18)',
    bg: 'hsl(220 68% 66% / 0.1)',
    text: 'hsl(220 68% 66%)',
  },

  // Background colors
  background: {
    DEFAULT: 'hsl(240 8% 1.5%)',
    card: 'hsl(240 6% 4.5%)',
    elevated: 'hsl(240 6% 3%)',
    modal: 'hsl(240 4% 10%)',
    overlay: 'hsl(240 5% 8%)',
  },

  // Foreground colors
  foreground: {
    DEFAULT: 'hsl(220 15% 92%)',
    secondary: 'hsl(220 10% 65%)',
    tertiary: 'hsl(220 10% 50%)',
    muted: 'hsl(220 10% 40%)',
    disabled: 'hsl(220 8% 28%)',
  },

  // Border colors
  border: {
    DEFAULT: 'hsl(220 18% 18%)',
    subtle: 'hsl(220 15% 14%)',
    strong: 'hsl(220 20% 22%)',
    focus: 'hsl(222 84% 58%)',
    success: 'hsl(222 84% 58% / 0.2)',
    error: 'hsl(0 84% 60% / 0.2)',
  },

  // Chart colors
  chart: {
    positive: 'hsl(222 84% 58%)',
    negative: 'hsl(0 84% 60%)',
    neutral: 'hsl(220 10% 50%)',
    c1: 'hsl(221 84% 58%)',
    c2: 'hsl(194 64% 63%)',
    c3: 'hsl(111 72% 78%)',
    c4: 'hsl(170 60% 56%)',
    c5: 'hsl(29 80% 56%)',
  },
} as const

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

export const typography = {
  // Heading sizes
  heading: {
    xs: {
      base: 'text-sm sm:text-base',
      small: 'sm:text-sm',
      medium: 'sm:text-base',
    },
    sm: {
      base: 'text-base sm:text-lg',
      small: 'sm:text-base',
      medium: 'sm:text-lg',
    },
    md: {
      base: 'text-lg sm:text-xl',
      small: 'sm:text-lg',
      medium: 'sm:text-xl',
    },
    lg: {
      base: 'text-xl sm:text-2xl',
      small: 'sm:text-xl',
      medium: 'sm:text-2xl',
    },
    xl: {
      base: 'text-2xl sm:text-3xl',
      small: 'sm:text-2xl',
      medium: 'sm:text-3xl',
    },
    '2xl': {
      base: 'text-2xl sm:text-4xl',
      small: 'sm:text-2xl',
      medium: 'sm:text-3xl',
    },
    '2xl-large': {
      base: 'text-3xl sm:text-5xl',
      small: 'sm:text-3xl',
      medium: 'sm:text-5xl',
    },
  },

  // Body text sizes
  body: {
    xs: 'text-xs sm:text-[0.75rem]',
    sm: 'text-sm sm:text-[0.875rem]',
    base: 'text-base sm:text-sm',
    lg: 'text-lg sm:text-base',
  },

  // Font weights
  fontWeight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },

  // Line heights
  lineHeight: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  },

  // Letter spacing
  tracking: {
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
  },
} as const

// ============================================
// SPACING TOKENS
// ============================================

export const spacing = {
  // Base scale (1 unit = 0.25rem = 4px)
  '1': '0.25rem',   // 4px
  '2': '0.5rem',    // 8px
  '3': '0.75rem',   // 12px
  '4': '1rem',      // 16px
  '5': '1.25rem',   // 20px
  '6': '1.5rem',    // 24px
  '7': '1.75rem',   // 28px
  '8': '2rem',      // 32px
  '9': '2.25rem',   // 36px
  '10': '2.5rem',   // 40px
  '12': '3rem',     // 48px
  '14': '3.5rem',   // 56px
  '16': '4rem',     // 64px
  '20': '5rem',     // 80px
  '24': '6rem',     // 96px
  '32': '8rem',     // 128px
} as const

// ============================================
// BORDER RADIUS TOKENS
// ============================================

export const borderRadius = {
  'none': '0',
  'sm': '0.125rem',   // 2px
  'DEFAULT': '0.25rem', // 4px
  'md': '0.375rem',  // 6px
  'lg': '0.5rem',    // 8px
  'xl': '0.75rem',   // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  '4xl': '2rem',     // 32px
  'full': '9999px',
} as const

// ============================================
// SHADOW TOKENS
// ============================================

export const shadow = {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

// ============================================
// TRANSITION TOKENS
// ============================================

export const transition = {
  'DEFAULT': 'all 0.15s ease-in-out',
  'fast': 'all 0.1s ease-in-out',
  'normal': 'all 0.2s ease-in-out',
  'slow': 'all 0.3s ease-in-out',
  'instant': 'all 0s',
} as const

// ============================================
// Z-INDEX TOKENS
// ============================================

export const zIndex = {
  'base': 0,
  'dropdown': 1000,
  'sticky': 1100,
  'sidebar': 1200,
  'overlay': 1300,
  'modal': 1400,
  'popover': 1500,
  'tooltip': 1600,
  'toast': 1700,
  'max': 9999,
} as const
