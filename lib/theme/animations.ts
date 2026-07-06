/**
 * Binance Trading Terminal Animation System
 *
 * Fast, subtle, data-focused micro-interactions.
 * Professional, calm, intentional — no decorative motion.
 * All respect prefers-reduced-motion.
 */

// Animation timing - snappy for trading terminal feel
export const timing = {
  instant: '60ms',
  fast: '100ms',
  normal: '160ms',
  slow: '220ms',
} as const

// Easing - snappy professional (Binance/macOS crisp) + subtle spring for settles
export const easing = {
  snappy: 'cubic-bezier(0.16, 1, 0.3, 1)',
  subtle: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  linear: 'linear',
} as const

// Base transition utilities — specific properties only, no `all`
export const transitions = {
  background: `background-color ${timing.fast} ${easing.snappy}`,
  border: `border-color ${timing.fast} ${easing.snappy}`,
  color: `color ${timing.fast} ${easing.snappy}`,
  transform: `transform ${timing.fast} ${easing.snappy}`,
  opacity: `opacity ${timing.fast} ${easing.snappy}`,
  shadow: `box-shadow ${timing.normal} ${easing.subtle}`,
} as const

// Purposeful minimal animations for trading UI
export const animations = {
  fadeIn: {
    opacity: [0, 1],
    transition: { duration: timing.fast, ease: easing.snappy },
  },
  fadeOut: {
    opacity: [1, 0],
    transition: { duration: timing.instant, ease: easing.snappy },
  },
  // Subtle press for buttons/CTAs
  press: {
    scale: 0.985,
    transition: { duration: timing.instant, ease: easing.snappy },
  },
  // Tiny lift only where it adds clarity (rare)
  subtleLift: {
    y: -1,
    transition: { duration: timing.fast, ease: easing.snappy },
  },
  // Data row hover — instant bg only
  rowHover: {
    backgroundColor: 'var(--muted)',
    transition: { duration: timing.instant, ease: easing.snappy },
  },
  // Modal/sheet content — minimal offset
  slideInUp: {
    y: [8, 0],
    opacity: [0, 1],
    transition: { duration: timing.normal, ease: easing.subtle },
  },
  slideOutDown: {
    y: [0, 4],
    opacity: [1, 0],
    transition: { duration: timing.fast, ease: easing.snappy },
  },
} as const

// CSS class utilities — Binance professional
export const animationClasses = {
  // Interactions: specific, fast, no `all`
  interactive: 'transition-[background-color,border-color,color,opacity] duration-100 ease-[cubic-bezier(0.16,1,0.3,1)]',
  press: 'active:scale-[0.985] active:transition-transform active:duration-60',
  focus: 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/60',

  // Loading only
  pulse: 'animate-pulse',
  spin: 'animate-spin',

  // Minimal entry — tiny offset, fast
  fadeIn: 'animate-binance-fade',
  contentReveal: 'animate-binance-reveal',

  // Specific transitions
  bgTransition: 'transition-colors duration-100 ease-[cubic-bezier(0.16,1,0.3,1)]',
  borderTransition: 'transition-[border-color] duration-100 ease-[cubic-bezier(0.16,1,0.3,1)]',
} as const

// Keyframes — minimal professional set
export const keyframes = {
  binanceFade: `
    @keyframes binance-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  binanceReveal: `
    @keyframes binance-reveal {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  shimmer: `
    @keyframes binance-shimmer {
      100% { transform: translateX(100%); }
    }
  `,
} as const

// Animation variants — calm, data-focused
export const animationVariants = {
  // Button/CTA press
  tap: {
    scale: 0.985,
    transition: { duration: 0.06, ease: easing.snappy },
  },
  // Subtle card/widget hover
  hoverSubtle: {
    borderColor: 'transparent',
    transition: { duration: 0.1, ease: easing.snappy },
  },
  // Page/section enter — tiny, fast
  pageEnter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: easing.subtle },
  },
  // Loading shimmer only
  loading: {
    opacity: [0.6, 1, 0.6],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
} as const