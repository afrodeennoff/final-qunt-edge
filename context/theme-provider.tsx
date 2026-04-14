'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { VALID_DASHBOARD_THEMES, applyTheme, type DashboardTheme } from '@/lib/constants/dashboard-themes'

type ThemeContextType = {
  theme: DashboardTheme
  effectiveTheme: DashboardTheme
  setTheme: (theme: DashboardTheme) => void
  toggleTheme: () => void
}

const DEFAULT_THEME: DashboardTheme = 'violet'

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  effectiveTheme: DEFAULT_THEME,
  setTheme: () => { },
  toggleTheme: () => { },
})

export const useTheme = () => useContext(ThemeContext)

async function saveThemeToApi(theme: DashboardTheme): Promise<void> {
  try {
    const response = await fetch('/api/user/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    })
    if (!response.ok) {
      console.error('[ThemeProvider] Failed to save theme:', response.status)
    }
  } catch (error) {
    console.error('[ThemeProvider] Error saving theme:', error)
  }
}

function resolveTheme(initialTheme?: DashboardTheme | string): DashboardTheme {
  return VALID_DASHBOARD_THEMES.includes(initialTheme as DashboardTheme)
    ? (initialTheme as DashboardTheme)
    : DEFAULT_THEME
}

export function ThemeProvider({
  children,
  scope,
  initialTheme,
}: {
  children: React.ReactNode
  scope?: 'dashboard' | 'fixed-blue'
  initialTheme?: DashboardTheme | string
}) {
  const resolved = resolveTheme(initialTheme)
  const [theme, setThemeState] = useState<DashboardTheme>(resolved)

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  const setTheme = useCallback((newTheme: DashboardTheme) => {
    if (!VALID_DASHBOARD_THEMES.includes(newTheme)) return
    setThemeState(newTheme)
    applyTheme(newTheme)
    saveThemeToApi(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const currentIndex = VALID_DASHBOARD_THEMES.indexOf(theme)
    const nextIndex = (currentIndex + 1) % VALID_DASHBOARD_THEMES.length
    setTheme(VALID_DASHBOARD_THEMES[nextIndex])
  }, [theme, setTheme])

  const isDashboard = scope === 'dashboard'

  const contextValue: ThemeContextType = {
    theme,
    effectiveTheme: theme,
    setTheme: isDashboard ? setTheme : () => { },
    toggleTheme: isDashboard ? toggleTheme : () => { },
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}
