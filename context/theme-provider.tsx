'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

type Theme = 'light' | 'dark' | 'system'
type ColorTheme = 'default' | 'tiesen'
type ThemeScope = 'dashboard' | 'fixed-blue'
export const DASHBOARD_THEMES = ['blue', 'violet', 'emerald', 'amber', 'rose'] as const
export type DashboardTheme = (typeof DASHBOARD_THEMES)[number]
const DASHBOARD_THEME_CLASS_PREFIX = 'dashboard-theme-'

const THEME_STORAGE_KEY = 'theme'
const INTENSITY_STORAGE_KEY = 'intensity'
const DASHBOARD_THEME_STORAGE_KEY = 'dashboard-theme'
const DEFAULT_INTENSITY = 100
const DEFAULT_NON_DASHBOARD_THEME: Theme = 'light'
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
  effectiveTheme: 'light',
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

function resolveEffectiveTheme(theme: Theme, prefersDark: boolean): 'light' | 'dark' {
  if (theme === 'system') {
    return prefersDark ? 'dark' : 'light'
  }

  return theme
}

function isValidTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function isValidDashboardTheme(value: string | null): value is DashboardTheme {
  return typeof value === 'string' && DASHBOARD_THEMES.includes(value as DashboardTheme)
}

function clampIntensity(intensity: number): number {
  if (!Number.isFinite(intensity)) {
    return DEFAULT_INTENSITY
  }

  return Math.max(90, Math.min(100, Math.round(intensity)))
}

function mapLegacyColorThemeToDashboardTheme(colorTheme: ColorTheme): DashboardTheme {
  return colorTheme === 'tiesen' ? 'violet' : 'blue'
}

function mapDashboardThemeToLegacyColorTheme(dashboardTheme: DashboardTheme): ColorTheme {
  return dashboardTheme === 'violet' ? 'tiesen' : 'default'
}

function getInitialTheme(scope: ThemeScope): Theme {
  if (scope !== 'dashboard' || typeof window === 'undefined') {
    return DEFAULT_NON_DASHBOARD_THEME
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isValidTheme(savedTheme) ? savedTheme : 'system'
}

function getInitialDashboardTheme(scope: ThemeScope): DashboardTheme {
  if (scope !== 'dashboard' || typeof window === 'undefined') {
    return DEFAULT_DASHBOARD_THEME
  }

  // First try localStorage for immediate theme (server-side DB fetch happens asynchronously)
  const savedDashboardTheme = window.localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY)
  if (isValidDashboardTheme(savedDashboardTheme)) {
    return savedDashboardTheme
  }
  
  return DEFAULT_DASHBOARD_THEME
}

// Fetch theme from database API (called separately for async loading)
async function fetchDashboardThemeFromDatabase(): Promise<DashboardTheme | null> {
  if (typeof window === 'undefined') return null
  
  try {
    const response = await fetch('/api/user/theme', {
      method: 'GET',
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      if (data.theme && isValidDashboardTheme(data.theme)) {
        return data.theme
      }
    }
  } catch (error) {
    console.warn('[ThemeProvider] Failed to fetch theme from database:', error)
  }
  return null
}

function getInitialIntensity(scope: ThemeScope): number {
  if (scope !== 'dashboard' || typeof window === 'undefined') {
    return DEFAULT_INTENSITY
  }

  const savedIntensity = Number(window.localStorage.getItem(INTENSITY_STORAGE_KEY))
  return clampIntensity(savedIntensity)
}

function getInitialSystemPreference(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyThemeToDocument(theme: 'light' | 'dark'): void {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

function applyDashboardThemeToDocument(scope: ThemeScope, dashboardTheme: DashboardTheme): void {
  const root = window.document.documentElement
  root.removeAttribute('data-theme')
  root.classList.remove(
    `${DASHBOARD_THEME_CLASS_PREFIX}blue`,
    `${DASHBOARD_THEME_CLASS_PREFIX}violet`,
    `${DASHBOARD_THEME_CLASS_PREFIX}emerald`,
    `${DASHBOARD_THEME_CLASS_PREFIX}amber`,
    `${DASHBOARD_THEME_CLASS_PREFIX}rose`
  )

  if (scope !== 'dashboard' || dashboardTheme === DEFAULT_DASHBOARD_THEME) {
    root.removeAttribute('data-dashboard-theme')
    return
  }

  root.classList.add(`${DASHBOARD_THEME_CLASS_PREFIX}${dashboardTheme}`)
  root.setAttribute('data-dashboard-theme', dashboardTheme)
}

function applyIntensityToDocument(scope: ThemeScope, intensity: number): void {
  const root = window.document.documentElement
  const effectiveIntensity = scope === 'dashboard' ? clampIntensity(intensity) : DEFAULT_INTENSITY
  root.style.setProperty('--theme-intensity', `${effectiveIntensity}%`)
}

export function ThemeProvider({
  children,
  scope = 'fixed-blue',
}: {
  children: React.ReactNode
  scope?: ThemeScope
}) {
  const isThemeMutable = scope === 'dashboard'
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme(scope))
  const [dashboardTheme, setDashboardThemeState] = useState<DashboardTheme>(() => getInitialDashboardTheme(scope))
  const [intensity, setIntensityState] = useState<number>(() => getInitialIntensity(scope))
  const [prefersDark, setPrefersDark] = useState<boolean>(getInitialSystemPreference)
  const appliedTheme: Theme = isThemeMutable ? theme : DEFAULT_NON_DASHBOARD_THEME
  const appliedDashboardTheme: DashboardTheme = isThemeMutable ? dashboardTheme : DEFAULT_DASHBOARD_THEME
  const appliedIntensity = isThemeMutable ? intensity : DEFAULT_INTENSITY
  const effectiveTheme = resolveEffectiveTheme(appliedTheme, prefersDark)

  // Apply document-level theme styles before paint to avoid route flicker.
  useLayoutEffect(() => {
    applyThemeToDocument(effectiveTheme)
    applyDashboardThemeToDocument(scope, appliedDashboardTheme)
    applyIntensityToDocument(scope, appliedIntensity)
  }, [
    appliedDashboardTheme,
    appliedIntensity,
    effectiveTheme,
    scope,
  ])

  useEffect(() => {
    if (!isThemeMutable) {
      return
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme)
    localStorage.setItem(INTENSITY_STORAGE_KEY, intensity.toString())
    localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, dashboardTheme)
  }, [
    dashboardTheme,
    intensity,
    isThemeMutable,
    theme,
  ])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!isThemeMutable || typeof window === 'undefined') {
      return
    }

    let mounted = true

    const syncWithDatabase = async () => {
      const dbTheme = await fetchDashboardThemeFromDatabase()
      if (mounted && dbTheme && dbTheme !== dashboardTheme) {
        setDashboardThemeState(dbTheme)
        localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, dbTheme)
      }
    }

    syncWithDatabase()

    return () => {
      mounted = false
    }
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    if (!isThemeMutable) {
      return
    }
    setThemeState(newTheme)
  }, [isThemeMutable])

  const setColorTheme = useCallback((newColorTheme: ColorTheme) => {
    if (!isThemeMutable) {
      return
    }
    setDashboardThemeState(mapLegacyColorThemeToDashboardTheme(newColorTheme))
  }, [isThemeMutable])

  const setDashboardTheme = useCallback(async (newDashboardTheme: DashboardTheme) => {
    if (!isThemeMutable) {
      return
    }
    
    setDashboardThemeState(newDashboardTheme)
    localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, newDashboardTheme)
    
    try {
      await fetch('/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newDashboardTheme }),
        credentials: 'include',
      })
    } catch (error) {
      console.warn('[ThemeProvider] Failed to save theme to database:', error)
    }
  }, [isThemeMutable])

  const setIntensity = useCallback((newIntensity: number) => {
    if (!isThemeMutable) {
      return
    }
    setIntensityState(clampIntensity(newIntensity))
  }, [isThemeMutable])

  const toggleTheme = useCallback(() => {
    if (!isThemeMutable) {
      return
    }

    setThemeState(prevTheme => {
      if (prevTheme === 'system') {
        return effectiveTheme === 'light' ? 'dark' : 'light'
      }
      return prevTheme === 'light' ? 'dark' : 'light'
    })
  }, [effectiveTheme, isThemeMutable])

  const colorTheme = mapDashboardThemeToLegacyColorTheme(appliedDashboardTheme)

  const value = useMemo(() => ({
    theme: appliedTheme,
    effectiveTheme,
    colorTheme,
    dashboardTheme: appliedDashboardTheme,
    intensity: appliedIntensity,
    setTheme,
    setColorTheme,
    setDashboardTheme,
    setIntensity,
    toggleTheme,
    isThemeMutable,
  }), [
    appliedDashboardTheme,
    appliedIntensity,
    appliedTheme,
    colorTheme,
    effectiveTheme,
    isThemeMutable,
    setColorTheme,
    setDashboardTheme,
    setIntensity,
    setTheme,
    toggleTheme,
  ])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
