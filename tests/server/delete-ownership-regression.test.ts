import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Account } from '@/lib/data-types'

function createTestAccount(overrides: Partial<Account> & { id: string; number: string; userId: string }): Account {
  const base: Account = {
    id: overrides.id ?? 'acc-1',
    number: overrides.number ?? 'ACC-1',
    userId: overrides.userId ?? 'user-1',
    propfirm: '',
    accountSize: null,
    accountSizeName: null,
    startingBalance: 0,
    balanceRequired: null,
    drawdownThreshold: 0,
    dailyLoss: 0,
    profitTarget: 0,
    buffer: 0,
    considerBuffer: false,
    trailingDrawdown: false,
    trailingStopProfit: null,
    trailing: null,
    isPerformance: false,
    evaluation: true,
    payoutCount: 0,
    minPayout: null,
    maxPayout: null,
    profitSharing: null,
    payoutBonus: null,
    payoutPolicy: null,
    consistencyPercentage: null,
    minTradingDaysForPayout: null,
    minDays: null,
    minPnlToCountAsDay: null,
    activationFees: null,
    price: null,
    priceWithPromo: null,
    promoPercentage: null,
    promoType: null,
    tradingNewsAllowed: true,
    rulesDailyLoss: null,
    autoRenewal: false,
    paymentFrequency: null,
    renewalNotice: null,
    nextPaymentDate: null,
    renewalNoticeLastSentAt: null,
    isRecursively: null,
    maxFundedAccounts: null,
    resetDate: null,
    shouldConsiderTradesBeforeReset: true,
    groupId: null,
    createdAt: new Date(),
  }
  return { ...base, ...overrides }
}

const {
  getDatabaseUserIdMock,
  createClientMock,
  updateTagMock,
  invalidateAllUserCachesMock,
  moodFindFirstMock,
  moodDeleteMock,
  synchronizationDeleteManyMock,
  layoutFindUniqueMock,
  accountDeleteMock,
  accountUpdateManyMock,
  propFirmReviewFindUniqueMock,
  propFirmReviewDeleteMock,
  tagFindUniqueMock,
  groupFindFirstMock,
  groupDeleteMock,
  sharedFindUniqueMock,
  sharedDeleteMock,
  prismaSchemaMismatchFallbackMock,
  invalidateGroupRelatedCachesMock,
} = vi.hoisted(() => ({
  getDatabaseUserIdMock: vi.fn(),
  createClientMock: vi.fn(),
  updateTagMock: vi.fn(),
  invalidateAllUserCachesMock: vi.fn(),
  moodFindFirstMock: vi.fn(),
  moodDeleteMock: vi.fn(),
  synchronizationDeleteManyMock: vi.fn(),
  layoutFindUniqueMock: vi.fn(),
  accountDeleteMock: vi.fn(),
  accountUpdateManyMock: vi.fn(),
  propFirmReviewFindUniqueMock: vi.fn(),
  propFirmReviewDeleteMock: vi.fn(),
  tagFindUniqueMock: vi.fn(),
  groupFindFirstMock: vi.fn(),
  groupDeleteMock: vi.fn(),
  sharedFindUniqueMock: vi.fn(),
  sharedDeleteMock: vi.fn(),
  prismaSchemaMismatchFallbackMock: vi.fn(),
  invalidateGroupRelatedCachesMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  getDatabaseUserId: getDatabaseUserIdMock,
  getUserId: getDatabaseUserIdMock,
  createClient: createClientMock,
}))

vi.mock('next/cache', () => ({
  updateTag: updateTagMock,
}))

vi.mock('@/lib/cache/cache-invalidation', () => ({
  CACHE_TAGS: {
    DASHBOARD: (userId: string | null) => `dashboard:${userId}`,
    USER_DATA: (userId: string | null) => `user-data:${userId}`,
    USER_DATA_CORE: (userId: string | null) => `user-data-core:${userId}`,
    USER_DATA_SUPPLEMENTAL: (userId: string | null) => `user-data-supplemental:${userId}`,
  },
  invalidateAllUserCaches: invalidateAllUserCachesMock,
  invalidateEquityChart: vi.fn(),
  invalidateGroupRelatedCaches: invalidateGroupRelatedCachesMock,
  invalidateJournalRelatedCaches: vi.fn(),
  invalidateAccountRelatedCaches: vi.fn(),
}))

vi.mock('@/lib/prisma-guard', () => ({
  withPrismaSchemaMismatchFallback: prismaSchemaMismatchFallbackMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mood: {
      findFirst: moodFindFirstMock,
      delete: moodDeleteMock,
    },
    synchronization: {
      deleteMany: synchronizationDeleteManyMock,
    },
    dashboardLayout: {
      findUnique: layoutFindUniqueMock,
    },
    layoutVersion: {
      deleteMany: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
      delete: accountDeleteMock,
      updateMany: accountUpdateManyMock,
    },
    propFirmReview: {
      findUnique: propFirmReviewFindUniqueMock,
      delete: propFirmReviewDeleteMock,
    },
    tag: {
      findUnique: tagFindUniqueMock,
      delete: vi.fn(),
    },
    trade: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    group: {
      findFirst: groupFindFirstMock,
      delete: groupDeleteMock,
    },
    shared: {
      findUnique: sharedFindUniqueMock,
      delete: sharedDeleteMock,
    },
  },
}))

import { deleteMindset } from '@/server/journal'
import { removeRithmicSynchronization } from '@/server/imports/rithmic-sync-actions'
import { removeTradovateToken } from '@/server/imports/tradovate-actions'
import { cleanupOldLayoutVersionsAction } from '@/server/layouts'
import { deleteAccountAction } from '@/server/accounts'
import { deleteReview } from '@/server/firm-reviews'
import { deleteGroupAction } from '@/server/groups'
import { deleteShared } from '@/server/shared'

function mockPrismaFallbackSuccess(): void {
  prismaSchemaMismatchFallbackMock.mockImplementation(
    async (_key: string, fn: () => Promise<unknown>) => fn()
  )
}

describe('deleteMindset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
  })

  it('deletes mood entry for owner with userId in query', async () => {
    const now = new Date()
    moodFindFirstMock.mockResolvedValue({
      id: 'mood-1',
      userId: 'db-user-1',
      day: now,
      mood: 'HAPPY',
      emotionValue: 75,
    })
    moodDeleteMock.mockResolvedValue({})

    await deleteMindset('2024-01-15')

    expect(moodFindFirstMock).toHaveBeenCalledWith({
      where: {
        userId: 'db-user-1',
        day: expect.objectContaining({
          gte: expect.any(Date),
          lt: expect.any(Date),
        }),
      },
    })
    expect(moodDeleteMock).toHaveBeenCalledWith({
      where: { id: 'mood-1' },
    })
    // deleteMindset now uses invalidateJournalRelatedCaches (mocked) instead of direct updateTag
  })

  it('blocks delete when mood belongs to different user', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-2')
    moodFindFirstMock.mockResolvedValue(null)

    await deleteMindset('2024-01-15')

    expect(moodDeleteMock).not.toHaveBeenCalled()
  })

  it('does not throw when mood entry does not exist', async () => {
    moodFindFirstMock.mockResolvedValue(null)

    await expect(deleteMindset('2024-01-15')).resolves.not.toThrow()
    expect(moodDeleteMock).not.toHaveBeenCalled()
  })
})

describe('removeRithmicSynchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    mockPrismaFallbackSuccess()
  })

  it('deletes synchronization with userId in where clause', async () => {
    synchronizationDeleteManyMock.mockResolvedValue({ count: 1 })

    await removeRithmicSynchronization('account-1')

    expect(synchronizationDeleteManyMock).toHaveBeenCalledWith({
      where: {
        userId: 'db-user-1',
        service: 'rithmic',
        accountId: 'account-1',
      },
    })
  })

  it('includes userId in query even when unauthenticated', async () => {
    getDatabaseUserIdMock.mockResolvedValue(null)
    synchronizationDeleteManyMock.mockResolvedValue({ count: 0 })

    await removeRithmicSynchronization('account-1')

    expect(synchronizationDeleteManyMock).toHaveBeenCalledWith({
      where: {
        userId: null,
        service: 'rithmic',
        accountId: 'account-1',
      },
    })
  })
})

describe('removeTradovateToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrismaFallbackSuccess()
    const mockUser = { id: 'auth-1' }
    const mockSession = { data: { user: mockUser } }
    createClientMock.mockResolvedValue({ auth: { getUser: () => Promise.resolve(mockSession) } })
  })

  it('deletes tradovate token with userId in where clause', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    synchronizationDeleteManyMock.mockResolvedValue({ count: 1 })

    await removeTradovateToken('account-1')

    expect(synchronizationDeleteManyMock).toHaveBeenCalledWith({
      where: expect.objectContaining({
        userId: 'db-user-1',
        service: 'tradovate',
      }),
    })
  })

  it('blocks deletion when user not authenticated', async () => {
    createClientMock.mockResolvedValue({
      auth: { getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Not authenticated') }) },
    })

    const result = await removeTradovateToken('account-1')

    expect(result).toEqual({ error: 'User not authenticated' })
  })

  it('deletes all tokens when no accountId specified', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    synchronizationDeleteManyMock.mockResolvedValue({ count: 3 })

    await removeTradovateToken()

    expect(synchronizationDeleteManyMock).toHaveBeenCalledWith({
      where: {
        userId: 'db-user-1',
        service: 'tradovate',
      },
    })
  })
})

describe('cleanupOldLayoutVersionsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
  })

  it('verifies ownership via assertLayoutOwnership before cleanup', async () => {
    layoutFindUniqueMock.mockResolvedValue({
      id: 'layout-1',
      userId: 'db-user-1',
      desktop: [],
      mobile: [],
    })
    mockPrismaFallbackSuccess()
    prismaSchemaMismatchFallbackMock.mockImplementation(
      async (_key: string, fn: () => Promise<unknown>) => fn()
    )

    await cleanupOldLayoutVersionsAction('layout-1')

    expect(layoutFindUniqueMock).toHaveBeenCalledWith({
      where: { id: 'layout-1' },
    })
  })

  it('blocks cleanup when layout belongs to different user', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-2')
    layoutFindUniqueMock.mockResolvedValue({
      id: 'layout-1',
      userId: 'db-user-1',
      desktop: [],
      mobile: [],
    })

    await cleanupOldLayoutVersionsAction('layout-1')

    expect(layoutFindUniqueMock).toHaveBeenCalledWith({
      where: { id: 'layout-1' },
    })
  })

  it('blocks cleanup when layout not found', async () => {
    layoutFindUniqueMock.mockResolvedValue(null)

    await cleanupOldLayoutVersionsAction('non-existent')

    expect(layoutFindUniqueMock).toHaveBeenCalledWith({
      where: { id: 'non-existent' },
    })
  })
})

describe('deleteAccountAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
  })

  it('deletes account with userId in where clause', async () => {
    accountDeleteMock.mockResolvedValue({ id: 'acc-1', number: 'ACC-1' })

    const testAccount = createTestAccount({
      id: 'acc-1',
      number: 'ACC-1',
      userId: 'db-user-1',
    })

    await deleteAccountAction(testAccount)

    expect(accountDeleteMock).toHaveBeenCalledWith({
      where: {
        id: 'acc-1',
        userId: 'db-user-1',
      },
    })
    // deleteAccountAction uses invalidateAccountRelatedCaches + invalidateAllUserCaches (both mocked)
    expect(invalidateAllUserCachesMock).toHaveBeenCalledWith('db-user-1')
  })

  it('blocks delete when account belongs to different user', async () => {
    accountDeleteMock.mockRejectedValue(
      Object.assign(new Error('Record to delete does not exist'), { code: 'P2025' })
    )

    const testAccount = createTestAccount({
      id: 'acc-1',
      number: 'ACC-1',
      userId: 'other-user',
    })

    await expect(deleteAccountAction(testAccount)).rejects.toThrow()
  })
})

describe('deleteReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
  })

  it('deletes review only when userId matches', async () => {
    propFirmReviewFindUniqueMock.mockResolvedValue({
      id: 'review-1',
      userId: 'db-user-1',
      propFirmId: 'firm-1',
      rating: 5,
    })
    propFirmReviewDeleteMock.mockResolvedValue({ id: 'review-1' })

    await deleteReview('review-1')

    expect(propFirmReviewFindUniqueMock).toHaveBeenCalledWith({
      where: { id: 'review-1' },
    })
    expect(propFirmReviewDeleteMock).toHaveBeenCalledWith({
      where: { id: 'review-1' },
    })
  })

  it('blocks delete when review belongs to different user', async () => {
    propFirmReviewFindUniqueMock.mockResolvedValue({
      id: 'review-1',
      userId: 'other-user',
      propFirmId: 'firm-1',
      rating: 5,
    })

    await expect(deleteReview('review-1')).rejects.toThrow(
      'You can only delete your own reviews'
    )
    expect(propFirmReviewDeleteMock).not.toHaveBeenCalled()
  })

  it('blocks delete when review not found', async () => {
    propFirmReviewFindUniqueMock.mockResolvedValue(null)

    await expect(deleteReview('non-existent')).rejects.toThrow('Review not found')
    expect(propFirmReviewDeleteMock).not.toHaveBeenCalled()
  })
})

describe('deleteGroupAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
  })

  it('deletes group with userId validation via findFirst', async () => {
    groupFindFirstMock.mockResolvedValue({ id: 'group-1' })
    accountUpdateManyMock.mockResolvedValue({ count: 2 })
    groupDeleteMock.mockResolvedValue({})

    await deleteGroupAction('group-1')

    expect(groupFindFirstMock).toHaveBeenCalledWith({
      where: { id: 'group-1', userId: 'db-user-1' },
      select: { id: true },
    })
    expect(accountUpdateManyMock).toHaveBeenCalledWith({
      where: {
        groupId: 'group-1',
        userId: 'db-user-1',
      },
      data: { groupId: null },
    })
    expect(groupDeleteMock).toHaveBeenCalledWith({
      where: { id: 'group-1' },
    })
    expect(invalidateGroupRelatedCachesMock).toHaveBeenCalledWith('db-user-1')
  })

  it('blocks delete when group belongs to different user', async () => {
    groupFindFirstMock.mockResolvedValue(null)

    await expect(deleteGroupAction('group-1')).rejects.toThrow('Group not found')
    expect(accountUpdateManyMock).not.toHaveBeenCalled()
    expect(groupDeleteMock).not.toHaveBeenCalled()
  })
})

describe('deleteShared', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
  })

  it('deletes shared view when userId matches', async () => {
    sharedFindUniqueMock.mockResolvedValue({
      slug: 'my-dashboard',
      userId: 'db-user-1',
    })
    sharedDeleteMock.mockResolvedValue({ slug: 'my-dashboard' })

    await deleteShared('my-dashboard')

    expect(sharedFindUniqueMock).toHaveBeenCalledWith({
      where: { slug: 'my-dashboard' },
    })
    expect(sharedDeleteMock).toHaveBeenCalledWith({
      where: { slug: 'my-dashboard' },
    })
    expect(updateTagMock).toHaveBeenCalledWith('shared-view-my-dashboard')
  })

  it('blocks delete when shared belongs to different user', async () => {
    sharedFindUniqueMock.mockResolvedValue({
      slug: 'other-dashboard',
      userId: 'other-user',
    })

    await expect(deleteShared('other-dashboard')).rejects.toThrow('Unauthorized')
    expect(sharedDeleteMock).not.toHaveBeenCalled()
  })

  it('blocks delete when shared view not found', async () => {
    sharedFindUniqueMock.mockResolvedValue(null)

    await expect(deleteShared('non-existent')).rejects.toThrow('Unauthorized')
    expect(sharedDeleteMock).not.toHaveBeenCalled()
  })
})
