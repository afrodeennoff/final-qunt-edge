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
export const SECTION_PY = 'py-20 sm:py-24 lg:py-32'
export const SECTION_PY_LIGHT = 'py-16 sm:py-20 lg:py-24'
export const HEADER_MB = 'mb-3 lg:mb-4'

// ── Typography ───────────────────────────────────────────────────────────────
export const TYPO_HERO =
  'text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold tracking-[-0.035em] leading-[1.05]'
export const TYPO_MAJOR =
  'text-[clamp(1.9rem,4.9vw,3.45rem)] font-bold tracking-[-0.025em] leading-[1.15]'
export const TYPO_MINOR =
  'text-[clamp(1.8rem,3.8vw,2.75rem)] font-bold tracking-[-0.025em] leading-[1.2]'
export const TYPO_BODY = 'leading-[1.6]'
export const TYPO_EYEBROW = 'text-[0.68rem] font-bold uppercase tracking-[0.2em]'

// ── Surface & Border Tokens ──────────────────────────────────────────────────
export const SURFACE_CARD = 'bg-[hsl(var(--mk-surface)/0.6)]'
export const SURFACE_SUBTLE = 'bg-[hsl(var(--mk-surface)/0.3)]'
export const BORDER_CARD = 'border-border/0.04'
export const BORDER_SECTION = 'border-y border-border/0.03 bg-card/20'
export const TEXT_SECONDARY = 'text-muted-foreground'

// ── Premium Shadow Tokens ────────────────────────────────────────────────────
export const SHADOW_CARD =
  'shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]'
export const SHADOW_CARD_HOVER =
  'hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]'
export const SHADOW_SECTION =
  'shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.32)]'

// ── Transition ───────────────────────────────────────────────────────────────
export const TRANSITION_CARD =
  'transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
export const TRANSITION_INTERACTIVE =
  'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]'
