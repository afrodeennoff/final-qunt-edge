export const VALID_DASHBOARD_THEMES = ['purple', 'violet', 'indigo', 'lavender', 'plum'] as const

export type DashboardTheme = typeof VALID_DASHBOARD_THEMES[number]

/**
 * CSS custom property values (oklch) for each dashboard accent theme.
 * Only accent-related variables are themeable — background/foreground stay monochrome.
 * All themes are purple variants — no non-purple accent colors.
 */
export const THEME_PALETTES: Record<DashboardTheme, Record<string, string>> = {
  purple: {
    '--primary': 'oklch(0.6083 0.2172 297.1153)',
    '--primary-foreground': 'oklch(0.1091 0.0091 301.6956)',
    '--accent': 'oklch(0.2255 0.0836 296.7401)',
    '--accent-foreground': 'oklch(0.6083 0.2172 297.1153)',
    '--ring': 'oklch(0.6083 0.2172 297.1153)',
    '--sidebar-primary': 'oklch(0.6083 0.2172 297.1153)',
    '--sidebar-ring': 'oklch(0.6083 0.2172 297.1153)',
    '--sidebar-accent': 'oklch(0.2096 0.0482 299.9505)',
    '--sidebar-accent-foreground': 'oklch(0.6083 0.2172 297.1153)',
    '--shadow-base': '297 70% 50%',
  },
  violet: {
    '--primary': 'oklch(0.58 0.23 290)',
    '--primary-foreground': 'oklch(0.1091 0.0091 301.6956)',
    '--accent': 'oklch(0.22 0.09 290)',
    '--accent-foreground': 'oklch(0.58 0.23 290)',
    '--ring': 'oklch(0.58 0.23 290)',
    '--sidebar-primary': 'oklch(0.58 0.23 290)',
    '--sidebar-ring': 'oklch(0.58 0.23 290)',
    '--sidebar-accent': 'oklch(0.20 0.05 290)',
    '--sidebar-accent-foreground': 'oklch(0.58 0.23 290)',
    '--shadow-base': '290 70% 50%',
  },
  indigo: {
    '--primary': 'oklch(0.55 0.22 285)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--accent': 'oklch(0.24 0.07 285)',
    '--accent-foreground': 'oklch(0.95 0 0)',
    '--ring': 'oklch(0.55 0.22 285)',
    '--sidebar-primary': 'oklch(0.55 0.22 285)',
    '--sidebar-ring': 'oklch(0.55 0.22 285)',
    '--sidebar-accent': 'oklch(0.20 0.08 285)',
    '--sidebar-accent-foreground': 'oklch(0.55 0.22 285)',
    '--shadow-base': '285 70% 50%',
  },
  lavender: {
    '--primary': 'oklch(0.65 0.18 305)',
    '--primary-foreground': 'oklch(0.1091 0.0091 301.6956)',
    '--accent': 'oklch(0.24 0.06 305)',
    '--accent-foreground': 'oklch(0.65 0.18 305)',
    '--ring': 'oklch(0.65 0.18 305)',
    '--sidebar-primary': 'oklch(0.65 0.18 305)',
    '--sidebar-ring': 'oklch(0.65 0.18 305)',
    '--sidebar-accent': 'oklch(0.22 0.10 305)',
    '--sidebar-accent-foreground': 'oklch(0.65 0.18 305)',
    '--shadow-base': '305 70% 50%',
  },
  plum: {
    '--primary': 'oklch(0.56 0.22 310)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--accent': 'oklch(0.25 0.08 310)',
    '--accent-foreground': 'oklch(0.95 0 0)',
    '--ring': 'oklch(0.56 0.22 310)',
    '--sidebar-primary': 'oklch(0.56 0.22 310)',
    '--sidebar-ring': 'oklch(0.56 0.22 310)',
    '--sidebar-accent': 'oklch(0.22 0.12 310)',
    '--sidebar-accent-foreground': 'oklch(0.56 0.22 310)',
    '--shadow-base': '310 70% 50%',
  },
}

/**
 * Apply a theme's CSS variables to the document root.
 */
export function applyTheme(theme: DashboardTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const palette = THEME_PALETTES[theme]
  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(key, value)
  }
  root.setAttribute('data-theme', theme)
}

export function serializeThemeVars(theme: DashboardTheme): string {
  const palette = THEME_PALETTES[theme]
  return Object.entries(palette)
    .map(([key, value]) => `root.style.setProperty('${key}', '${value}')`)
    .join(';')
}
