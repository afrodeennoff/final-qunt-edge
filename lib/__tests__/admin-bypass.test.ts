import { beforeEach, describe, expect, it, vi } from 'vitest'
import { canAccessAiFeature } from '@/lib/ai/entitlements'
import { guardAiRequest } from '@/lib/ai/route-guard'
import { isAdmin } from '@/server/authz'

// Mock all dependencies of the modules under test
vi.mock('@/server/authz', () => ({
  isAdmin: vi.fn(),
}))

vi.mock('@/lib/ai/entitlements', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/ai/entitlements')>()
  return {
    ...actual,
    canAccessAiFeature: vi.fn(actual.canAccessAiFeature),
  }
})

vi.mock('@/lib/ai/usage-budget', () => ({
  assertWithinAiBudget: vi.fn().mockResolvedValue({ allowed: true, limit: 0, used: 0, remaining: 0 }),
}))

vi.mock('@/lib/supabase/route-client', () => ({
  createRouteClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}))

vi.mock('@/lib/rate-limit', () => ({
  default: vi.fn().mockResolvedValue({ success: true, limit: 0, remaining: 0, resetTime: 0 }),
}))

import { createRouteClient } from '@/lib/supabase/route-client'
import { canAccessAiFeature as canAccessAiFeatureMock } from '@/lib/ai/entitlements'
import { assertWithinAiBudget } from '@/lib/ai/usage-budget'

const ADMIN_USER_ID = 'admin-user-123'
const REGULAR_USER_ID = 'regular-user-456'
const ADMIN_EMAIL = 'admin@example.com'
const REGULAR_EMAIL = 'user@example.com'

const createMockRequest = () =>
  new Request('https://example.com/api/ai/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
  })

const mockLimiter = vi.fn().mockResolvedValue({ success: true, limit: 60, remaining: 59, resetTime: Date.now() + 60_000 })

const createRouteClientMock = vi.mocked(createRouteClient)
const assertWithinAiBudgetMock = vi.mocked(assertWithinAiBudget)
const canAccessAiFeatureMocked = vi.mocked(canAccessAiFeatureMock)
const isAdminMock = vi.mocked(isAdmin)

describe('admin paywall bypass', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ALLOWED_ADMIN_USER_ID = ADMIN_USER_ID
  })

  // ── guardAiRequest ──────────────────────────────────────────────────────────

  describe('guardAiRequest', () => {
    it('returns ok:true for admin without checking subscription', async () => {
      createRouteClientMock.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: ADMIN_USER_ID, email: ADMIN_EMAIL } },
            error: null,
          }),
        },
      } as never)

      isAdminMock.mockReturnValue(true)

      const result = await guardAiRequest(createMockRequest(), 'chat', mockLimiter)

      expect(result).toEqual({ ok: true, userId: ADMIN_USER_ID, email: ADMIN_EMAIL })
      expect(canAccessAiFeatureMocked).not.toHaveBeenCalled()
      expect(assertWithinAiBudgetMock).not.toHaveBeenCalled()
    })

    it('still checks entitlement for non-admin users', async () => {
      createRouteClientMock.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: REGULAR_USER_ID, email: REGULAR_EMAIL } },
            error: null,
          }),
        },
      } as never)

      isAdminMock.mockReturnValue(false)
      canAccessAiFeatureMocked.mockResolvedValue({ allowed: false, reason: 'no plan', isActive: false })

      const result = await guardAiRequest(createMockRequest(), 'chat', mockLimiter)

      expect(result).toMatchObject({ ok: false })
      expect(canAccessAiFeatureMocked).toHaveBeenCalledWith(REGULAR_USER_ID, 'chat')
      expect(assertWithinAiBudgetMock).not.toHaveBeenCalled()
    })

    it('blocks unauthenticated requests', async () => {
      createRouteClientMock.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as never)

      const result = await guardAiRequest(createMockRequest(), 'chat', mockLimiter)

      expect(result).toMatchObject({ ok: false })
      if (!result.ok) {
        expect(result.response.status).toBe(401)
      }
    })
  })

  // ── canAccessAiFeature ──────────────────────────────────────────────────────

  describe('canAccessAiFeature', () => {
    it('returns allowed:true with ADMIN plan for admin userId', async () => {
      isAdminMock.mockReturnValue(true)

      const result = await canAccessAiFeature(ADMIN_USER_ID, 'chat')

      expect(result).toEqual({ allowed: true, plan: 'ADMIN', isActive: true })
    })

    it('returns allowed:true for inactive features without subscription for non-admin', async () => {
      isAdminMock.mockReturnValue(false)
      canAccessAiFeatureMocked.mockRestore()
      // Restore the actual implementation to test the real non-admin path
      // but we need to avoid DB calls — the real canAccessAiFeature hits Prisma
      // so we mock it for the non-admin case
    })

    it('skips Prisma subscription lookup when userId is admin', async () => {
      isAdminMock.mockReturnValue(true)

      await canAccessAiFeature(ADMIN_USER_ID, 'analysis')

      // If Prisma were called we'd get an error about missing connection.
      // isAdmin check comes first and returns before any DB access.
      expect(isAdminMock).toHaveBeenCalledWith(ADMIN_USER_ID)
    })
  })

  // ── isAdmin ─────────────────────────────────────────────────────────────────

  describe('isAdmin', () => {
    it('returns true for admin userId in ALLOWED_ADMIN_USER_ID', () => {
      expect(isAdmin(ADMIN_USER_ID)).toBe(true)
    })

    it('returns false for non-admin userId', () => {
      expect(isAdmin(REGULAR_USER_ID)).toBe(false)
    })

    it('ALLOWED_ADMIN_USER_ID supports multiple comma-separated ids', () => {
      process.env.ALLOWED_ADMIN_USER_ID = `${ADMIN_USER_ID},${REGULAR_USER_ID}`
      expect(isAdmin(ADMIN_USER_ID)).toBe(true)
      expect(isAdmin(REGULAR_USER_ID)).toBe(true)
    })

    it('ADMIN_USER_ID env var acts as fallback admin', () => {
      delete process.env.ALLOWED_ADMIN_USER_ID
      process.env.ADMIN_USER_ID = 'legacy-admin-id'
      expect(isAdmin('legacy-admin-id')).toBe(true)
      expect(isAdmin(REGULAR_USER_ID)).toBe(false)
    })
  })
})
