import { describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

import { updateTag } from 'next/cache'
import {
  CACHE_TAGS,
  invalidateEquityChart,
  invalidateDashboardLayout,
  invalidateJournalRelatedCaches,
  invalidateGroupRelatedCaches,
  invalidateTradeDataCaches,
  invalidateAccountRelatedCaches,
  invalidateDashboardDataCaches,
  invalidateAllUserCaches,
} from '@/lib/cache/cache-invalidation'

describe('CACHE_TAGS', () => {
  it('EQUITY_CHART produces correct tag string', () => {
    expect(CACHE_TAGS.EQUITY_CHART('user-123')).toBe('equity-chart-user-123')
  })

  it('DASHBOARD_LAYOUT produces correct tag string', () => {
    expect(CACHE_TAGS.DASHBOARD_LAYOUT('user-123')).toBe('dashboard-layout-user-123')
  })

  it('TRADES produces correct tag string', () => {
    expect(CACHE_TAGS.TRADES('user-123')).toBe('trades-user-123')
  })

  it('USER_DATA produces correct tag string', () => {
    expect(CACHE_TAGS.USER_DATA('user-123')).toBe('user-data-user-123')
  })

  it('MOOD produces correct tag string', () => {
    expect(CACHE_TAGS.MOOD('user-123')).toBe('mood-user-123')
  })
})

describe('invalidateEquityChart', () => {
  it('calls updateTag with equity-chart userId', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateEquityChart('user-456')
    expect(updateTagMock).toHaveBeenCalledWith('equity-chart-user-456')
  })
})

describe('invalidateDashboardLayout', () => {
  it('calls updateTag with DASHBOARD_LAYOUT and DASHBOARD tags', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateDashboardLayout('user-789')
    expect(updateTagMock).toHaveBeenCalledWith('dashboard-layout-user-789')
    expect(updateTagMock).toHaveBeenCalledWith('dashboard-user-789')
  })
})

describe('invalidateJournalRelatedCaches', () => {
  it('includes equity-chart tag', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateJournalRelatedCaches('user-abc')
    expect(updateTagMock).toHaveBeenCalledWith('equity-chart-user-abc')
  })
})

describe('invalidateGroupRelatedCaches', () => {
  it('includes equity-chart tag', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateGroupRelatedCaches('user-def')
    expect(updateTagMock).toHaveBeenCalledWith('equity-chart-user-def')
  })
})

describe('invalidateTradeDataCaches', () => {
  it('includes equity-chart tag', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateTradeDataCaches('user-ghi')
    expect(updateTagMock).toHaveBeenCalledWith('equity-chart-user-ghi')
  })

  it('invalidates leaderboard cache so new trades reflect on the board', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateTradeDataCaches('user-ghi')
    expect(updateTagMock).toHaveBeenCalledWith('leaderboard')
  })
})

describe('invalidateAccountRelatedCaches', () => {
  it('includes equity-chart tag', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateAccountRelatedCaches('user-jkl')
    expect(updateTagMock).toHaveBeenCalledWith('equity-chart-user-jkl')
  })

  it('invalidates leaderboard cache so account changes reflect on the board', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateAccountRelatedCaches('user-jkl')
    expect(updateTagMock).toHaveBeenCalledWith('leaderboard')
  })
})

describe('invalidateDashboardDataCaches', () => {
  it('includes equity-chart tag', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateDashboardDataCaches('user-mno')
    expect(updateTagMock).toHaveBeenCalledWith('equity-chart-user-mno')
  })

  it('includes DASHBOARD_LAYOUT tag', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateDashboardDataCaches('user-pqr')
    expect(updateTagMock).toHaveBeenCalledWith('dashboard-layout-user-pqr')
  })
})

describe('invalidateAllUserCaches', () => {
  it('invalidates equity-chart tag', () => {
    const updateTagMock = vi.mocked(updateTag)
    invalidateAllUserCaches('user-stu')
    expect(updateTagMock).toHaveBeenCalledWith('equity-chart-user-stu')
  })
})