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
      <button data-testid="setGreen" onClick={() => setTheme('cmlh0x713000104jrgmds6vcd')} type="button">
        green
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

  it('defaults to the trader workspace theme', async () => {
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

    expect(theme?.textContent).toBe('cmlh0x713000104jrgmds6vcd')
    expect(effectiveTheme?.textContent).toBe('cmlh0x713000104jrgmds6vcd')
  })

  it('uses initialTheme when provided', async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root!.render(
        <ThemeProvider initialTheme="cmo6ofmje000104jub1yg4bos">
          <ThemeProbe />
        </ThemeProvider>,
      )
    })

    const theme = container.querySelector('[data-testid="theme"]')
    expect(theme?.textContent).toBe('cmo6ofmje000104jub1yg4bos')
  })

  it('rejects invalid initialTheme', async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root!.render(
        <ThemeProvider initialTheme="dark">
          <ThemeProbe />
        </ThemeProvider>,
      )
    })

    const theme = container.querySelector('[data-testid="theme"]')
    expect(theme?.textContent).toBe('cmlh0x713000104jrgmds6vcd')
  })
})
