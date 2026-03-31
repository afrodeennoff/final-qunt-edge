'use server'

import { getShared } from './shared'
import { Prisma, TickDetails, User, Tag, DashboardLayout, FinancialEvent, Mood, Subscription, Account, Group } from '@/prisma/generated/prisma'
import { Trade } from '@/lib/data-types'
import { GroupWithAccounts } from './groups'
import { getCurrentLocale } from '@/locales/server'
import { prisma } from '@/lib/prisma'
import { getDatabaseUserId, getUserId } from './auth'
import { cacheLife, cacheTag, updateTag } from 'next/cache'
import { logger } from '@/lib/logger'
import { FEATURE_FLAGS } from '@/lib/feature-flags'
import {
  isPrismaColumnAvailable,
  isPrismaSchemaMismatchError,
  markPrismaColumnUnavailable,
  withPrismaSchemaMismatchFallback
} from '@/lib/prisma-guard'
import { VALID_DASHBOARD_THEMES, type DashboardTheme } from '@/lib/constants/dashboard-themes'
import { CACHE_TAGS } from '@/lib/cache/cache-invalidation'
import type { SharedParams } from './shared'

export type SharedDataResponse = {
  trades: Trade[]
  params: SharedParams | null
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
  } catch {
    return {
      trades: [],
      params: null,
      error: 'Failed to load shared data',
      groups: []
    }
  }
}

const CACHE_LIFETIMES = {
  globalTickDetails: {
    stale: 86_400,
    revalidate: 86_400,
    expire: 604_800,
  },
  globalFinancialEvents: {
    stale: 3_600,
    revalidate: 3_600,
    expire: 21_600,
  },
  coreUserData: {
    stale: 3_600,
    revalidate: 3_600,
    expire: 21_600,
  },
  supplementalUserData: {
    stale: 300,
    revalidate: 300,
    expire: 1_800,
  },
  dashboardLayout: {
    stale: 120,
    revalidate: 120,
    expire: 600,
  },
} as const

const GLOBAL_TICK_DETAILS_CACHE_TAG = 'global-tick-details'
const GLOBAL_FINANCIAL_EVENTS_CACHE_TAG = (locale: string) => `global-financial-events-${locale}` as const
const USER_DATA_CORE_CACHE_TAG = (userId: string) => `user-data-core-${userId}` as const
const USER_DATA_SUPPLEMENTAL_CACHE_TAG = (userId: string) => `user-data-supplemental-${userId}` as const
const DASHBOARD_LAYOUT_CACHE_TAG = (userId: string) => `dashboard-layout-${userId}` as const
const USER_TABLE_NAME = 'User'
const AUTH_USER_ID_COLUMN = 'auth_user_id'
const DASHBOARD_THEME_COLUMN = 'dashboardTheme'

type CoreUserCompatRecord = {
  id: string
  email: string
  auth_user_id?: string | null
  isFirstConnection?: boolean | null
  isBeta?: boolean | null
  language?: string | null
  createdAt: Date
  updatedAt: Date
}

function toCompatUser(record: CoreUserCompatRecord, authUserId: string): User {
  return {
    id: record.id,
    email: record.email,
    auth_user_id: record.auth_user_id ?? authUserId,
    isFirstConnection: record.isFirstConnection ?? true,
    isBeta: record.isBeta ?? false,
    language: record.language ?? 'en',
    dashboardTheme: 'blue',
    showOnLeaderboard: false,
    etpToken: null,
    etpTokenHash: null,
    etpTokenExpiresAt: null,
    thorToken: null,
    thorTokenHash: null,
    thorTokenExpiresAt: null,
    mt5TokenHash: null,
    mt5TokenExpiresAt: null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

async function findCoreUserByIdCompat(userId: string, authUserId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isFirstConnection: true,
        isBeta: true,
        language: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return user ? toCompatUser(user, authUserId) : null
  } catch (error) {
    if (!isPrismaSchemaMismatchError(error)) {
      throw error
    }

    const legacyUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return legacyUser ? toCompatUser(legacyUser, authUserId) : null
  }
}

async function loadGlobalTickDetails() {
  return withPrismaSchemaMismatchFallback(
    'user-data-global-tick-details',
    () => prisma.tickDetails.findMany(),
    []
  )
}

async function loadGlobalFinancialEvents(locale: string) {
  return withPrismaSchemaMismatchFallback(
    `user-data-global-financial-events-${locale}`,
    () => prisma.financialEvent.findMany({ where: { lang: locale } }),
    []
  )
}

async function loadCoreUserData(authUserId: string | null, userId: string): Promise<{
  userData: User | null;
  subscription: Subscription | null;
}> {
  if (!authUserId) {
    return { userData: null, subscription: null }
  }

  const loadUserData = async (): Promise<User | null> => {
    const hasAuthUserIdColumn = await isPrismaColumnAvailable(USER_TABLE_NAME, AUTH_USER_ID_COLUMN)
    if (!hasAuthUserIdColumn) {
      return findCoreUserByIdCompat(userId, authUserId)
    }

    try {
      const user = await prisma.user.findUnique({
        where: { auth_user_id: authUserId },
        select: {
          id: true,
          email: true,
          auth_user_id: true,
          isFirstConnection: true,
          isBeta: true,
          language: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (user) {
        return toCompatUser(user, authUserId)
      }
    } catch (error) {
      if (!isPrismaSchemaMismatchError(error)) {
        throw error
      }

      markPrismaColumnUnavailable(USER_TABLE_NAME, AUTH_USER_ID_COLUMN)
      logger.warn(
        '[getUserData] Schema mismatch while loading user by auth_user_id; falling back to id lookup',
        { userId }
      )
    }

    return findCoreUserByIdCompat(userId, authUserId)
  }

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
}

async function loadSupplementalUserData(userId: string): Promise<{
  accounts: Account[];
  groups: Group[];
  tags: Tag[];
  moodHistory: Mood[];
}> {
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
}

async function loadDashboardLayout(userId: string): Promise<DashboardLayout | null> {
  return prisma.dashboardLayout.findUnique({ where: { userId } })
}

async function getGlobalTickDetailsCached() {
  'use cache'
  cacheLife(CACHE_LIFETIMES.globalTickDetails)
  cacheTag(GLOBAL_TICK_DETAILS_CACHE_TAG)
  return loadGlobalTickDetails()
}

async function getGlobalFinancialEventsCached(locale: string) {
  'use cache'
  cacheLife(CACHE_LIFETIMES.globalFinancialEvents)
  cacheTag(GLOBAL_FINANCIAL_EVENTS_CACHE_TAG(locale))
  return loadGlobalFinancialEvents(locale)
}

async function getCoreUserDataCached(authUserId: string | null, userId: string) {
  'use cache'
  cacheLife(CACHE_LIFETIMES.coreUserData)
  cacheTag(CACHE_TAGS.USER_DATA(userId), USER_DATA_CORE_CACHE_TAG(userId))
  return loadCoreUserData(authUserId, userId)
}

async function getSupplementalUserDataCached(userId: string) {
  'use cache'
  cacheLife(CACHE_LIFETIMES.supplementalUserData)
  cacheTag(CACHE_TAGS.USER_DATA(userId), USER_DATA_SUPPLEMENTAL_CACHE_TAG(userId))
  return loadSupplementalUserData(userId)
}

async function getDashboardLayoutCached(userId: string) {
  'use cache'
  cacheLife(CACHE_LIFETIMES.dashboardLayout)
  cacheTag(CACHE_TAGS.DASHBOARD_LAYOUT(userId), DASHBOARD_LAYOUT_CACHE_TAG(userId))
  return loadDashboardLayout(userId)
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
  const shouldCache = FEATURE_FLAGS.ENABLE_QUERY_CACHING

  // If forceRefresh is true, bypass cache and fetch directly
  if (forceRefresh) {
    const start = performance.now()
    logger.info('[getUserData] Force refresh requested', { userId })

    const [core, tickDetails, financialEvents, supplemental] = await Promise.all([
      loadCoreUserData(authUserId, userId),
      loadGlobalTickDetails(),
      loadGlobalFinancialEvents(locale),
      loadSupplementalUserData(userId),
    ])

    logger.info('[getUserData] Force refresh completed', {
      userId,
      durationMs: Number((performance.now() - start).toFixed(2)),
    })

    return {
      userData: core.userData,
      subscription: core.subscription,
      tickDetails,
      tags: supplemental.tags,
      accounts: supplemental.accounts,
      groups: supplemental.groups,
      financialEvents,
      moodHistory: supplemental.moodHistory,
    }
  }

  const coreDataPromise = shouldCache
    ? getCoreUserDataCached(authUserId, userId)
    : loadCoreUserData(authUserId, userId)
  const tickDetailsPromise = shouldCache
    ? getGlobalTickDetailsCached()
    : loadGlobalTickDetails()
  const financialEventsPromise = shouldCache
    ? getGlobalFinancialEventsCached(locale)
    : loadGlobalFinancialEvents(locale)
  const supplementalDataPromise = shouldCache
    ? getSupplementalUserDataCached(userId)
    : loadSupplementalUserData(userId)

  const [core, tickDetails, financialEvents, supplemental] = await Promise.all([
    coreDataPromise,
    tickDetailsPromise,
    financialEventsPromise,
    supplementalDataPromise,
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

  try {
    const layout = await getDashboardLayoutCached(userId)

    if (!layout) return null

    // Helper to ensure we return a parsed object/array, not a string
    const parseIfNeeded = (val: Prisma.JsonValue): Prisma.JsonValue => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val) as Prisma.JsonValue
        } catch (error) {
          logger.error('[getDashboardLayout] Failed to parse dashboard JSON', { error, userId })
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
  const userId = await getDatabaseUserId()
  if (!userId) {
    return 0
  }
  await prisma.user.update({
    where: { id: userId },
    data: { isFirstConnection }
  })
  updateTag(`user-data-${userId}`)
}

export async function getUserDashboardTheme(): Promise<DashboardTheme | null> {
  const userId = await getDatabaseUserId()
  if (!userId) return null

  const hasDashboardThemeColumn = await isPrismaColumnAvailable(USER_TABLE_NAME, DASHBOARD_THEME_COLUMN)
  if (!hasDashboardThemeColumn) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dashboardTheme: true }
    })
    if (user?.dashboardTheme && VALID_DASHBOARD_THEMES.includes(user.dashboardTheme as DashboardTheme)) {
      return user.dashboardTheme as DashboardTheme
    }
    return null
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) {
      markPrismaColumnUnavailable(USER_TABLE_NAME, DASHBOARD_THEME_COLUMN)
    }
    logger.error('[getUserDashboardTheme] Error fetching user theme', { error, userId })
    return null
  }
}

export async function setUserDashboardTheme(theme: string): Promise<DashboardTheme> {
  const userId = await getDatabaseUserId()
  if (!userId) throw new Error('Unauthorized')
  if (!VALID_DASHBOARD_THEMES.includes(theme as DashboardTheme)) {
    throw new Error(`Invalid theme: ${theme}`)
  }

  const hasDashboardThemeColumn = await isPrismaColumnAvailable(USER_TABLE_NAME, DASHBOARD_THEME_COLUMN)
  if (!hasDashboardThemeColumn) {
    return 'blue'
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { dashboardTheme: theme },
      select: { dashboardTheme: true }
    })
    logger.info('[setUserDashboardTheme] Theme updated', { userId, theme })
    return updatedUser.dashboardTheme as DashboardTheme
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) {
      markPrismaColumnUnavailable(USER_TABLE_NAME, DASHBOARD_THEME_COLUMN)
      return 'blue'
    }
    logger.error('[setUserDashboardTheme] Error updating user theme', { error, userId, theme })
    throw new Error('Failed to update theme')
  }
}
