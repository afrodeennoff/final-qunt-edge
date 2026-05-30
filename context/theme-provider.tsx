'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_DASHBOARD_THEME,
  VALID_DASHBOARD_THEMES,
  applyTheme,
  normalizeDashboardTheme,
  type DashboardTheme,
} from '@/lib/constants/dashboard-themes'

type ThemeContextType = {
  theme: DashboardTheme
  effectiveTheme: DashboardTheme
  setTheme: (theme: DashboardTheme) => void
  toggleTheme: () => void
}

const DEFAULT_THEME: DashboardTheme = DEFAULT_DASHBOARD_THEME

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

    }
  } catch {

  }
}

function resolveTheme(initialTheme?: DashboardTheme | string): DashboardTheme {
  return normalizeDashboardTheme(initialTheme)
}

export function ThemeProvider({
  children,
  scope,
  initialTheme,
}: {
  children: React.ReactNode
  scope?: 'dashboard' | 'fixed-purple'
  initialTheme?: DashboardTheme | string
}) {
  const resolved = resolveTheme(initialTheme)
  const [theme, setThemeState] = useState<DashboardTheme>(resolved)

  const isDashboard = scope === 'dashboard'

  useEffect(() => {
    // Only apply theme CSS variables on dashboard/teams. On public pages
    // (fixed-purple), the CSS defaults in globals.css provide pure #000000
    // background with Neon Green accent tokens — no runtime override needed.
    if (isDashboard) {
      applyTheme(resolved)
    }
  }, [resolved, isDashboard])

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
