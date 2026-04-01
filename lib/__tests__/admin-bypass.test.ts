import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/server/authz', () => ({
  isAdmin: vi.fn(),
}))

vi.mock('@/lib/supabase/route-client', () => ({
  createRouteClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
  })),
}))

vi.mock('@/lib/rate-limit', () => ({
  default: vi.fn().mockResolvedValue({ success: true, limit: 60, remaining: 59, resetTime: 0 }),
}))

vi.mock('@/lib/ai/usage-budget', () => ({
  assertWithinAiBudget: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('@/server/subscription', () => ({
  getSubscriptionDetails: vi.fn().mockResolvedValue(null),
}))

import { guardAiRequest } from '@/lib/ai/route-guard'
import { canAccessAiFeature } from '@/lib/ai/entitlements'
import { createRouteClient } from '@/lib/supabase/route-client'
import { assertWithinAiBudget } from '@/lib/ai/usage-budget'
import { getSubscriptionDetails } from '@/server/subscription'
import { prisma } from '@/lib/prisma'
import { isAdmin as isAdminFn } from '@/server/authz'

const ADMIN_ID = 'admin-uid'
const REGULAR_ID = 'regular-uid'
const ADMIN_EMAIL = 'admin@example.com'
const REGULAR_EMAIL = 'user@example.com'

const createMockRequest = () =>
  new Request('https://example.com/api/ai/chat', { method: 'POST' })

const mockLimiter = vi.fn().mockResolvedValue({ success: true, limit: 60, remaining: 59, resetTime: 0 })
const isAdminMock = vi.mocked(isAdminFn)
const createRouteClientMock = vi.mocked(createRouteClient)
const assertWithinAiBudgetMock = vi.mocked(assertWithinAiBudget)
const getSubscriptionDetailsMock = vi.mocked(getSubscriptionDetails)
const prismaSubscriptionFindFirstMock = vi.mocked(prisma.subscription.findFirst)

describe('admin paywall bypass', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isAdminMock.mockReset()
    delete process.env.ALLOWED_ADMIN_USER_ID
    delete process.env.ADMIN_USER_ID
  })

  describe('guardAiRequest', () => {
    it('returns ok:true for admin without calling entitlement or budget checks', async () => {
      createRouteClientMock.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: ADMIN_ID, email: ADMIN_EMAIL } },
            error: null,
          }),
        },
      } as never)

      isAdminMock.mockReturnValue(true)

      const result = await guardAiRequest(createMockRequest(), 'chat', mockLimiter)

      expect(result).toEqual({ ok: true, userId: ADMIN_ID, email: ADMIN_EMAIL })
      expect(assertWithinAiBudgetMock).not.toHaveBeenCalled()
      expect(mockLimiter).not.toHaveBeenCalled()
    })

    it('blocks non-admin when entitlement is denied', async () => {
      createRouteClientMock.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: REGULAR_ID, email: REGULAR_EMAIL } },
            error: null,
          }),
        },
      } as never)

      isAdminMock.mockReturnValue(false)
      prismaSubscriptionFindFirstMock.mockResolvedValue(null)
      getSubscriptionDetailsMock.mockResolvedValue(null)

      const result = await guardAiRequest(createMockRequest(), 'chat', mockLimiter)

      expect(result).toMatchObject({ ok: false })
      if (!result.ok) {
        expect(result.response.status).toBe(403)
      }
    })

    it('returns 401 for unauthenticated requests', async () => {
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

  describe('canAccessAiFeature', () => {
    it('returns allowed:true with ADMIN plan for admin userId', async () => {
      isAdminMock.mockReturnValue(true)

      const result = await canAccessAiFeature(ADMIN_ID, 'chat')

      expect(result).toEqual({ allowed: true, plan: 'ADMIN', isActive: true })
    })

    it('non-admin still blocked appropriately', async () => {
      isAdminMock.mockReturnValue(false)
      prismaSubscriptionFindFirstMock.mockResolvedValue(null)
      getSubscriptionDetailsMock.mockResolvedValue(null)

      const result = await canAccessAiFeature(REGULAR_ID, 'chat')

      expect(result.allowed).toBe(false)
      expect(result.isActive).toBe(false)
    })
  })

})
