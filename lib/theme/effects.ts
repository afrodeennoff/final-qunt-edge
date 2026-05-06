/**
 * TypeScript effect tokens — shadows, glass, motion, radius.
 * Mirrors the macOS-native design system in globals.css.
 */

// ── Shadow System (macOS Layered Depth) ──

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
} as const

export const ultraShadows = {
  sm: '0 1px 3px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.20), 0 0 0 0.5px rgba(180,210,255,0.05)',
  md: '0 2px 4px rgba(0,0,0,0.30), 0 8px 20px rgba(0,0,0,0.28), 0 24px 48px rgba(0,0,0,0.16), 0 0 0 0.5px rgba(180,210,255,0.06)',
  lg: '0 4px 8px rgba(0,0,0,0.25), 0 12px 28px rgba(0,0,0,0.30), 0 32px 64px rgba(0,0,0,0.22), 0 80px 140px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(180,210,255,0.07)',
  xl: '0 8px 16px rgba(0,0,0,0.22), 0 20px 40px rgba(0,0,0,0.28), 0 48px 96px rgba(0,0,0,0.26), 0 96px 192px rgba(0,0,0,0.18), 0 0 0 1px rgba(180,210,255,0.08)',
} as const

// macOS-specific shadows
export const macosShadows = {
  toolbar:  '0 1px 0 rgba(139,92,246,0.07)',
  panel:    'inset 0 1px 0 rgba(139,92,246,0.07), 0 20px 40px -28px rgba(0,0,0,0.72)',
  widget:   'inset 0 1px 0 rgba(139,92,246,0.06), 0 18px 36px -24px rgba(0,0,0,0.64)',
  modal:    'inset 0 1px 0 rgba(139,92,246,0.08), 0 32px 64px -24px rgba(0,0,0,0.82)',
  dropdown: '0 8px 24px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.10)',
} as const

// Premium layered shadows
export const premiumShadows = {
  sm: '0 1px 2px oklch(0 0 0 / 0.4), 0 2px 4px -1px oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.05)',
  md: '0 2px 4px oklch(0 0 0 / 0.5), 0 4px 8px -2px oklch(0 0 0 / 0.4), 0 8px 16px -4px oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.06)',
  lg: '0 4px 8px oklch(0 0 0 / 0.6), 0 8px 16px -3px oklch(0 0 0 / 0.5), 0 16px 32px -6px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.07)',
  xl: '0 8px 16px oklch(0 0 0 / 0.7), 0 16px 32px -4px oklch(0 0 0 / 0.6), 0 24px 48px -8px oklch(0 0 0 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.08)',
} as const

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

// ── Glass Morphism ──

export const glass = {
  surface: {
    bg:     'oklch(0.07 0 0 / 0.6)',
    border: 'oklch(0.14 0 0 / 0.4)',
  },
  card: {
    bg:     'oklch(0.09 0 0 / 0.7)',
    border: 'oklch(0.14 0 0 / 0.5)',
    shadow: 'inset 0 1px 0 oklch(1 0 0 / 0.05), 0 8px 32px -8px oklch(0 0 0 / 0.4)',
  },
  panel: {
    bg:     'oklch(0.06 0 0 / 0.65)',
    border: 'oklch(0.14 0 0 / 0.35)',
  },
  header: {
    bg:     'oklch(0.05 0 0 / 0.8)',
    border: 'oklch(0.14 0 0 / 0.3)',
  },
} as const

// ── Glow Effects ──

export const glow = {
  ambient:  '0 18px 60px -26px rgba(139,92,246,0.2)',
  accent:   '0 20px 90px -30px rgba(139,92,246,0.26)',
  success:  '0 16px 60px -28px rgba(34,197,94,0.28)',
  error:    '0 16px 60px -28px rgba(220,38,38,0.28)',
  premium:  '0 0 24px oklch(0.6083 0.2172 297.1153 / 0.18), 0 0 48px oklch(0.6083 0.2172 297.1153 / 0.10), 0 0 96px oklch(0.6083 0.2172 297.1153 / 0.05)',
} as const

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

// ── Gradient Tokens ──

export const gradients = {
  aurora:   'linear-gradient(135deg, color(display-p3 0.45 0.25 0.95) 0%, color(display-p3 0.20 0.45 0.98) 50%, color(display-p3 0.18 0.98 0.65) 100%)',
  plasma:   'linear-gradient(135deg, color(display-p3 0.95 0.30 0.55) 0%, color(display-p3 0.45 0.25 0.95) 100%)',
  luxe:     'linear-gradient(135deg, color(display-p3 0.45 0.25 0.95 / 0.8) 0%, color(display-p3 0.95 0.72 0.18 / 0.6) 100%)',
  bluePurple:'linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(112,69,232,1) 100%)',
  blueCyan: 'linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(96,133,232,1) 100%)',
} as const

// ── Frost Surface Effects ──

export const frostEffects = {
  surface: {
    bg:     'rgba(145, 108, 255, 0.05)',
    border: 'rgba(145, 108, 255, 0.12)',
  },
  shadow: {
    card:   '0 16px 32px -26px rgba(0,0,0,0.62)',
    cardLg: '0 24px 48px -32px rgba(0,0,0,0.75)',
  },
} as const
