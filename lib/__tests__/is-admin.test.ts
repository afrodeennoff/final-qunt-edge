import { describe, expect, it } from 'vitest'
import { isAdmin } from '@/server/authz'

const ADMIN_ID = 'admin-uid'
const REGULAR_ID = 'regular-uid'

describe('isAdmin', () => {
  it('returns true for userId in ALLOWED_ADMIN_USER_ID', () => {
    process.env.ALLOWED_ADMIN_USER_ID = `${ADMIN_ID},other-admin`
    expect(isAdmin(ADMIN_ID)).toBe(true)
  })

  it('returns false for userId not in ALLOWED_ADMIN_USER_ID', () => {
    process.env.ALLOWED_ADMIN_USER_ID = 'another-admin-id'
    expect(isAdmin(REGULAR_ID)).toBe(false)
  })

  it('ADMIN_USER_ID acts as fallback single-admin env var', () => {
    delete process.env.ALLOWED_ADMIN_USER_ID
    process.env.ADMIN_USER_ID = 'legacy-admin-id'
    expect(isAdmin('legacy-admin-id')).toBe(true)
    expect(isAdmin(REGULAR_ID)).toBe(false)
  })

  it('is case-insensitive for ALLOWED_ADMIN_USER_ID', () => {
    process.env.ALLOWED_ADMIN_USER_ID = 'ADMIN-UID'
    expect(isAdmin('admin-uid')).toBe(true)
  })
})
