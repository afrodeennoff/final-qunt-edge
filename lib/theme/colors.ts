/**
 * TypeScript color palette — mirrors CSS custom properties in globals.css.
 *
 * For styling, prefer CSS variables (--primary, --success, etc.) or Tailwind
 * theme tokens (text-primary, bg-success). This file is for programmatic use
 * in chart rendering, canvas drawing, and other JS contexts.
 */

// ── Purple Accent Palette (Primary Brand) ──

export const accent = {
  50:  '#f8f6ff',
  100: '#f0ebff',
  200: '#ddd5ff',
  300: '#c5b0ff',
  400: '#a885ff',
  500: '#8b5cf6', // Primary purple — matches --primary in :root
  600: '#7744dd',
  700: '#5a2fa8',
  800: '#3d1f70',
  900: '#261047',
} as const

// ── Background Hierarchy (Dark Theme) ──

export const darkBackgrounds = {
  primary:   '#090911', // --background (:root)
  secondary: '#0e0c1c', // --card
  tertiary:  '#110f1f', // --popover
  sidebar:   '#0c0a18', // --sidebar
  toolbar:   '#0e0c1c', // --surface-toolbar
  content:   '#0a0818', // --surface-content
  panel:     '#110f22', // --surface-panel
  elevated:  '#161330', // --surface-elevated
  sheet:     '#1a1636', // --surface-sheet
} as const

// ── Background Hierarchy (Light Theme) ──

export const lightBackgrounds = {
  primary:   '#F2F2F7',
  secondary: '#FFFFFF',
  tertiary:  '#F5F5F7',
  sidebar:   'rgba(246,246,248,0.82)',
} as const

// ── Surface Tokens ──

export const surface = {
  default: '#1a1a22',
  hover:   '#252530',
  active:  '#2f2f3a',
} as const

// ── Text Hierarchy ──

export const darkText = {
  primary:   '#f2f0f8', // --foreground
  secondary: '#c4b8e8', // --secondary-foreground
  tertiary:  '#8b82a8', // --muted-foreground
  disabled:  '#6a6288',
  inverse:   '#090911',
} as const

export const lightText = {
  primary:   '#1D1D1F',
  secondary: '#6E6E73',
  tertiary:  '#AEAEB2',
  disabled:  '#C7C7CC',
  inverse:   '#FFFFFF',
} as const

// ── Border Scale ──

export const darkBorders = {
  default: '#1e1a30',
  subtle:  '#1a1628',
  strong:  '#2a2540',
  focus:   '#7c3aed', // --ring
} as const

export const lightBorders = {
  default: 'rgba(0,0,0,0.13)',
  subtle:  'rgba(0,0,0,0.08)',
  strong:  'rgba(0,0,0,0.18)',
  focus:   '#007AFF',
} as const

// ── Frost Border Scale (Purple-tinted) ──

export const frostBorders = {
  1: 'rgba(139,92,246,0.04)',
  2: 'rgba(139,92,246,0.07)',
  3: 'rgba(139,92,246,0.10)',
  4: 'rgba(139,92,246,0.14)',
  5: 'rgba(139,92,246,0.20)',
  6: 'rgba(0,0,0,0.28)',
} as const

// ── Semantic Colors ──

export const status = {
  success: '#22c55e',
  warning: '#f59e0b',
  error:   '#dc2626',
  info:    '#3b82f6',
} as const

// ── Trading-Specific Semantic ──

export const trading = {
  positive: '#22c55e', // --profit
  negative: '#dc2626', // --loss
  neutral:  '#8b82a8', // --muted-foreground
  info:     '#3b82f6', // --info
} as const

export const tradingBg = {
  positive: 'rgba(34,197,94,0.12)',
  negative: 'rgba(220,38,38,0.12)',
  info:     'rgba(59,130,246,0.12)',
} as const

// ── Marketing Page Tokens ──

export const marketing = {
  bg: {
    base:     '#09090B',
    surface:  '#111113',
    elevated: '#18181B',
    overlay:  '#27272A',
  },
  text: {
    primary:   '#FAFAFA',
    secondary: '#A1A1AA',
    tertiary:  '#71717A',
  },
  accent: {
    primary: '#8B5CF6',
    hover:   '#7C3AED',
    active:  '#6D28D9',
    subtle:  'rgba(139,92,246,0.12)',
    border:  'rgba(139,92,246,0.30)',
  },
} as const

// ── V2 Design System (OKLCH) ──
// These match the --v2-* CSS custom properties for dark theme

export const v2Dark = {
  bgBase:     'oklch(0.043 0.007 297)',
  bgElevated: 'oklch(0.056 0.01 297)',
  accent:     'oklch(0.4865 0.2423 291.8661)',
  accentHover:'oklch(0.6192 0.2037 312.7283)',
  textPrimary:'oklch(0.9 0.01 297)',
} as const

// ── P3 Wide Gamut Accents ──

export const p3Accents = {
  aurora:   'color(display-p3 0.45 0.25 0.95)',
  plasma:   'color(display-p3 0.95 0.30 0.55)',
  sapphire: 'color(display-p3 0.20 0.45 0.98)',
  gold:     'color(display-p3 0.95 0.72 0.18)',
} as const

// ── Chart Palette ──

export const chartPalette = {
  1: '#8b5cf6', // Purple
  2: '#22c55e', // Green
  3: '#dc2626', // Red
  4: '#f59e0b', // Amber
  5: '#3b82f6', // Blue
  6: '#0e7490', // Teal
  7: '#6c3483', // Deep purple
  8: '#8b82a8', // Muted
} as const

// ── Utility Functions ──

export function accentWithOpacity(level: keyof typeof frostBorders): string {
  return frostBorders[level]
}

export function tradingColor(value: number | null): string {
  if (value === null || value === 0) return trading.neutral
  return value > 0 ? trading.positive : trading.negative
}

export function tradingBgColor(value: number | null): string {
  if (value === null || value === 0) return 'transparent'
  return value > 0 ? tradingBg.positive : tradingBg.negative
}
