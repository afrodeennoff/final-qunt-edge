/**
 * TypeScript typography scale — mirrors the macOS HIG type system in globals.css.
 *
 * Maps to --type-* and --text-* CSS custom properties.
 * For styling, prefer Tailwind utilities or CSS classes (.type-h1, .type-body).
 * This file is for programmatic use in chart labels, canvas text, etc.
 */

// ── Apple HIG Font Size Scale ──

export const fontSize = {
  xs:   '11px',
  sm:   '13px',
  base: '15px',
  md:   '17px',
  lg:   '22px',
  xl:   '28px',
  '2xl':'34px',
  '3xl':'44px',
  '4xl':'56px',
  '5xl':'64px',
} as const

// ── Type Scale (matches --type-* CSS variables) ──

export const typeScale = {
  display: {
    size:    '3.35rem',
    weight:  600,
    lineHeight: 0.96,
    tracking: '-0.045em',
  },
  h1: {
    size:    '2.5rem',
    weight:  600,
    lineHeight: 1,
    tracking: '-0.04em',
  },
  h2: {
    size:    '2rem',
    weight:  600,
    lineHeight: 1.06,
    tracking: '-0.03em',
  },
  h3: {
    size:    '1.375rem',
    weight:  600,
    lineHeight: 1.18,
    tracking: '-0.022em',
  },
  h4: {
    size:    '1.0625rem',
    weight:  600,
    lineHeight: 1.3,
    tracking: '-0.014em',
  },
  bodyLg: {
    size:    '1rem',
    weight:  450,
    lineHeight: 1.62,
    tracking: '-0.008em',
  },
  body: {
    size:    '0.9375rem',
    weight:  450,
    lineHeight: 1.55,
    tracking: '-0.006em',
  },
  bodySm: {
    size:    '0.8125rem',
    weight:  500,
    lineHeight: 1.45,
    tracking: '-0.002em',
  },
  label: {
    size:    '0.72rem',
    weight:  600,
    lineHeight: 1.2,
    tracking: '0.08em',
  },
  overline: {
    size:    '0.6875rem',
    weight:  700,
    lineHeight: 1.2,
    tracking: '0.12em',
  },
} as const

export type TypeScaleKey = keyof typeof typeScale

// ── macOS UI-Specific Types ──

export const uiTypes = {
  ui: {
    size:    '13px',
    weight:  450,
    tracking: '-0.01em',
  },
  metric: {
    size:    '28px',
    weight:  250,
    tracking: '-0.04em',
  },
  terminal: {
    fontFamily: 'var(--font-mono), ui-monospace, monospace',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em',
  },
} as const

// ── Font Weights ──

export const fontWeight = {
  thin:     200,
  light:    300,
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
  extrabold:800,
} as const

// ── Line Heights ──

export const lineHeight = {
  none:    1,
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.7,
  loose:   2,
} as const

// ── Letter Spacing ──

export const letterSpacing = {
  tighter: '-0.04em',
  tight:   '-0.02em',
  normal:  '-0.01em',
  wide:    '0.02em',
  wider:   '0.06em',
  widest:  '0.1em',
} as const

// ── Font Family Stack ──

export const fontFamily = {
  native: "-apple-system, BlinkMacSystemFont, 'DM Sans', 'Geist', system-ui, sans-serif",
  body:   "var(--font-dm-sans), 'DM Sans', sans-serif",
  mono:   "var(--font-mono), ui-monospace, monospace",
  display:"var(--font-ui-native), var(--font-display), var(--font-sans), system-ui, sans-serif",
} as const

// ── CSS Class Name Presets (for className prop) ──

export const typeClasses = {
  display:  'type-display',
  h1:       'type-h1',
  h2:       'type-h2',
  h3:       'type-h3 type-title',
  h4:       'type-h4',
  bodyLg:   'type-body-lg',
  body:     'type-body',
  bodySm:   'type-body-sm type-caption',
  label:    'type-label',
  overline: 'type-overline',
  terminal: 'mono-data',
} as const

// ── Utility ──

export function getTypeStyle(key: TypeScaleKey): typeof typeScale[TypeScaleKey] {
  return typeScale[key]
}
