/**
 * Sidebar design token constants for type-safe access.
 * These mirror the CSS variables in app/globals.css.
 * Use these for dynamic styling or programmatic access to sidebar tokens.
 */

export const SIDEBAR_TOKENS = {
  // Backgrounds
  background: 'var(--sidebar-background)',
  primary: 'var(--sidebar-primary)',
  accent: 'var(--sidebar-accent)',
  destructive: 'var(--sidebar-destructive)',

  // Foregrounds
  foreground: 'var(--sidebar-foreground)',
  primaryForeground: 'var(--sidebar-primary-foreground)',
  accentForeground: 'var(--sidebar-accent-foreground)',

  // Structural
  border: 'var(--sidebar-border)',
  ring: 'var(--sidebar-ring)',
  input: 'var(--sidebar-input)',
} as const

export type SidebarToken = (typeof SIDEBAR_TOKENS)[keyof typeof SIDEBAR_TOKENS]

/**
 * Hover/active state token maps for sidebar navigation items.
 * Per AGENTS.md: "Active/hover sidebar menu text must stay on sidebar-foreground.
 * sidebar-primary/sidebar-accent only for backgrounds, borders, icon emphasis."
 */
export const SIDEBAR_NAV_TOKENS = {
  defaultText: 'text-sidebar-foreground',
  hoverText: 'hover:text-sidebar-foreground',
  activeText: 'data-[active=true]:text-sidebar-foreground',
  defaultIcon: 'text-sidebar-foreground/60',
  activeIcon: 'text-sidebar-primary',
  activeBg: 'bg-sidebar-primary/14',
  activeBorder: 'ring-1 ring-sidebar-primary/22',
} as const

/**
 * Mobile breakpoint used by use-mobile hook.
 * Mirrors MOBILE_BREAKPOINT from lib/config/breakpoints.
 */
export const SIDEBAR_MOBILE_BREAKPOINT = 768

/**
 * Cookie name and max-age for sidebar state persistence.
 */
export const SIDEBAR_COOKIE = {
  name: 'sidebar:state',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  secure: true, // Must match cookie write in sidebar.tsx
} as const