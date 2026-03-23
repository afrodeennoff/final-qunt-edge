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

export const DASHBOARD_THEMES = [
  { value: 'dark', label: 'Dark', primary: '#171717' },
  { value: 'light', label: 'Light', primary: '#ffffff' },
  { value: 'system', label: 'System', primary: 'auto' },
] as const

const THEME_STORAGE_KEY = 'theme'
const DEFAULT_THEME: Theme = 'dark'

type ThemeContextType = {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  effectiveTheme: 'dark',
  setTheme: () => { },
  toggleTheme: () => { },
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

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isValidTheme(savedTheme) ? savedTheme : DEFAULT_THEME
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

export function ThemeProvider({
  children,
  scope,
}: {
  children: React.ReactNode
  scope?: 'dashboard' | 'fixed-blue'
}) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [prefersDark, setPrefersDark] = useState<boolean>(getInitialSystemPreference)
  const effectiveTheme = resolveEffectiveTheme(theme, prefersDark)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dashboardScope = scope // Reserved for future use

  useLayoutEffect(() => {
    applyThemeToDocument(effectiveTheme)
  }, [effectiveTheme])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => {
      if (prevTheme === 'system') {
        return effectiveTheme === 'light' ? 'dark' : 'light'
      }
      return prevTheme === 'light' ? 'dark' : 'light'
    })
  }, [effectiveTheme])

  const value = useMemo(() => ({
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  }), [theme, effectiveTheme, setTheme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
