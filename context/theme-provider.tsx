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

type Theme = 'dark'

const INTERFACE_THEME: Theme = 'dark'

const THEME_STORAGE_KEY = 'theme'
const DEFAULT_THEME: Theme = INTERFACE_THEME

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
  void theme
  void prefersDark
  return INTERFACE_THEME
}

function isValidTheme(value: string | null): value is Theme {
  return value === INTERFACE_THEME
}

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isValidTheme(savedTheme)) {
      return savedTheme
    }
  }
  return DEFAULT_THEME
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
  const effectiveTheme = resolveEffectiveTheme(theme, true)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dashboardScope = scope // Reserved for future use

  useLayoutEffect(() => {
    applyThemeToDocument(effectiveTheme)
  }, [effectiveTheme])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    void newTheme
    setThemeState(INTERFACE_THEME)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(INTERFACE_THEME)
  }, [])

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
