/**
 * Consistent animation system for minimalist UI
 *
 * Simple, purposeful animations that enhance UX without visual noise.
 * All animations use consistent timing and easing functions.
 */

// Animation timing - consistent across all components
export const timing = {
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
} as const

// Easing functions - consistent and natural
export const easing = {
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
} as const

// Base transition utilities
export const transitions = {
  all: `all ${timing.normal} ${easing.easeOut}`,
  background: `background-color ${timing.normal} ${easing.easeOut}`,
  border: `border-color ${timing.normal} ${easing.easeOut}`,
  color: `color ${timing.normal} ${easing.easeOut}`,
  transform: `transform ${timing.normal} ${easing.easeOut}`,
  opacity: `opacity ${timing.normal} ${easing.easeOut}`,
  shadow: `box-shadow ${timing.normal} ${easing.easeOut}`,
  padding: `padding ${timing.normal} ${easing.easeOut}`,
  margin: `margin ${timing.normal} ${easing.easeOut}`,
} as const

// Purposeful animations
export const animations = {
  // Fade in/out for UI elements
  fadeIn: {
    opacity: [0, 1],
    transition: { duration: timing.normal, ease: easing.easeOut },
  },

  fadeOut: {
    opacity: [1, 0],
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  // Simple scale for interactive elements
  scaleUp: {
    scale: [1, 1.02],
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  scaleDown: {
    scale: [1.02, 1],
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  // Gentle lift for cards and buttons
  liftUp: {
    y: [0, -4],
    transition: { duration: timing.normal, ease: easing.easeOut },
  },

  liftDown: {
    y: [-4, 0],
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  // Slide animations for drawers/modals
  slideInLeft: {
    x: [-100, 0],
    transition: { duration: timing.normal, ease: easing.easeOut },
  },

  slideInRight: {
    x: [100, 0],
    transition: { duration: timing.normal, ease: easing.easeOut },
  },

  slideInUp: {
    y: [100, 0],
    transition: { duration: timing.normal, ease: easing.easeOut },
  },

  slideInDown: {
    y: [-100, 0],
    transition: { duration: timing.normal, ease: easing.easeOut },
  },

  slideOutLeft: {
    x: [0, -100],
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  slideOutRight: {
    x: [0, 100],
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  slideOutUp: {
    y: [0, -100],
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  slideOutDown: {
    y: [0, 100],
    transition: { duration: timing.fast, ease: easing.easeOut },
  },
} as const

// CSS class utilities for common animations
export const animationClasses = {
  // Hover states
  hover: 'transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5',
  active: 'active:scale-95 transition-all duration-75 ease-out',
  focus: 'focus:outline-none focus:ring-2 focus:ring-ring/50',

  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',

  // Entry animations
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',

  // Shared transitions
  smoothTransition: 'transition-all duration-200 ease-out',
  backgroundTransition: 'transition-colors duration-200 ease-out',
  borderTransition: 'transition-border-color duration-200 ease-out',
} as const

// Keyframes for CSS animations
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,

  slideUp: `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  slideDown: `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  gentlePulse: `
    @keyframes gentlePulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
  `,
} as const

// Animation variants for components
export const animationVariants = {
  // Default hover state
  hover: {
    scale: 1.02,
    y: -2,
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  // Active/click state
  active: {
    scale: 0.98,
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  // Focus state
  focus: {
    scale: 1.02,
    transition: { duration: timing.fast, ease: easing.easeOut },
  },

  // Page transitions
  pageEnter: {
    opacity: { duration: timing.normal, ease: easing.easeOut },
    y: { duration: timing.normal, ease: easing.easeOut },
  },

  // Loading states
  loading: {
    scale: [1, 1.05, 1],
    transition: { duration: timing.normal, repeat: Infinity, ease: easing.easeInOut },
  },
} as const