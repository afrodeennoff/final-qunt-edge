import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getUserIdMock, getDatabaseUserIdMock, findUniqueMock } = vi.hoisted(() => ({
  getUserIdMock: vi.fn(),
  getDatabaseUserIdMock: vi.fn(),
  findUniqueMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  getUserId: getUserIdMock,
  getDatabaseUserId: getDatabaseUserIdMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    dashboardLayout: {
      findUnique: findUniqueMock,
    },
  },
}))

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  updateTag: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('@/server/shared', () => ({
  getShared: vi.fn(),
}))

vi.mock('@/locales/server', () => ({
  getCurrentLocale: vi.fn(async () => 'en'),
}))

vi.mock('@/lib/feature-flags', () => ({
  FEATURE_FLAGS: {
    ENABLE_QUERY_CACHING: false,
  },
}))

import { getDashboardLayout } from '@/server/user-data'

describe('getDashboardLayout isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserIdMock.mockResolvedValue('auth-user-a')
    getDatabaseUserIdMock.mockResolvedValue('db-user-a')
    findUniqueMock.mockResolvedValue({
      id: 'layout-a',
      userId: 'auth-user-a',
      desktop: [],
      mobile: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  it('rejects cross-user dashboard layout reads', async () => {
    await expect(getDashboardLayout('auth-user-b')).rejects.toThrow('Forbidden')
  })

  it('accepts the resolved database user id but reads the auth-keyed layout row', async () => {
    const result = await getDashboardLayout('db-user-a')

    expect(result?.userId).toBe('auth-user-a')
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { userId: 'auth-user-a' },
    })
  })
})
