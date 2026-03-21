'use client'

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
} from 'react'

type Theme = 'light' | 'dark' | 'system'
type ColorTheme = 'default' | 'tiesen'
type ThemeScope = 'dashboard' | 'fixed-blue'
export const DASHBOARD_THEMES = ['blue', 'violet', 'emerald', 'amber', 'rose'] as const
export type DashboardTheme = (typeof DASHBOARD_THEMES)[number]
const DASHBOARD_THEME_CLASS_PREFIX = 'dashboard-theme-'

const DEFAULT_INTENSITY = 100
const DEFAULT_NON_DASHBOARD_THEME: Theme = 'dark'
const DEFAULT_DASHBOARD_THEME: DashboardTheme = 'blue'

type ThemeContextType = {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  colorTheme: ColorTheme
  dashboardTheme: DashboardTheme
  intensity: number
  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ColorTheme) => void
  setDashboardTheme: (theme: DashboardTheme) => void
  setIntensity: (intensity: number) => void
  toggleTheme: () => void
  isThemeMutable: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_NON_DASHBOARD_THEME,
  effectiveTheme: 'dark',
  colorTheme: 'default',
  dashboardTheme: DEFAULT_DASHBOARD_THEME,
  intensity: DEFAULT_INTENSITY,
  setTheme: () => { },
  setColorTheme: () => { },
  setDashboardTheme: () => { },
  setIntensity: () => { },
  toggleTheme: () => { },
  isThemeMutable: false,
})

export const useTheme = () => useContext(ThemeContext)

function clampIntensity(intensity: number): number {
  if (!Number.isFinite(intensity)) {
    return DEFAULT_INTENSITY
  }

  return Math.max(90, Math.min(100, Math.round(intensity)))
}

function mapDashboardThemeToLegacyColorTheme(dashboardTheme: DashboardTheme): ColorTheme {
  return dashboardTheme === 'violet' ? 'tiesen' : 'default'
}
function applyThemeToDocument(): void {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add('dark')
}

function applyDashboardThemeToDocument(): void {
  const root = window.document.documentElement
  root.removeAttribute('data-theme')
  root.classList.remove(
    `${DASHBOARD_THEME_CLASS_PREFIX}blue`,
    `${DASHBOARD_THEME_CLASS_PREFIX}violet`,
    `${DASHBOARD_THEME_CLASS_PREFIX}emerald`,
    `${DASHBOARD_THEME_CLASS_PREFIX}amber`,
    `${DASHBOARD_THEME_CLASS_PREFIX}rose`
  )

  root.removeAttribute('data-dashboard-theme')
}

function applyIntensityToDocument(intensity: number): void {
  const root = window.document.documentElement
  root.style.setProperty('--theme-intensity', `${clampIntensity(intensity)}%`)
}

export function ThemeProvider({
  children,
  scope = 'fixed-blue',
}: {
  children: React.ReactNode
  scope?: ThemeScope
}) {
  void scope
  const isThemeMutable = false
  const appliedTheme: Theme = DEFAULT_NON_DASHBOARD_THEME
  const appliedDashboardTheme: DashboardTheme = DEFAULT_DASHBOARD_THEME
  const appliedIntensity = DEFAULT_INTENSITY
  const effectiveTheme: 'light' | 'dark' = 'dark'

  useLayoutEffect(() => {
    applyThemeToDocument()
    applyDashboardThemeToDocument()
    applyIntensityToDocument(appliedIntensity)
  }, [
    appliedIntensity,
  ])

  const colorTheme = mapDashboardThemeToLegacyColorTheme(appliedDashboardTheme)

  const value = useMemo(() => ({
    theme: appliedTheme,
    effectiveTheme,
    colorTheme,
    dashboardTheme: appliedDashboardTheme,
    intensity: appliedIntensity,
    setTheme: () => undefined,
    setColorTheme: () => undefined,
    setDashboardTheme: async () => undefined,
    setIntensity: () => undefined,
    toggleTheme: () => undefined,
    isThemeMutable,
  }), [
    appliedDashboardTheme,
    appliedIntensity,
    appliedTheme,
    colorTheme,
    effectiveTheme,
    isThemeMutable,
  ])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
