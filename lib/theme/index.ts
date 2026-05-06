/**
 * Qunt Edge Design System — TypeScript Theme Tokens
 *
 * Barrel export for all theme modules. These TypeScript constants mirror
 * the CSS custom properties defined in app/globals.css, providing type-safe
 * access for programmatic use (chart rendering, canvas drawing, calculations).
 *
 * For styling, prefer:
 *   - CSS custom properties: var(--primary), var(--space-4)
 *   - Tailwind utilities: text-primary, p-4, gap-6
 *   - Utility classes: .type-h1, .glass-card, .frost-surface
 */

// Colors — accent palette, backgrounds, surfaces, text, borders, semantic
export {
  accent,
  darkBackgrounds,
  lightBackgrounds,
  surface,
  darkText,
  lightText,
  darkBorders,
  lightBorders,
  frostBorders,
  status,
  trading,
  tradingBg,
  marketing,
  v2Dark,
  p3Accents,
  chartPalette,
  accentWithOpacity,
  tradingColor,
  tradingBgColor,
} from './colors'

// Spacing — 8pt grid scale, presets, fluid spacing
export {
  space,
  spacePx,
  spacingPresets,
  fluidSpacing,
  fluidGap,
} from './spacing'
export type { SpaceKey } from './spacing'

// Typography — macOS HIG type scale, weights, families
export {
  fontSize,
  typeScale,
  uiTypes,
  fontWeight,
  lineHeight,
  letterSpacing,
  fontFamily,
  typeClasses,
  getTypeStyle,
} from './typography'
export type { TypeScaleKey } from './typography'

// Effects — shadows, radius, glass, glow, motion, gradients
export {
  shadows,
  ultraShadows,
  macosShadows,
  premiumShadows,
  radius,
  blur,
  glass,
  glow,
  duration,
  easing,
  gradients,
  frostEffects,
} from './effects'

// Focus — ring presets for keyboard navigation
export { FOCUS_RING } from './focus'
export type { FocusRingPreset } from './focus'
