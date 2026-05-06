/**
 * TypeScript spacing scale — mirrors the 8pt grid in globals.css.
 *
 * Maps directly to --space-* CSS custom properties.
 * For styling, prefer Tailwind utilities (p-4, gap-6, m-8).
 * This file is for programmatic use in JS calculations.
 */

export const space = {
  0:   '0px',
  px:  '1px',
  '0_5': '2px',
  1:   '4px',
  '1_5': '6px',
  2:   '8px',    // Base unit
  '2_5': '10px',
  3:   '12px',
  '3_5': '14px',
  4:   '16px',
  5:   '20px',
  6:   '24px',
  7:   '28px',
  8:   '32px',
  9:   '36px',
  10:  '40px',
  11:  '44px',
  12:  '48px',
  14:  '56px',
  16:  '64px',
  20:  '80px',
  24:  '96px',
  28:  '112px',
  32:  '128px',
  36:  '144px',
  40:  '160px',
  44:  '176px',
  48:  '192px',
  52:  '208px',
  56:  '224px',
  60:  '240px',
  64:  '256px',
  72:  '288px',
  80:  '320px',
  96:  '384px',
} as const

export type SpaceKey = keyof typeof space

// Numeric pixel values for calculations
export const spacePx = {
  0:   0,
  px:  1,
  '0_5': 2,
  1:   4,
  '1_5': 6,
  2:   8,
  '2_5': 10,
  3:   12,
  '3_5': 14,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  9:   36,
  10:  40,
  12:  48,
  16:  64,
  20:  80,
  24:  96,
} as const

// Semantic spacing presets for common patterns
export const spacingPresets = {
  // Inline elements
  tag:       { px: space['1_5'], py: space['0_5'] },
  badge:     { px: space['2'],   py: space['1'] },
  chip:      { px: space['2_5'], py: space['1'] },

  // Buttons
  buttonSm:  { px: space['3'],   py: space['1_5'] },
  buttonMd:  { px: space['4'],   py: space['2'] },
  buttonLg:  { px: space['6'],   py: space['2_5'] },

  // Cards
  cardPad:   { p: space['4'] },
  cardPadLg: { p: space['6'] },

  // Sections
  section:   { py: space['16'], px: space['4'] },
  sectionLg: { py: space['24'], px: space['6'] },

  // Layout
  container: { px: space['4'], maxWidth: '1400px' },
  sidebar:   { w: '260px' }, // --macos-sidebar-width
  toolbar:   { h: '52px' },  // --macos-toolbar-height
} as const

// Fluid spacing utilities (responsive clamp values)
export const fluidSpacing = {
  sm: 'clamp(0.375rem, 0.3rem + 0.25vw, 0.75rem)',
  md: 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
  lg: 'clamp(1rem, 0.8rem + 1vw, 2.5rem)',
  xl: 'clamp(1.5rem, 1.2rem + 1.5vw, 4rem)',
  '2xl': 'clamp(2rem, 1.5rem + 2.5vw, 6rem)',
} as const

export const fluidGap = {
  sm: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.625rem)',
  md: 'clamp(0.5rem, 0.4rem + 0.5vw, 1.25rem)',
  lg: 'clamp(0.75rem, 0.6rem + 0.75vw, 2rem)',
  xl: 'clamp(1rem, 0.8rem + 1vw, 3rem)',
} as const
