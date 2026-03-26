'use server'

import { getShared } from './shared'
import { TickDetails, User, Tag, DashboardLayout, FinancialEvent, Mood, Subscription, Account, Group } from '@/prisma/generated/prisma'
import { Trade } from '@/lib/data-types'
import { GroupWithAccounts } from './groups'
import { getCurrentLocale } from '@/locales/server'
import { prisma } from '@/lib/prisma'
import { getDatabaseUserId, getUserId } from './auth'
import { revalidateTag, unstable_cache } from 'next/cache'
import { logger } from '@/lib/logger'
import { cacheQuery } from '@/lib/cache/query-cache'
import { FEATURE_FLAGS } from '@/lib/feature-flags'
import { isPrismaSchemaMismatchError, withPrismaSchemaMismatchFallback } from '@/lib/prisma-guard'
import { VALID_DASHBOARD_THEMES, type DashboardTheme } from '@/lib/constants/dashboard-themes'

export type SharedDataResponse = {
  trades: Trade[]
  params: any
  error?: string
  groups: GroupWithAccounts[]
}

export async function loadSharedData(slug: string): Promise<SharedDataResponse> {
  if (!slug) {
    return {
      trades: [],
      params: null,
      error: 'Invalid slug',
      groups: []
    }
  }

  try {
    const sharedData = await getShared(slug)
    if (!sharedData) {
      return {
        trades: [],
        params: null,
        error: 'Shared data not found',
        groups: []
      }
    }

    return {
      trades: sharedData.trades,
      params: sharedData.params,
      groups: sharedData.groups
    }
  } catch (error) {
    return {
      trades: [],
      params: null,
      error: 'Failed to load shared data',
      groups: []
    }
  }
}


export async function getUserData(forceRefresh: boolean = false): Promise<{
  userData: User | null;
  subscription: Subscription | null;
  tickDetails: TickDetails[];
  tags: Tag[];
  accounts: Account[];
  groups: Group[];
  financialEvents: FinancialEvent[];
  moodHistory: Mood[];
}> {
  const authUserId = await getUserId()
  const userId = await getDatabaseUserId()
  const locale = await getCurrentLocale()

  const loadUserData = async (): Promise<User | null> => {
    try {
      return await prisma.user.findUnique({
        where: { auth_user_id: authUserId }
      })
    } catch (error) {
      if (!isPrismaSchemaMismatchError(error)) {
        throw error
      }

      logger.warn('[getUserData] Schema mismatch while loading user profile; using compatibility select', {
        userId,
      })

      const legacyUser = await prisma.user.findUnique({
        where: { auth_user_id: authUserId },
        select: {
          id: true,
          email: true,
          auth_user_id: true,
          isFirstConnection: true,
          isBeta: true,
          language: true,
          etpToken: true,
          etpTokenHash: true,
          etpTokenExpiresAt: true,
          thorToken: true,
          thorTokenHash: true,
          thorTokenExpiresAt: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      if (!legacyUser) {
        return null
      }

      return {
        ...legacyUser,
        dashboardTheme: 'blue',
        showOnLeaderboard: false,
        mt5TokenHash: null,
        mt5TokenExpiresAt: null,
      } satisfies User
    }
  }

  // If forceRefresh is true, bypass cache and fetch directly
  if (forceRefresh) {
    const start = performance.now();
    logger.info('[getUserData] Force refresh requested', { userId })
    revalidateTag(`user-data-${userId}`, { expire: 0 })

    // Fetch data in parallel without transaction to avoid timeouts
    const [userData, subscription, tickDetails, accounts, groups, tags, financialEvents, moodHistory] = await Promise.all([
      withPrismaSchemaMismatchFallback(`user-data-force-user-${userId}`, loadUserData, null),
      withPrismaSchemaMismatchFallback(
        `user-data-force-subscription-${userId}`,
        () => prisma.subscription.findUnique({
          where: { userId: userId }
        }),
        null
      ),
      withPrismaSchemaMismatchFallback(
        'user-data-force-tick-details',
        () => prisma.tickDetails.findMany(),
        []
      ),
      withPrismaSchemaMismatchFallback(
        `user-data-force-accounts-${userId}`,
        () => prisma.account.findMany({
          where: { userId: userId },
          include: {
            payouts: true,
            group: true
          }
        }),
        []
      ),
      withPrismaSchemaMismatchFallback(
        `user-data-force-groups-${userId}`,
        () => prisma.group.findMany({
          where: { userId: userId },
          include: { accounts: true }
        }),
        []
      ),
      withPrismaSchemaMismatchFallback(
        `user-data-force-tags-${userId}`,
        () => prisma.tag.findMany({
          where: { userId: userId }
        }),
        []
      ),
      withPrismaSchemaMismatchFallback(
        `user-data-force-financial-events-${locale}`,
        () => prisma.financialEvent.findMany({
          where: { lang: locale }
        }),
        []
      ),
      withPrismaSchemaMismatchFallback(
        `user-data-force-moods-${userId}`,
        () => prisma.mood.findMany({
          where: { userId: userId }
        }),
        []
      )
    ])

    logger.info('[getUserData] Force refresh completed', {
      userId,
      durationMs: Number((performance.now() - start).toFixed(2)),
    })

    return {
      userData,
      subscription,
      tickDetails,
      tags,
      accounts,
      groups,
      financialEvents,
      moodHistory
    }
  }

  // Use cacheQuery wrapper with feature flag support
  const shouldCache = FEATURE_FLAGS.ENABLE_QUERY_CACHING

  // TIER 1: Global Stable Data (Tick details)
  const getGlobalTickDetails = cacheQuery(
    async () => prisma.tickDetails.findMany(),
    ['global-tick-details'],
    { revalidateIn: shouldCache ? 86400 : 0 }
  )

  // TIER 2: Global Localized Data (Financial events)
  const getGlobalFinancialEvents = cacheQuery(
    async () => prisma.financialEvent.findMany({ where: { lang: locale } }),
    [`global-financial-events-${locale}`],
    { revalidateIn: shouldCache ? 3600 : 0 }
  )

  // TIER 3: User Core Data (Subscription, User profile)
  const getCachedCoreUserData = cacheQuery(
    async () => {
      const [userData, subscription] = await Promise.all([
        withPrismaSchemaMismatchFallback(`user-data-core-user-${userId}`, loadUserData, null),
        withPrismaSchemaMismatchFallback(
          `user-data-core-subscription-${userId}`,
          () => prisma.subscription.findUnique({
            where: { userId: userId }
          }),
          null
        )
      ])

      return { userData, subscription }
    },
    [`user-data-core-${userId}`],
    {
      revalidateIn: shouldCache ? 3600 : 0,
      tags: [`user-data-${userId}`, `user-data-core-${userId}`]
    }
  )

  // TIER 4: User Supplemental Data (Accounts, Groups, Tags) - Cached because these don't change every second
  const getCachedSupplementalData = cacheQuery(
    async () => {
      const [accounts, groups, tags, moodHistory] = await Promise.all([
        withPrismaSchemaMismatchFallback(
          `user-data-supplemental-accounts-${userId}`,
          () => prisma.account.findMany({
            where: { userId: userId },
            include: {
              payouts: true,
              group: true
            }
          }),
          []
        ),
        withPrismaSchemaMismatchFallback(
          `user-data-supplemental-groups-${userId}`,
          () => prisma.group.findMany({
            where: { userId: userId },
            include: { accounts: true }
          }),
          []
        ),
        withPrismaSchemaMismatchFallback(
          `user-data-supplemental-tags-${userId}`,
          () => prisma.tag.findMany({
            where: { userId: userId }
          }),
          []
        ),
        withPrismaSchemaMismatchFallback(
          `user-data-supplemental-moods-${userId}`,
          () => prisma.mood.findMany({
            where: { userId: userId }
          }),
          []
        )
      ])

      return { accounts, groups, tags, moodHistory }
    },
    [`user-data-supplemental-${userId}`],
    {
      revalidateIn: shouldCache ? 300 : 0,
      tags: [`user-data-${userId}`, `user-data-supplemental-${userId}`]
    }
  )

  // Fetch all in parallel
  const [core, tickDetails, financialEvents, supplemental] = await Promise.all([
    getCachedCoreUserData(),
    withPrismaSchemaMismatchFallback('user-data-global-tick-details', getGlobalTickDetails, []),
    withPrismaSchemaMismatchFallback(`user-data-global-financial-events-${locale}`, getGlobalFinancialEvents, []),
    getCachedSupplementalData()
  ])

  return {
    userData: core.userData,
    subscription: core.subscription,
    tickDetails,
    tags: supplemental.tags,
    accounts: supplemental.accounts,
    groups: supplemental.groups,
    financialEvents,
    moodHistory: supplemental.moodHistory
  }
}

export async function getDashboardLayout(userId: string): Promise<DashboardLayout | null> {
  const actorUserId = await getUserId()
  if (actorUserId !== userId) {
    throw new Error('Forbidden')
  }

  const getCachedDashboardLayout = unstable_cache(
    async () => prisma.dashboardLayout.findUnique({ where: { userId } }),
    [`dashboard-layout-${userId}`],
    {
      tags: [`dashboard-layout-${userId}`, `dashboard-${userId}`],
      revalidate: 120,
    }
  )

  try {
    const layout = await getCachedDashboardLayout()

    if (!layout) return null

    // Helper to ensure we return a parsed object/array, not a string
    const parseIfNeeded = (val: any) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val)
        } catch (e) {
          logger.error('[getDashboardLayout] Failed to parse dashboard JSON', { error: e, userId })
          return []
        }
      }
      return val
    }

    return {
      ...layout,
      desktop: parseIfNeeded(layout.desktop),
      mobile: parseIfNeeded(layout.mobile)
    }
  } catch (error) {
    logger.error('[getDashboardLayout] Error fetching dashboard layout', { error, userId })
    return null
  }
}

export async function updateIsFirstConnectionAction(isFirstConnection: boolean) {
  const authUserId = await getUserId()
  const userId = await getDatabaseUserId()
  if (!authUserId || !userId) {
    return 0
  }
  await prisma.user.update({
    where: { auth_user_id: authUserId },
    data: { isFirstConnection }
  })
  revalidateTag(`user-data-${userId}`, { expire: 0 })
}

export async function getUserDashboardTheme(): Promise<DashboardTheme | null> {
  const authUserId = await getUserId()
  if (!authUserId) return null

  try {
    const user = await prisma.user.findUnique({
      where: { auth_user_id: authUserId },
      select: { dashboardTheme: true }
    })
    if (user?.dashboardTheme && VALID_DASHBOARD_THEMES.includes(user.dashboardTheme as DashboardTheme)) {
      return user.dashboardTheme as DashboardTheme
    }
    return null
  } catch (error) {
    logger.error('[getUserDashboardTheme] Error fetching user theme', { error, authUserId })
    return null
  }
}

export async function setUserDashboardTheme(theme: string): Promise<DashboardTheme> {
  const authUserId = await getUserId()
  if (!authUserId) throw new Error('Unauthorized')
  if (!VALID_DASHBOARD_THEMES.includes(theme as DashboardTheme)) {
    throw new Error(`Invalid theme: ${theme}`)
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { auth_user_id: authUserId },
      data: { dashboardTheme: theme },
      select: { dashboardTheme: true }
    })
    logger.info('[setUserDashboardTheme] Theme updated', { authUserId, theme })
    return updatedUser.dashboardTheme as DashboardTheme
  } catch (error) {
    logger.error('[setUserDashboardTheme] Error updating user theme', { error, authUserId, theme })
    throw new Error('Failed to update theme')
  }
}
