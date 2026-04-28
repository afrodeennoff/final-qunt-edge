export const VALID_DASHBOARD_THEMES = [
  'cmlh0x713000104jrgmds6vcd',
  'cmmi8o8ic000904l12ucn8i9p',
  'cmntqpq8v000004l78eqihlx5',
  'cmninq0c3000604l25wvb3xgh',
  'cmoh2uyew000004kzfreohnht',
  'cmo1jei81000004l734a5ekys',
  'cmo7mn5wv000204jrbl2rfyxz',
  'cmo6ofmje000104jub1yg4bos',
  'cmkjubmo7000604jpa4iidt1u',
] as const

export type DashboardTheme = typeof VALID_DASHBOARD_THEMES[number]

export const DEFAULT_DASHBOARD_THEME: DashboardTheme = 'cmlh0x713000104jrgmds6vcd'

const LEGACY_DASHBOARD_THEME_ALIASES: Record<string, DashboardTheme> = {
  purple: 'cmlh0x713000104jrgmds6vcd',
  deepPurple: 'cmlh0x713000104jrgmds6vcd',
  violet: 'cmoh2uyew000004kzfreohnht',
  rose: 'cmninq0c3000604l25wvb3xgh',
  blue: 'cmo1jei81000004l734a5ekys',
  orange: 'cmo7mn5wv000204jrbl2rfyxz',
  green: 'cmo6ofmje000104jub1yg4bos',
  teal: 'cmo6ofmje000104jub1yg4bos',
  'deep-purple': 'cmlh0x713000104jrgmds6vcd',
  midnight: 'cmmi8o8ic000904l12ucn8i9p',
  ocean: 'cmmi8o8ic000904l12ucn8i9p',
  emerald: 'cmo6ofmje000104jub1yg4bos',
  crimson: 'cmninq0c3000604l25wvb3xgh',
  steel: 'cmmi8o8ic000904l12ucn8i9p',
}

export function normalizeDashboardTheme(theme?: string | null): DashboardTheme {
  if (!theme) return DEFAULT_DASHBOARD_THEME
  if (VALID_DASHBOARD_THEMES.includes(theme as DashboardTheme)) {
    return theme as DashboardTheme
  }
  return LEGACY_DASHBOARD_THEME_ALIASES[theme] ?? DEFAULT_DASHBOARD_THEME
}

/**
 * CSS custom property values (oklch) for the 9 tweakcn themes.
 * Themes: cmlh0x713000104jrgmds6vcd, cmmi8o8ic000904l12ucn8i9p, cmntqpq8v000004l78eqihlx5,
 * cmninq0c3000604l25wvb3xgh, cmoh2uyew000004kzfreohnht, cmo1jei81000004l734a5ekys,
 * cmo7mn5wv000204jrbl2rfyxz, cmo6ofmje000104jub1yg4bos, cmkjubmo7000604jpa4iidt1u
 */
export const THEME_PALETTES: Record<DashboardTheme, Record<string, string>> = {
  'cmlh0x713000104jrgmds6vcd': {
    '--background': 'oklch(0.98 0.03 245)',
    '--foreground': 'oklch(0.10 0.01 245)',
    '--card': 'oklch(1 0 0)',
    '--card-foreground': 'oklch(0.10 0.01 245)',
    '--popover': 'oklch(1 0 0)',
    '--popover-foreground': 'oklch(0.10 0.01 245)',
    '--primary': 'oklch(0.48 0.25 263)',
    '--primary-foreground': 'oklch(0.98 0.03 245)',
    '--secondary': 'oklch(0.89 0.09 263)',
    '--secondary-foreground': 'oklch(0.30 0.18 263)',
    '--muted': 'oklch(0.88 0.08 240)',
    '--muted-foreground': 'oklch(0.38 0.03 250)',
    '--accent': 'oklch(0.96 0.08 263)',
    '--accent-foreground': 'oklch(0.48 0.25 263)',
    '--destructive': 'oklch(0.45 0.25 25)',
    '--destructive-foreground': 'oklch(0.98 0.03 245)',
    '--border': 'oklch(0.87 0.07 240)',
    '--input': 'oklch(0.87 0.07 240)',
    '--ring': 'oklch(0.48 0.25 263)',
    '--radius': '1rem',
  },
  'cmmi8o8ic000904l12ucn8i9p': {
    '--background': 'oklch(0.98 0.00 245)',
    '--foreground': 'oklch(0.02 0.00 245)',
    '--card': 'oklch(1 0 0)',
    '--card-foreground': 'oklch(0.02 0.00 245)',
    '--popover': 'oklch(1 0 0)',
    '--popover-foreground': 'oklch(0.02 0.00 245)',
    '--primary': 'oklch(0.09 0.00 245)',
    '--primary-foreground': 'oklch(0.85 0.07 280)',
    '--secondary': 'oklch(0.93 0.00 245)',
    '--secondary-foreground': 'oklch(0.09 0.00 245)',
    '--muted': 'oklch(0.93 0.00 245)',
    '--muted-foreground': 'oklch(0.45 0.00 245)',
    '--accent': 'oklch(0.93 0.00 245)',
    '--accent-foreground': 'oklch(0.09 0.00 245)',
    '--destructive': 'oklch(0.41 0.25 25)',
    '--destructive-foreground': 'oklch(0.98 0.00 245)',
    '--border': 'oklch(0.87 0.00 245)',
    '--input': 'oklch(0.90 0.00 245)',
    '--ring': 'oklch(0.74 0.00 245)',
    '--radius': '0.65rem',
  },
  'cmntqpq8v000004l78eqihlx5': {
    '--background': 'oklch(1 0.00 245)',
    '--foreground': 'oklch(0.04 0.01 250)',
    '--card': 'oklch(1 0.00 245)',
    '--card-foreground': 'oklch(0.04 0.01 250)',
    '--popover': 'oklch(1 0.00 245)',
    '--popover-foreground': 'oklch(0.04 0.01 250)',
    '--primary': 'oklch(0.61 0.30 155)',
    '--primary-foreground': 'oklch(0.09 0.00 155)',
    '--secondary': 'oklch(0.96 0.02 245)',
    '--secondary-foreground': 'oklch(0.10 0.00 155)',
    '--muted': 'oklch(0.96 0.02 245)',
    '--muted-foreground': 'oklch(0.46 0.02 250)',
    '--accent': 'oklch(0.90 0.02 245)',
    '--accent-foreground': 'oklch(0.10 0.00 245)',
    '--destructive': 'oklch(0.41 0.25 25)',
    '--destructive-foreground': 'oklch(1 0.00 245)',
    '--border': 'oklch(0.84 0.02 245)',
    '--input': 'oklch(0.84 0.02 245)',
    '--ring': 'oklch(0.61 0.30 155)',
    '--radius': '0.75rem',
  },
  'cmninq0c3000604l25wvb3xgh': {
    '--background': 'oklch(0 0.00 245)',
    '--foreground': 'oklch(1 0.00 245)',
    '--card': 'oklch(0.06 0.00 245)',
    '--card-foreground': 'oklch(1 0.00 245)',
    '--popover': 'oklch(0.06 0.00 245)',
    '--popover-foreground': 'oklch(1 0.00 245)',
    '--primary': 'oklch(0.54 0.25 154)',
    '--primary-foreground': 'oklch(0.06 0.00 245)',
    '--secondary': 'oklch(0.17 0.00 245)',
    '--secondary-foreground': 'oklch(1 0.00 245)',
    '--muted': 'oklch(0.11 0.00 245)',
    '--muted-foreground': 'oklch(0.75 0.00 145)',
    '--accent': 'oklch(0.11 0.00 245)',
    '--accent-foreground': 'oklch(1 0.00 245)',
    '--destructive': 'oklch(0.50 0.25 25)',
    '--destructive-foreground': 'oklch(1 0.00 245)',
    '--border': 'oklch(0.16 0.01 245)',
    '--input': 'oklch(0.11 0.00 245)',
    '--ring': 'oklch(0.54 0.25 154)',
    '--radius': '0.25rem',
  },
  'cmoh2uyew000004kzfreohnht': {
    '--background': 'oklch(0.96 0.04 250)',
    '--foreground': 'oklch(0.04 0.00 245)',
    '--card': 'oklch(1 0.00 245)',
    '--card-foreground': 'oklch(0.04 0.00 245)',
    '--popover': 'oklch(1 0.00 245)',
    '--popover-foreground': 'oklch(0.04 0.00 245)',
    '--primary': 'oklch(0.29 0.25 300)',
    '--primary-foreground': 'oklch(1 0.00 245)',
    '--secondary': 'oklch(0.96 0.15 320)',
    '--secondary-foreground': 'oklch(0 0.00 0)',
    '--muted': 'oklch(1 0.00 245)',
    '--muted-foreground': 'oklch(0.45 0.00 245)',
    '--accent': 'oklch(0.96 0.15 320)',
    '--accent-foreground': 'oklch(0.09 0.00 245)',
    '--destructive': 'oklch(0.41 0.25 25)',
    '--destructive-foreground': 'oklch(1 0.00 245)',
    '--border': 'oklch(0.90 0.00 245)',
    '--input': 'oklch(0.83 0.15 320)',
    '--ring': 'oklch(0.63 0.00 245)',
    '--radius': '0.625rem',
  },
  'cmo1jei81000004l734a5ekys': {
    '--background': 'oklch(0.95 0.03 245)',
    '--foreground': 'oklch(0.09 0.00 180)',
    '--card': 'oklch(1 0.00 245)',
    '--card-foreground': 'oklch(0.09 0.00 180)',
    '--popover': 'oklch(1 0.00 245)',
    '--popover-foreground': 'oklch(0.09 0.00 180)',
    '--primary': 'oklch(0.57 0.25 217)',
    '--primary-foreground': 'oklch(1 0.00 245)',
    '--secondary': 'oklch(0.92 0.03 245)',
    '--secondary-foreground': 'oklch(0.09 0.00 180)',
    '--muted': 'oklch(0.86 0.04 245)',
    '--muted-foreground': 'oklch(0.43 0.02 245)',
    '--accent': 'oklch(0.97 0.02 245)',
    '--accent-foreground': 'oklch(0.57 0.25 217)',
    '--destructive': 'oklch(0.52 0.25 0)',
    '--destructive-foreground': 'oklch(1 0.00 245)',
    '--border': 'oklch(0.87 0.03 245)',
    '--input': 'oklch(0.91 0.03 245)',
    '--ring': 'oklch(0.57 0.25 217)',
    '--radius': '0.4rem',
  },
  'cmo7mn5wv000204jrbl2rfyxz': {
    '--background': 'oklch(0.97 0.00 245)',
    '--foreground': 'oklch(0.10 0.00 245)',
    '--card': 'oklch(1 0.00 245)',
    '--card-foreground': 'oklch(0.12 0.00 245)',
    '--popover': 'oklch(1 0.00 245)',
    '--popover-foreground': 'oklch(0.12 0.00 245)',
    '--primary': 'oklch(0.56 0.20 45)',
    '--primary-foreground': 'oklch(0.10 0.00 245)',
    '--secondary': 'oklch(0.95 0.00 245)',
    '--secondary-foreground': 'oklch(0.10 0.00 245)',
    '--muted': 'oklch(0.92 0.00 245)',
    '--muted-foreground': 'oklch(0.35 0.00 245)',
    '--accent': 'oklch(0.89 0.03 45)',
    '--accent-foreground': 'oklch(0.10 0.00 245)',
    '--destructive': 'oklch(0.46 0.25 20)',
    '--destructive-foreground': 'oklch(1 0.00 245)',
    '--border': 'oklch(0.87 0.00 245)',
    '--input': 'oklch(0.87 0.00 245)',
    '--ring': 'oklch(0.56 0.20 45)',
    '--radius': '1.4rem',
  },
  'cmo6ofmje000104jub1yg4bos': {
    '--background': 'oklch(0.99 0.00 245)',
    '--foreground': 'oklch(0 0.00 0)',
    '--card': 'oklch(1 0.00 245)',
    '--card-foreground': 'oklch(0 0.00 0)',
    '--popover': 'oklch(0.99 0.00 245)',
    '--popover-foreground': 'oklch(0 0.00 0)',
    '--primary': 'oklch(0.40 0.25 154)',
    '--primary-foreground': 'oklch(1 0.00 245)',
    '--secondary': 'oklch(0.92 0.25 145)',
    '--secondary-foreground': 'oklch(0.40 0.25 154)',
    '--muted': 'oklch(0.96 0.00 245)',
    '--muted-foreground': 'oklch(0.32 0.00 245)',
    '--accent': 'oklch(0.92 0.00 245)',
    '--accent-foreground': 'oklch(0 0.00 0)',
    '--destructive': 'oklch(0.60 0.25 20)',
    '--destructive-foreground': 'oklch(1 0.00 245)',
    '--border': 'oklch(0.90 0.00 245)',
    '--input': 'oklch(0.92 0.00 245)',
    '--ring': 'oklch(0 0.00 0)',
    '--radius': '0.5rem',
  },
  'cmkjubmo7000604jpa4iidt1u': {
    '--background': 'oklch(1 0.00 245)',
    '--foreground': 'oklch(0.10 0.00 245)',
    '--card': 'oklch(1 0.00 245)',
    '--card-foreground': 'oklch(0.10 0.00 245)',
    '--popover': 'oklch(1 0.00 245)',
    '--popover-foreground': 'oklch(0.10 0.00 245)',
    '--primary': 'oklch(0.10 0.00 245)',
    '--primary-foreground': 'oklch(0.98 0.00 245)',
    '--secondary': 'oklch(0.96 0.00 245)',
    '--secondary-foreground': 'oklch(0.10 0.00 245)',
    '--muted': 'oklch(0.96 0.00 245)',
    '--muted-foreground': 'oklch(0.45 0.00 245)',
    '--accent': 'oklch(0.96 0.00 245)',
    '--accent-foreground': 'oklch(0.10 0.00 245)',
    '--destructive': 'oklch(0.41 0.25 5)',
    '--destructive-foreground': 'oklch(1 0.00 245)',
    '--border': 'oklch(0.90 0.00 245)',
    '--input': 'oklch(0.90 0.00 245)',
    '--ring': 'oklch(0.63 0.00 245)',
    '--radius': '0.5rem',
  },
}

/**
 * Apply a theme's CSS variables to the document root.
 */
export function applyTheme(theme: DashboardTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const normalizedTheme = normalizeDashboardTheme(theme)
  const palette = THEME_PALETTES[normalizedTheme]
  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(key, value)
  }
  root.setAttribute('data-theme', normalizedTheme)
}

export function serializeThemeVars(theme: DashboardTheme | string | null | undefined): string {
  const palette = THEME_PALETTES[normalizeDashboardTheme(theme)]
  return Object.entries(palette)
    .map(([key, value]) => `root.style.setProperty('${key}', '${value}')`)
    .join(';')
}
