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
    expect(CACHE_TAGS.DASHBOARD_LAYOUT('user-123')).toBe('dashboard-layout-user-123')
  })

  it('updates the user data tag for targeted invalidation helpers', () => {
    invalidateUserData('user-123')
    invalidateAccountMetrics('user-123')
    invalidateTrades('user-123')
    invalidateDashboardLayout('user-123')

    expect(updateTagMock).toHaveBeenNthCalledWith(1, 'user-data-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(2, 'account-metrics-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(3, 'trades-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(4, 'dashboard-layout-user-123')
    expect(updateTagMock).toHaveBeenNthCalledWith(5, 'dashboard-user-123')
  })

  it('invalidates every user cache tag for bulk operations', () => {
    invalidateAllUserCaches('user-123')

    // invalidateAllUserCaches delegates to invalidateDashboardDataCaches
    // which invalidates all user-related tags
    const calledTags = updateTagMock.mock.calls.map((call: string[]) => call[0])
    expect(calledTags).toContain('user-data-user-123')
    expect(calledTags).toContain('account-metrics-user-123')
    expect(calledTags).toContain('trades-user-123')
    expect(calledTags).toContain('dashboard-layout-user-123')
    expect(calledTags).toContain('dashboard-user-123')
    expect(calledTags).toContain('equity-chart-user-123')
    expect(calledTags).toContain('groups-user-123')
    expect(calledTags).toContain('tags-user-123')
    expect(calledTags).toContain('mood-user-123')
    expect(calledTags).toContain('user-data-core-user-123')
    expect(calledTags).toContain('user-data-supplemental-user-123')
  })
})
