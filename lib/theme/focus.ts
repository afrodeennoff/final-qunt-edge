/**
 * Centralized focus ring presets for consistent keyboard navigation.
 *
 * The shadow-based "gap ring" pattern creates a 2px gap between the element
 * and the focus indicator — matching the macOS accessibility aesthetic.
 * All presets are theme-aware via CSS custom properties (--ring, --background).
 */

export const FOCUS_RING = {
  /** Shadow-based ring with 2px gap — primary interactive elements (buttons, links) */
  standard:
    'focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_2px_var(--background),0_0_0_4px_hsl(var(--ring)/0.5)]',

  /** Lighter opacity for secondary/tertiary actions */
  subtle:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',

  /** Form input focus — border highlight + subtle ring */
  input:
    'focus-visible:outline-none focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/25',

  /** Destructive/error state focus ring */
  error:
    'focus-visible:outline-none focus-visible:border-destructive/60 focus-visible:ring-2 focus-visible:ring-destructive/25',

  /** Clickable containers (cards, list items) — uses ring-offset for clarity */
  interactive:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
} as const

export type FocusRingPreset = keyof typeof FOCUS_RING
