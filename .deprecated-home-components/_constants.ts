/**
 * Shared design constants for the home page.
 * Centralises spacing, typography, animation, and color token values
 * so all sections render consistently.
 */

// ── Animation ────────────────────────────────────────────────────────────────
export const MOTION_EASE = [0.22, 1, 0.36, 1] as const

export const STAGGER_DELAY = 0.04
export const STAGGER_CHILDREN = 0.015
export const STAGGER_CARD = 0.08
export const STAGGER_LIST = 0.06

// ── Section Layout ───────────────────────────────────────────────────────────
export const SECTION_PY = 'py-8 sm:py-10'
export const HEADER_MB = 'mb-4'

// ── Typography ───────────────────────────────────────────────────────────────
export const TYPO_EYEBROW = 'text-[10px] font-semibold uppercase tracking-[0.14em] text-primary'

// ── Surface & Border Tokens ──────────────────────────────────────────────────
export const TEXT_SECONDARY = 'text-muted-foreground'

// ── Transition ───────────────────────────────────────────────────────────────
export const TRANSITION_CARD =
  'transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
export const TRANSITION_INTERACTIVE =
  'transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]'
