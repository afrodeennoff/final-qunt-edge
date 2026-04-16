import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findUniqueMock, warnMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  warnMock: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    warn: warnMock,
    error: vi.fn(),
    info: vi.fn(),
  },
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}))

vi.mock('@/server/auth', () => ({
  getDatabaseUserId: vi.fn(),
  getUserId: vi.fn(),
}))

vi.mock('@/lib/redis-client', () => ({
  invalidateCacheNamespace: vi.fn(),
}))

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
}))

import { resolveWritableUserId } from '@/server/trades'
import { resolveTeamUserId } from '@/server/team-membership'

type FindUniqueArgs = {
  where: {
    id?: string
    auth_user_id?: string
  }
}

function setupUserResolution(rows: { byId?: string | null; byAuthId?: string | null }) {
  findUniqueMock.mockImplementation(async ({ where }: FindUniqueArgs) => {
    if (where.id) return rows.byId ? { id: rows.byId } : null
    if (where.auth_user_id) return rows.byAuthId ? { id: rows.byAuthId } : null
    return null
  })
}

describe('user id resolution precedence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prefers auth_user_id mapping for trades when id/auth rows diverge', async () => {
    setupUserResolution({ byId: 'auth-user-1', byAuthId: 'db-user-1' })

    await expect(resolveWritableUserId('auth-user-1')).resolves.toBe('db-user-1')
    expect(warnMock).toHaveBeenCalledWith(
      '[resolveWritableUserId] Divergent auth mapping detected; using auth_user_id row',
      expect.objectContaining({
        rawUserId: 'auth-user-1',
        resolvedUserId: 'db-user-1',
      }),
    )
  })

  it('prefers auth_user_id mapping for team membership when id/auth rows diverge', async () => {
    setupUserResolution({ byId: 'auth-user-1', byAuthId: 'db-user-1' })

    await expect(resolveTeamUserId('auth-user-1')).resolves.toBe('db-user-1')
  })

  it('uses id mapping when no divergent auth_user_id row exists', async () => {
    setupUserResolution({ byId: 'auth-user-1', byAuthId: null })

    await expect(resolveWritableUserId('auth-user-1')).resolves.toBe('auth-user-1')
    await expect(resolveTeamUserId('auth-user-1')).resolves.toBe('auth-user-1')
  })

  it('throws when neither id nor auth_user_id mapping exists', async () => {
    setupUserResolution({ byId: null, byAuthId: null })

    await expect(resolveWritableUserId('auth-user-1')).rejects.toThrow(
      'Unable to resolve writable user',
    )
    await expect(resolveTeamUserId('auth-user-1')).rejects.toThrow('Unable to resolve user')
  })
})
