import { describe, expect, it } from 'vitest'
import { DEFAULT_OPEN_GROUPS } from '../use-sidebar-nav'

describe('DEFAULT_OPEN_GROUPS', () => {
  it('should contain Workspace', () => {
    expect(DEFAULT_OPEN_GROUPS.has('Workspace')).toBe(true)
  })

  it('should contain Review', () => {
    expect(DEFAULT_OPEN_GROUPS.has('Review')).toBe(true)
  })

  it('should contain Tools', () => {
    expect(DEFAULT_OPEN_GROUPS.has('Tools')).toBe(true)
  })

  it('should not contain random groups', () => {
    expect(DEFAULT_OPEN_GROUPS.has('Random')).toBe(false)
  })
})