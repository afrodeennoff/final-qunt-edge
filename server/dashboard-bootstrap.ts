/*** Server Dashboard Bootstrap Loader
 *
 * Loads all data needed for the first dashboard render.
 * The 'use cache' directive enables SSR caching.
 */
import { cacheLife } from 'next/cache'
import { getUserId, getDatabaseUserId } from '@/server/auth'
import { getUserData } from '@/server/user-data'
import { getDashboardLayout } from '@/server/user-data'
import { getTradesAction } from '@/server/database'
import { deriveScoreMetricsFromTrades } from '@/lib/score-calculator'
import type { DashboardBootstrapPayload } from '@/lib/types/bootstrap'

const PAGE_SIZE = 500

/*** Get the dashboard bootstrap payload for SSR */
export async function getDashboardBootstrap(): Promise<DashboardBootstrapPayload> {
  'use cache'
  cacheLife({ stale: 60, revalidate: 60, expire: 300 })

  const userId = await getDatabaseUserId()

  if (!userId) {
    return createEmptyBootstrap()
  }

  // Load user data and layout in parallel
  const [userData, layout] = await Promise.all([
    getUserData(),
    getDashboardLayout(userId),
  ])

  const { userData: user, subscription, tickDetails, tags, accounts, groups, financialEvents } = userData

  // Load first page of trades
  const tradesResult = await getTradesAction(
    userId,
    1,
    PAGE_SIZE,
    false,
    false,
  )

  // Compute score metrics on serialized trades (ScoreTradeLike compatible)
  const scoreMetrics = deriveScoreMetricsFromTrades(tradesResult.trades)

  // Precomputed statistics skipped for now — requires normalized Trade[] with Date fields.
  // Client will compute full statistics from the serialized trade data.

  return {
    user: user ? {
      id: user.id,
      email: user.email,
      language: user.language,
      dashboardTheme: user.dashboardTheme,
    } : null,
    subscription: subscription ? {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      endDate: subscription.endDate ?? null,
      interval: subscription.interval ?? null,
    } : null,
    dashboardLayout: layout,
    timezone: user?.language ?? 'en',
    isAdmin: false,
    accounts,
    groups,
    tags,
    trades: tradesResult.trades,
    tradesPagination: {
      page: 1,
      pageSize: PAGE_SIZE,
      totalCount: tradesResult.metadata.total,
      hasMore: tradesResult.metadata.hasMore,
    },
    statistics: {
      cumulativeFees: 0,
      cumulativePnl: 0,
      winningStreak: 0,
      winRate: 0,
      nbTrades: 0,
      nbBe: 0,
      nbWin: 0,
      nbLoss: 0,
      totalPositionTime: 0,
      averagePositionTime: '0s',
      profitFactor: 1,
      grossLosses: 0,
      grossWin: 0,
      totalPayouts: 0,
      nbPayouts: 0,
    },
    scoreMetrics,
    tickDetails: tickDetails.map(t => ({
      id: t.id,
      ticker: t.ticker,
    })),
    financialEvents: financialEvents.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      type: e.type,
      description: e.description ?? null,
    })),
    bootstrappedAt: new Date().toISOString(),
  }
}

function createEmptyBootstrap(): DashboardBootstrapPayload {
  return {
    user: null,
    subscription: null,
    dashboardLayout: null,
    timezone: 'en',
    isAdmin: false,
    accounts: [],
    groups: [],
    tags: [],
    trades: [],
    tradesPagination: {
      page: 1,
      pageSize: PAGE_SIZE,
      totalCount: 0,
      hasMore: false,
    },
    statistics: {
      cumulativeFees: 0,
      cumulativePnl: 0,
      winningStreak: 0,
      winRate: 0,
      nbTrades: 0,
      nbBe: 0,
      nbWin: 0,
      nbLoss: 0,
      totalPositionTime: 0,
      averagePositionTime: '0s',
      profitFactor: 1,
      grossLosses: 0,
      grossWin: 0,
      totalPayouts: 0,
      nbPayouts: 0,
    },
    scoreMetrics: {
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
    },
    tickDetails: [],
    financialEvents: [],
    bootstrappedAt: new Date().toISOString(),
  }
}
