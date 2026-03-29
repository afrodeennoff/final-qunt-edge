'use client'

import React, { createContext, useContext } from 'react'

type Theme = 'dark'

type ThemeContextType = {
  theme: Theme
  effectiveTheme: 'dark'
  setTheme: (_theme: Theme) => void
  toggleTheme: () => void
}

const FIXED_THEME: Theme = 'dark'

const noopSetTheme = (_theme: Theme) => {
  void _theme
}

const noopToggleTheme = () => { }

const fixedThemeContextValue: ThemeContextType = {
  theme: FIXED_THEME,
  effectiveTheme: FIXED_THEME,
  setTheme: noopSetTheme,
  toggleTheme: noopToggleTheme,
}

const ThemeContext = createContext<ThemeContextType>(fixedThemeContextValue)

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({
  children,
  scope,
}: {
  children: React.ReactNode
  scope?: 'dashboard' | 'fixed-blue'
}) {
  void scope

  return (
    <ThemeContext.Provider value={fixedThemeContextValue}>
      {children}
    </ThemeContext.Provider>
  )
}
