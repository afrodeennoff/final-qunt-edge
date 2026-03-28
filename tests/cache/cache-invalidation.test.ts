import { beforeEach, describe, expect, it, vi } from 'vitest'

const { updateTagMock } = vi.hoisted(() => ({
  updateTagMock: vi.fn(),
}))

vi.mock('next/cache', () => ({
  updateTag: updateTagMock,
}))

import {
  CACHE_TAGS,
  invalidateAccountMetrics,
  invalidateAllUserCaches,
  invalidateDashboardLayout,
  invalidateTrades,
  invalidateUserData,
} from '@/lib/cache/cache-invalidation'

describe('Cache invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds stable cache tags', () => {
    expect(CACHE_TAGS.USER_DATA('user-123')).toBe('user-data-user-123')
    expect(CACHE_TAGS.ACCOUNT_METRICS('user-123')).toBe('account-metrics-user-123')
    expect(CACHE_TAGS.TRADES('user-123')).toBe('trades-user-123')
    expect(CACHE_TAGS.DASHBOARD_LAYOUT('user-123')).toBe('dashboard-user-123')
  })

  it('updates the user data tag for targeted invalidation helpers', () => {
    invalidateUserData('user-123')
    invalidateAccountMetrics('user-123')
    invalidateTrades('user-123')
    invalidateDashboardLayout('user-123')

    expect(updateTagMock).toHaveBeenNthCalledWith(1, 'user-data-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(2, 'account-metrics-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(3, 'trades-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(4, 'dashboard-user-123')
  })

  it('invalidates every user cache tag for bulk operations', () => {
    invalidateAllUserCaches('user-123')

    expect(updateTagMock).toHaveBeenNthCalledWith(1, 'user-data-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(2, 'account-metrics-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(3, 'trades-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(4, 'dashboard-user-123')
  })
})
