import { describe, expect, it } from 'vitest'
import { DEFAULT_OPEN_GROUPS } from '../use-sidebar-nav'

describe('DEFAULT_OPEN_GROUPS', () => {
  it('should contain Overview', () => {
    expect(DEFAULT_OPEN_GROUPS.has('Overview')).toBe(true)
  })

  it('should contain Trading', () => {
    expect(DEFAULT_OPEN_GROUPS.has('Trading')).toBe(true)
  })

  it('should contain Analytics', () => {
    expect(DEFAULT_OPEN_GROUPS.has('Analytics')).toBe(true)
  })

  it('should contain System', () => {
    expect(DEFAULT_OPEN_GROUPS.has('System')).toBe(true)
  })

  it('should not contain random groups', () => {
    expect(DEFAULT_OPEN_GROUPS.has('Random')).toBe(false)
  })
})