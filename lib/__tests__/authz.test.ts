import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/server/auth', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/server/auth'
import { assertAdminAccess, requireCronAuth, toErrorResponse } from '@/server/authz'

describe('authz', () => {
  const createClientMock = vi.mocked(createClient)

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ALLOWED_ADMIN_USER_ID
    delete process.env.ADMIN_EMAIL_DOMAINS
    delete process.env.CRON_SECRET
    delete process.env.VERCEL_CRON_SECRET
  })

  it('allows admin by user id', async () => {
    process.env.ALLOWED_ADMIN_USER_ID = 'admin-user-id'
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-user-id', email: 'user@example.com' } },
        }),
      },
    } as never)

    const result = await assertAdminAccess('req-admin-id')
    expect(result.userId).toBe('admin-user-id')
    expect(result.requestId).toBe('req-admin-id')
  })

  it('blocks non-admin users with forbidden response', async () => {
    process.env.ADMIN_EMAIL_DOMAINS = 'admin.example.com'
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'regular-user-id', email: 'user@example.com' } },
        }),
      },
    } as never)

    const error = await assertAdminAccess('req-forbidden').catch((err) => err)
    const response = toErrorResponse(error)
    const payload = (await response.json()) as { code: string; requestId: string }

    expect(response.status).toBe(403)
    expect(payload.code).toBe('AUTH_FORBIDDEN')
    expect(payload.requestId).toBe('req-forbidden')
  })

  it('blocks unauthenticated users with unauthorized response', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as never)

    const error = await assertAdminAccess('req-unauthorized').catch((err) => err)
    const response = toErrorResponse(error)
    const payload = (await response.json()) as { code: string; requestId: string }

    expect(response.status).toBe(401)
    expect(payload.code).toBe('AUTH_UNAUTHORIZED')
    expect(payload.requestId).toBe('req-unauthorized')
  })

  it('accepts bearer auth for cron requests', () => {
    process.env.CRON_SECRET = 'cron-secret'

    const result = requireCronAuth(
      new Request('https://example.com/api/cron/renewal-notice', {
        headers: {
          authorization: 'Bearer cron-secret',
        },
      }),
      { requestId: 'req-cron-bearer', serviceName: 'cron-renewal-notice' }
    )

    expect(result).toEqual({
      service: 'cron-renewal-notice',
      requestId: 'req-cron-bearer',
    })
  })

  it('supports explicit legacy x-vercel-cron secret when configured', () => {
    process.env.CRON_SECRET = 'cron-secret'
    process.env.VERCEL_CRON_SECRET = 'legacy-cron-secret'

    const result = requireCronAuth(
      new Request('https://example.com/api/cron/renewal-notice', {
        headers: {
          'x-vercel-cron': 'legacy-cron-secret',
        },
      }),
      { requestId: 'req-cron-header', serviceName: 'cron-renewal-notice' }
    )

    expect(result).toEqual({
      service: 'cron-renewal-notice',
      requestId: 'req-cron-header',
    })
  })
})
