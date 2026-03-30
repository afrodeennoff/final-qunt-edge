/**
 * Shared design constants for the home page.
 * Centralises spacing, typography, animation, and color token values
 * so all sections render consistently.
 */

// ── Animation ────────────────────────────────────────────────────────────────
export const MOTION_EASE = [0.25, 0.46, 0.45, 0.94] as const

export const STAGGER_CARD = 0.08
export const STAGGER_LIST = 0.06

// ── Section Layout ───────────────────────────────────────────────────────────
export const SECTION_PY = 'py-20 sm:py-28 lg:py-32'
export const SECTION_PY_LIGHT = 'py-16'
export const HEADER_MB = 'mb-12 lg:mb-16'

// ── Typography ───────────────────────────────────────────────────────────────
export const TYPO_HERO =
  'text-[clamp(2.5rem,6vw,4.5rem)] tracking-[-0.035em] leading-[1.05]'
export const TYPO_MAJOR =
  'text-[clamp(1.9rem,4.9vw,3.45rem)] tracking-[-0.025em]'
export const TYPO_MINOR =
  'text-[clamp(1.8rem,3.8vw,2.75rem)] tracking-[-0.025em]'
export const TYPO_BODY = 'leading-[1.75]'
export const TYPO_EYEBROW = 'text-[0.68rem] uppercase tracking-[0.2em]'

// ── Surface & Border Tokens ──────────────────────────────────────────────────
export const SURFACE_CARD = 'bg-[hsl(var(--mk-surface)/0.6)]'
export const SURFACE_SUBTLE = 'bg-[hsl(var(--mk-surface)/0.3)]'
export const BORDER_CARD = 'border-[hsl(var(--mk-border)/0.3)]'
export const BORDER_SECTION = 'border-y border-border/30 bg-card/20'
export const TEXT_SECONDARY = 'text-muted-foreground/80'
