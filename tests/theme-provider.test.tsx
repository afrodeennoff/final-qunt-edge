// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from '@/context/theme-provider'
import { ThemeSwitcher } from '@/components/theme-switcher'

function ThemeProbe() {
  const {
    theme,
    effectiveTheme,
    toggleTheme,
    setTheme,
    setColorTheme,
    setDashboardTheme,
    setIntensity,
    colorTheme,
    dashboardTheme,
    intensity,
    isThemeMutable,
  } = useTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="effectiveTheme">{effectiveTheme}</span>
      <span data-testid="colorTheme">{colorTheme}</span>
      <span data-testid="dashboardTheme">{dashboardTheme}</span>
      <span data-testid="intensity">{intensity}</span>
      <span data-testid="isThemeMutable">{String(isThemeMutable)}</span>
      <button data-testid="toggleTheme" onClick={toggleTheme} type="button">
        toggle
      </button>
      <button data-testid="setDark" onClick={() => setTheme('dark')} type="button">
        dark
      </button>
      <button data-testid="setSystem" onClick={() => setTheme('system')} type="button">
        system
      </button>
      <button data-testid="setColorTheme" onClick={() => setColorTheme('tiesen')} type="button">
        color
      </button>
      <button data-testid="setDashboardTheme" onClick={() => setDashboardTheme('rose')} type="button">
        dashboard
      </button>
      <button data-testid="setIntensity" onClick={() => setIntensity(95)} type="button">
        intensity
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount()
      })
    }
    container?.remove()
    container = null
    root = null
    localStorage.clear()
  })

  it('resolves system theme and toggles from effective system theme', async () => {
    localStorage.setItem('theme', 'system')

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root!.render(
        <ThemeProvider scope="dashboard">
          <ThemeProbe />
        </ThemeProvider>,
      )
    })

    const theme = container.querySelector('[data-testid="theme"]')
    const effectiveTheme = container.querySelector('[data-testid="effectiveTheme"]')
    const toggleTheme = container.querySelector('[data-testid="toggleTheme"]') as HTMLButtonElement

    expect(theme?.textContent).toBe('system')
    expect(effectiveTheme?.textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await act(async () => {
      toggleTheme.click()
    })

    expect(theme?.textContent).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('forces light default theme when scope is non-dashboard', async () => {
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('dashboard-theme', 'rose')
    localStorage.setItem('intensity', '92')

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root!.render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      )
    })

    const theme = container.querySelector('[data-testid="theme"]')
    const effectiveTheme = container.querySelector('[data-testid="effectiveTheme"]')
    const colorTheme = container.querySelector('[data-testid="colorTheme"]')
    const dashboardTheme = container.querySelector('[data-testid="dashboardTheme"]')
    const intensity = container.querySelector('[data-testid="intensity"]')
    const isThemeMutable = container.querySelector('[data-testid="isThemeMutable"]')
    const toggleTheme = container.querySelector('[data-testid="toggleTheme"]') as HTMLButtonElement
    const setDark = container.querySelector('[data-testid="setDark"]') as HTMLButtonElement
    const setSystem = container.querySelector('[data-testid="setSystem"]') as HTMLButtonElement
    const setColorTheme = container.querySelector('[data-testid="setColorTheme"]') as HTMLButtonElement
    const setDashboardTheme = container.querySelector('[data-testid="setDashboardTheme"]') as HTMLButtonElement
    const setIntensity = container.querySelector('[data-testid="setIntensity"]') as HTMLButtonElement

    expect(theme?.textContent).toBe('light')
    expect(effectiveTheme?.textContent).toBe('light')
    expect(colorTheme?.textContent).toBe('default')
    expect(dashboardTheme?.textContent).toBe('blue')
    expect(intensity?.textContent).toBe('100')
    expect(isThemeMutable?.textContent).toBe('false')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.hasAttribute('data-dashboard-theme')).toBe(false)
    expect(document.documentElement.className.includes('dashboard-theme-')).toBe(false)

    await act(async () => {
      toggleTheme.click()
      setDark.click()
      setSystem.click()
      setColorTheme.click()
      setDashboardTheme.click()
      setIntensity.click()
    })

    expect(theme?.textContent).toBe('light')
    expect(effectiveTheme?.textContent).toBe('light')
    expect(colorTheme?.textContent).toBe('default')
    expect(dashboardTheme?.textContent).toBe('blue')
    expect(intensity?.textContent).toBe('100')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(localStorage.getItem('dashboard-theme')).toBe('rose')
    expect(localStorage.getItem('intensity')).toBe('92')
  })

  it('applies persisted dashboard palette class only in dashboard scope', async () => {
    localStorage.setItem('theme', 'light')
    localStorage.setItem('dashboard-theme', 'violet')

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root!.render(
        <ThemeProvider scope="dashboard">
          <ThemeProbe />
        </ThemeProvider>,
      )
    })

    expect(document.documentElement.getAttribute('data-dashboard-theme')).toBe('violet')
    expect(document.documentElement.classList.contains('dashboard-theme-violet')).toBe(true)
  })

  it('exposes an accessible label for the theme switcher trigger', async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root!.render(
        <ThemeProvider scope="dashboard">
          <ThemeSwitcher />
        </ThemeProvider>,
      )
    })

    const trigger = container.querySelector('button')
    const label = trigger?.getAttribute('aria-label') ?? trigger?.textContent ?? ''

    expect(trigger).not.toBeNull()
    expect(label.toLowerCase()).toContain('toggle theme')
  })
})
