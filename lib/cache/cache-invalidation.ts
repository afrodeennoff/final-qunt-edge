/**
 * Cache Invalidation Helpers
 *
 * Provides typed functions for invalidating specific cache tags.
 * Use these after mutations to ensure data consistency.
 *
 * @module lib/cache/cache-invalidation
 */

import { updateTag } from 'next/cache'

/**
 * Cache tag constants for type safety
 *
 * @example
 * ```ts
 * const tags = CACHE_TAGS.USER_DATA('user-123')
 * // Returns: 'user-data-user-123'
 * ```
 */
export const CACHE_TAGS = {
  USER_DATA: (userId: string) => `user-data-${userId}`,
  USER_DATA_CORE: (userId: string) => `user-data-core-${userId}`,
  USER_DATA_SUPPLEMENTAL: (userId: string) => `user-data-supplemental-${userId}`,
  ACCOUNT_METRICS: (userId: string) => `account-metrics-${userId}`,
  TRADES: (userId: string) => `trades-${userId}`,
  DASHBOARD: (userId: string) => `dashboard-${userId}`,
  DASHBOARD_LAYOUT: (userId: string) => `dashboard-layout-${userId}`,
  EQUITY_CHART: (userId: string) => `equity-chart-${userId}`,
  GROUPS: (userId: string) => `groups-${userId}`,
  TAGS: (userId: string) => `tags-${userId}`,
  MOOD: (userId: string) => `mood-${userId}`,
} as const

function updateTags(tags: string[]): void {
  for (const tag of tags) {
    updateTag(tag)
  }
}

/**
 * Invalidate user data cache
 *
 * Use after updating user profile, settings, or preferences.
 *
 * @param userId - User ID
 *
 * @example
 * ```ts
 * await prisma.user.update({ where: { id: userId }, data: updates })
 * invalidateUserData(userId)
 * ```
 */
export function invalidateUserData(userId: string): void {
  updateTags([CACHE_TAGS.USER_DATA(userId)])
}

/**
 * Invalidate account metrics cache
 *
 * Use after adding, updating, or deleting accounts/trades.
 *
 * @param userId - User ID
 *
 * @example
 * ```ts
 * await prisma.account.create({ data: newAccount })
 * invalidateAccountMetrics(userId)
 * ```
 */
export function invalidateAccountMetrics(userId: string): void {
  updateTags([CACHE_TAGS.ACCOUNT_METRICS(userId)])
}

/**
 * Invalidate trades cache
 *
 * Use after importing, updating, or deleting trades.
 *
 * @param userId - User ID
 *
 * @example
 * ```ts
 * await prisma.trade.createMany({ data: newTrades })
 * invalidateTrades(userId)
 * ```
 */
export function invalidateTrades(userId: string): void {
  updateTags([CACHE_TAGS.TRADES(userId)])
}

/**
 * Invalidate dashboard layout cache
 *
 * Use after updating dashboard layout configuration.
 *
 * @param userId - User ID
 *
 * @example
 * ```ts
 * await prisma.dashboardLayout.update({ where: { userId }, data: { layout } })
 * invalidateDashboardLayout(userId)
 * ```
 */
export function invalidateDashboardLayout(userId: string): void {
  updateTags([CACHE_TAGS.DASHBOARD_LAYOUT(userId), CACHE_TAGS.DASHBOARD(userId)])
}

export function invalidateEquityChart(userId: string): void {
  updateTags([CACHE_TAGS.EQUITY_CHART(userId)])
}

export function invalidateJournalRelatedCaches(userId: string): void {
  updateTags([
    CACHE_TAGS.USER_DATA(userId),
    CACHE_TAGS.MOOD(userId),
    CACHE_TAGS.DASHBOARD(userId),
    CACHE_TAGS.EQUITY_CHART(userId),
  ])
}

export function invalidateGroupRelatedCaches(userId: string): void {
  updateTags([
    CACHE_TAGS.USER_DATA(userId),
    CACHE_TAGS.TRADES(userId),
    CACHE_TAGS.GROUPS(userId),
    CACHE_TAGS.DASHBOARD_LAYOUT(userId),
    CACHE_TAGS.DASHBOARD(userId),
    CACHE_TAGS.EQUITY_CHART(userId),
  ])
}

export function invalidateTagRelatedCaches(userId: string): void {
  updateTags([
    CACHE_TAGS.USER_DATA(userId),
    CACHE_TAGS.TRADES(userId),
    CACHE_TAGS.TAGS(userId),
    CACHE_TAGS.DASHBOARD(userId),
    CACHE_TAGS.EQUITY_CHART(userId),
  ])
}

export function invalidateTradeDataCaches(userId: string): void {
  updateTags([
    CACHE_TAGS.USER_DATA_CORE(userId),
    CACHE_TAGS.USER_DATA_SUPPLEMENTAL(userId),
    CACHE_TAGS.USER_DATA(userId),
    CACHE_TAGS.TRADES(userId),
    CACHE_TAGS.DASHBOARD(userId),
    CACHE_TAGS.EQUITY_CHART(userId),
  ])
}

export function invalidateAccountRelatedCaches(userId: string): void {
  updateTags([
    CACHE_TAGS.USER_DATA(userId),
    CACHE_TAGS.USER_DATA_CORE(userId),
    CACHE_TAGS.USER_DATA_SUPPLEMENTAL(userId),
    CACHE_TAGS.ACCOUNT_METRICS(userId),
    CACHE_TAGS.TRADES(userId),
    CACHE_TAGS.GROUPS(userId),
    CACHE_TAGS.DASHBOARD(userId),
    CACHE_TAGS.EQUITY_CHART(userId),
  ])
}

export function invalidateDashboardDataCaches(userId: string): void {
  updateTags([
    CACHE_TAGS.USER_DATA(userId),
    CACHE_TAGS.USER_DATA_CORE(userId),
    CACHE_TAGS.USER_DATA_SUPPLEMENTAL(userId),
    CACHE_TAGS.ACCOUNT_METRICS(userId),
    CACHE_TAGS.TRADES(userId),
    CACHE_TAGS.GROUPS(userId),
    CACHE_TAGS.TAGS(userId),
    CACHE_TAGS.MOOD(userId),
    CACHE_TAGS.EQUITY_CHART(userId),
    CACHE_TAGS.DASHBOARD_LAYOUT(userId),
    CACHE_TAGS.DASHBOARD(userId),
  ])
}

/**
 * Invalidate all user-related caches
 *
 * Use after bulk operations affecting multiple data types.
 *
 * @param userId - User ID
 *
 * @example
 * ```ts
 * await importTradesFromCSV(userId, trades)
 * await syncWithRithmic(userId, trades)
 * invalidateAllUserCaches(userId)
 * ```
 */
export function invalidateAllUserCaches(userId: string): void {
  invalidateDashboardDataCaches(userId)
}
