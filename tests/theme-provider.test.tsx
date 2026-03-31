// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from '@/context/theme-provider'

function ThemeProbe() {
  const {
    theme,
    effectiveTheme,
    toggleTheme,
    setTheme,
  } = useTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="effectiveTheme">{effectiveTheme}</span>
      <button data-testid="toggleTheme" onClick={toggleTheme} type="button">
        toggle
      </button>
      <button data-testid="setDark" onClick={() => setTheme('dark')} type="button">
        dark
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
  })

  it('always provides dark theme (fixed dark-only provider)', async () => {
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

    expect(theme?.textContent).toBe('dark')
    expect(effectiveTheme?.textContent).toBe('dark')
  })

  it('remains dark after toggleTheme (no-op in fixed dark mode)', async () => {
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
    const toggleTheme = container.querySelector('[data-testid="toggleTheme"]') as HTMLButtonElement

    expect(theme?.textContent).toBe('dark')

    await act(async () => {
      toggleTheme.click()
    })

    expect(theme?.textContent).toBe('dark')
  })

  it('remains dark after setTheme (no-op in fixed dark mode)', async () => {
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
    const setDark = container.querySelector('[data-testid="setDark"]') as HTMLButtonElement

    await act(async () => {
      setDark.click()
    })

    expect(theme?.textContent).toBe('dark')
  })
})
