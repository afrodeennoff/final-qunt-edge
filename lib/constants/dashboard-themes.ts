export const VALID_DASHBOARD_THEMES = ['blue', 'violet', 'emerald', 'amber', 'rose', 'aurora', 'sapphire', 'gold', 'plasma'] as const

export type DashboardTheme = typeof VALID_DASHBOARD_THEMES[number]

/**
 * CSS custom property values (oklch) for each dashboard accent theme.
 * Only accent-related variables are themeable — background/foreground stay monochrome.
 */
export const THEME_PALETTES: Record<DashboardTheme, Record<string, string>> = {
  blue: {
    '--primary': 'oklch(0.55 0.22 264)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--accent': 'oklch(0.24 0.03 265)',
    '--accent-foreground': 'oklch(0.95 0 0)',
    '--ring': 'oklch(0.55 0.22 264)',
    '--sidebar-primary': 'oklch(0.55 0.22 264)',
    '--sidebar-ring': 'oklch(0.55 0.22 264)',
    '--sidebar-accent': 'oklch(0.188 0.0868 261.9799)',
    '--sidebar-accent-foreground': 'oklch(0.55 0.22 264)',
    '--shadow-base': '222.7751 100% 59.0196%',
  },
  violet: {
    '--primary': 'oklch(0.6083 0.2172 297.1153)',
    '--primary-foreground': 'oklch(0.1091 0.0091 301.6956)',
    '--accent': 'oklch(0.2255 0.0836 296.7401)',
    '--accent-foreground': 'oklch(0.6083 0.2172 297.1153)',
    '--ring': 'oklch(0.6083 0.2172 297.1153)',
    '--sidebar-primary': 'oklch(0.6083 0.2172 297.1153)',
    '--sidebar-ring': 'oklch(0.6083 0.2172 297.1153)',
    '--sidebar-accent': 'oklch(0.2096 0.0482 299.9505)',
    '--sidebar-accent-foreground': 'oklch(0.6083 0.2172 297.1153)',
    '--shadow-base': '263 70% 50%',
  },
  emerald: {
    '--primary': 'oklch(0.55 0.20 160)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--accent': 'oklch(0.24 0.04 160)',
    '--accent-foreground': 'oklch(0.95 0 0)',
    '--ring': 'oklch(0.55 0.20 160)',
    '--sidebar-primary': 'oklch(0.55 0.20 160)',
    '--sidebar-ring': 'oklch(0.55 0.20 160)',
    '--sidebar-accent': 'oklch(0.20 0.10 158)',
    '--sidebar-accent-foreground': 'oklch(0.55 0.20 160)',
    '--shadow-base': '160 100% 50%',
  },
  amber: {
    '--primary': 'oklch(0.60 0.20 70)',
    '--primary-foreground': 'oklch(0.15 0 0)',
    '--accent': 'oklch(0.28 0.05 70)',
    '--accent-foreground': 'oklch(0.15 0 0)',
    '--ring': 'oklch(0.60 0.20 70)',
    '--sidebar-primary': 'oklch(0.60 0.20 70)',
    '--sidebar-ring': 'oklch(0.60 0.20 70)',
    '--sidebar-accent': 'oklch(0.22 0.12 68)',
    '--sidebar-accent-foreground': 'oklch(0.15 0 0)',
    '--shadow-base': '38 100% 50%',
  },
  rose: {
    '--primary': 'oklch(0.58 0.22 10)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--accent': 'oklch(0.25 0.04 10)',
    '--accent-foreground': 'oklch(0.95 0 0)',
    '--ring': 'oklch(0.58 0.22 10)',
    '--sidebar-primary': 'oklch(0.58 0.22 10)',
    '--sidebar-ring': 'oklch(0.58 0.22 10)',
    '--sidebar-accent': 'oklch(0.20 0.08 8)',
    '--sidebar-accent-foreground': 'oklch(0.58 0.22 10)',
    '--shadow-base': '350 100% 60%',
  },
  aurora: {
    '--primary': 'oklch(0.55 0.28 290)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--accent': 'oklch(0.22 0.10 288)',
    '--accent-foreground': 'oklch(0.90 0.08 290)',
    '--ring': 'oklch(0.55 0.28 290)',
    '--sidebar-primary': 'oklch(0.55 0.28 290)',
    '--sidebar-ring': 'oklch(0.55 0.28 290)',
    '--sidebar-accent': 'oklch(0.18 0.12 286)',
    '--sidebar-accent-foreground': 'oklch(0.55 0.28 290)',
    '--shadow-base': '274 84% 67%',
  },
  sapphire: {
    '--primary': 'oklch(0.52 0.22 255)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--accent': 'oklch(0.22 0.06 256)',
    '--accent-foreground': 'oklch(0.90 0.04 255)',
    '--ring': 'oklch(0.52 0.22 255)',
    '--sidebar-primary': 'oklch(0.52 0.22 255)',
    '--sidebar-ring': 'oklch(0.52 0.22 255)',
    '--sidebar-accent': 'oklch(0.18 0.08 254)',
    '--sidebar-accent-foreground': 'oklch(0.52 0.22 255)',
    '--shadow-base': '225 90% 62%',
  },
  gold: {
    '--primary': 'oklch(0.72 0.18 80)',
    '--primary-foreground': 'oklch(0.12 0.02 70)',
    '--accent': 'oklch(0.25 0.06 78)',
    '--accent-foreground': 'oklch(0.72 0.18 80)',
    '--ring': 'oklch(0.72 0.18 80)',
    '--sidebar-primary': 'oklch(0.72 0.18 80)',
    '--sidebar-ring': 'oklch(0.72 0.18 80)',
    '--sidebar-accent': 'oklch(0.20 0.10 76)',
    '--sidebar-accent-foreground': 'oklch(0.72 0.18 80)',
    '--shadow-base': '42 95% 65%',
  },
  plasma: {
    '--primary': 'oklch(0.58 0.26 340)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--accent': 'oklch(0.24 0.08 338)',
    '--accent-foreground': 'oklch(0.95 0.04 340)',
    '--ring': 'oklch(0.58 0.26 340)',
    '--sidebar-primary': 'oklch(0.58 0.26 340)',
    '--sidebar-ring': 'oklch(0.58 0.26 340)',
    '--sidebar-accent': 'oklch(0.20 0.12 336)',
    '--sidebar-accent-foreground': 'oklch(0.58 0.26 340)',
    '--shadow-base': '340 85% 62%',
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
