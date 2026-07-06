/**
 * TypeScript effect tokens — shadows, motion, radius.
 * Mirrors the macOS-native design system in globals.css.
 */

// ── Shadow System ──

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 2px 8px rgba(0,0,0,0.08)',
  lg: '0 4px 16px rgba(0,0,0,0.1)',
} as const

/** @deprecated Use `shadows` instead — heavy shadows removed per spec */
export const ultraShadows = shadows

/** @deprecated Use `shadows` instead — macOS-specific shadows removed per spec */
export const macosShadows = shadows

/** @deprecated Use `shadows` instead — premium layered shadows removed per spec */
export const premiumShadows = shadows

// ── Border Radius Scale ──

export const radius = {
  none: '0',
  sm:   '0.375rem',   // 6px
  md:   '0.5rem',     // 8px
  lg:   '0.75rem',    // 12px
} as const

// ── Blur Presets (macOS) ──

export const blur = {
  default:     'blur(40px) saturate(180%)',
  heavy:       'blur(60px) saturate(200%)',
  sidebar:     'blur(48px) saturate(170%)',
  toolbar:     'blur(20px) saturate(150%)',
} as const

// ── Glass Morphism (stub — kept for import compatibility) ──

/** @deprecated Frost/glass effects removed per spec */
export const glass = {} as const

// ── Glow Effects (stub — kept for import compatibility) ──

/** @deprecated Glow effects removed per spec */
export const glow = {} as const

// ── Motion / Transition Tokens ──

export const duration = {
  instant: '75ms',
  fast:    '130ms',
  base:    '200ms',
  slow:    '320ms',
} as const

export const easing = {
  default:   'cubic-bezier(0.4, 0, 0.2, 1)',
  spring:    'cubic-bezier(0.22, 1, 0.36, 1)',
  entrance:  'cubic-bezier(0.16, 1, 0.3, 1)',
  exit:      'cubic-bezier(0, 0, 0.2, 1)',
  enter:     'cubic-bezier(0.4, 0, 1, 1)',
  leave:     'cubic-bezier(0, 0, 0.2, 1)',
  macos:     'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  macosSpring:'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
  macosSheet:'cubic-bezier(0.32, 0.72, 0, 1)',
} as const

// ── Gradient Tokens (stub — kept for import compatibility) ──

/** @deprecated Animated/mesh gradients removed per spec */
export const gradients = {} as const

// ── Frost Surface Effects (stub — kept for import compatibility) ──

/** @deprecated Frost effects removed per spec */
export const frostEffects = {} as const
