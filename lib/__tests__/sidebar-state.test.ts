import { describe, expect, it } from 'vitest'

import { parseSidebarStateCookieValue } from '@/lib/sidebar-state'

describe('parseSidebarStateCookieValue', () => {
  it('defaults to open when the cookie is missing', () => {
    expect(parseSidebarStateCookieValue(undefined)).toBe(true)
    expect(parseSidebarStateCookieValue(null)).toBe(true)
  })

  it('keeps the sidebar collapsed only when the cookie explicitly stores false', () => {
    expect(parseSidebarStateCookieValue('false')).toBe(false)
  })

  it('treats any non-false cookie value as open', () => {
    expect(parseSidebarStateCookieValue('true')).toBe(true)
    expect(parseSidebarStateCookieValue('unexpected')).toBe(true)
  })
})
