import { describe, expect, it } from 'vitest'
import { shouldSkipLocalePrefix } from '@/lib/locale-path'

describe('shouldSkipLocalePrefix', () => {
  it('skips locale prefix for oauth consent', () => {
    expect(shouldSkipLocalePrefix('/oauth/consent')).toBe(true)
    expect(shouldSkipLocalePrefix('/oauth/consent?authorization_id=abc')).toBe(true)
  })

  it('does not skip dashboard paths', () => {
    expect(shouldSkipLocalePrefix('/dashboard')).toBe(false)
    expect(shouldSkipLocalePrefix('/en/dashboard')).toBe(false)
  })
})