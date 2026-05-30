/**
 * TypeScript color palette — mirrors CSS custom properties in globals.css.
 *
 * For styling, prefer CSS variables (--primary, --success, etc.) or Tailwind
 * theme tokens (text-primary, bg-success). This file is for programmatic use
 * in chart rendering, canvas drawing, and other JS contexts.
 */

// ── Neon Green Accent Palette (Default Brand) ──

export const accent = {
  50:  '#e6fff2',
  100: '#b3ffd9',
  200: '#80ffc0',
  300: '#4dffa6',
  400: '#1aff8d',
  500: '#00ff9f', // Primary neon green — matches --primary
  600: '#00cc7a',
  700: '#009955',
  800: '#006630',
  900: '#003318',
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
  focus:   '#00ff9f', // --ring
} as const

export const lightBorders = {
  default: 'rgba(0,0,0,0.13)',
  subtle:  'rgba(0,0,0,0.08)',
  strong:  'rgba(0,0,0,0.18)',
  focus:   '#007AFF',
} as const

// ── Frost Border Scale (Green-tinted) ──

export const frostBorders = {
  1: 'rgba(0,255,159,0.04)',
  2: 'rgba(0,255,159,0.07)',
  3: 'rgba(0,255,159,0.10)',
  4: 'rgba(0,255,159,0.14)',
  5: 'rgba(0,255,159,0.20)',
  6: 'rgba(0,0,0,0.28)',
} as const

// ── Semantic Colors ──

export const status = {
  success: '#0ECB81',
  warning: '#00ff9f',
  error:   '#F6465D',
  info:    '#00ff9f',
} as const

// ── Trading-Specific Semantic (Binance-aligned) ──

export const trading = {
  positive: '#0ECB81', // --profit
  negative: '#F6465D', // --loss
  neutral:  '#888888', // --muted-foreground
  info:     '#00ff9f', // --info (Neon Green)
} as const

export const tradingBg = {
  positive: 'rgba(14,203,129,0.08)',
  negative: 'rgba(246,70,93,0.08)',
  info:     'rgba(0,255,159,0.08)',
} as const

// ── Marketing Page Tokens ──

export const marketing = {
  bg: {
    base:     '#000000',
    surface:  '#000000',
    elevated: '#000000',
    overlay:  '#000000',
  },
  text: {
    primary:   '#FAFAFA',
    secondary: '#A1A1AA',
    tertiary:  '#71717A',
  },
  accent: {
    primary: 'hsl(150, 100%, 50%)',
    hover:   'hsl(150, 100%, 45%)',
    active:  'hsl(150, 100%, 38%)',
    subtle:  'hsla(150, 100%, 50%, 0.08)',
    border:  'hsla(150, 100%, 50%, 0.25)',
  },
} as const

// ── V2 Design System (OKLCH) ──
// These match the --v2-* CSS custom properties for dark theme

export const v2Dark = {
  bgBase:     'oklch(0.043 0.007 150)',
  bgElevated: 'oklch(0.056 0.01 150)',
  accent:     'oklch(0.5 0.2 150)',
  accentHover:'oklch(0.55 0.2 150)',
  textPrimary:'oklch(0.9 0.01 150)',
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
  1: '#00ff9f', // Primary Neon Green
  2: '#0ECB81', // Profit green
  3: '#F6465D', // Loss red
  4: 'hsl(170, 80%, 55%)', // Cyan-green (info)
  5: '#3b82f6', // Blue (secondary)
  6: '#0e7490', // Teal
  7: '#888888', // Muted
  8: '#666666', // Subtle
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
