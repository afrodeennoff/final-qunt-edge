import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { cacheLife, cacheTag } from 'next/cache'
import { isPrismaSchemaMismatchError } from '@/lib/prisma-guard'

export type LeaderboardEntry = {
  rank: number
  userId: string
  username: string
  monthlyPnl: number
  totalTrades: number
  winRate: number
  returnPct: number
  topInstrument: string | null
  avgWin: number
  avgLoss: number
  avgDurationMinutes: number
  longestWinStreak: number
  longestLossStreak: number
  accountCount: number
}

 export type LeaderboardSort = 'monthly_pnl' | 'winrate' | 'totalTrades'

 type LeaderboardSeed = Omit<LeaderboardEntry, 'rank'>

function toUsername(email: string | null | undefined, fallbackId: string): string {
  const base = email?.split('@')[0]?.trim()
  if (base) return base
  return `Trader ${fallbackId.slice(0, 8)}`
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function computeLongestStreak(values: number[], mode: 'win' | 'loss'): number {
  let max = 0
  let current = 0

  values.forEach((pnl) => {
    const matches = mode === 'win' ? pnl > 0 : pnl < 0
    if (!matches) {
      current = 0
      return
    }

    current += 1
    if (current > max) {
      max = current
    }
  })

  return max
}

function sortAndRankLeaderboardEntries(
  entries: Array<LeaderboardSeed>,
  sort: LeaderboardSort,
): LeaderboardEntry[] {
  const next = [...entries]

  if (sort === 'winrate') {
    next.sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate
      return b.monthlyPnl - a.monthlyPnl
    })
  } else if (sort === 'totalTrades') {
    next.sort((a, b) => {
      if (b.totalTrades !== a.totalTrades) return b.totalTrades - a.totalTrades
      return b.monthlyPnl - a.monthlyPnl
    })
  } else {
    next.sort((a, b) => {
      if (b.monthlyPnl !== a.monthlyPnl) return b.monthlyPnl - a.monthlyPnl
      return b.winRate - a.winRate
    })
  }

  return next.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
}

 function getEmptyLeaderboardEntries(): LeaderboardEntry[] {
   return []
 }

function isMissingColumnError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2022'
  )
}

function isLeaderboardUnavailableError(error: unknown): boolean {
  if (isMissingColumnError(error) || isPrismaSchemaMismatchError(error)) {
    return true
  }

  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }
  const message = (maybeError.message ?? '').toLowerCase()

  return (
    maybeError.code === 'ECONNREFUSED' ||
    maybeError.code === 'P1001' ||
    message.includes('econnrefused') ||
    message.includes('can\'t reach database server')
  )
}

export async function getLeaderboardData(
  sort: LeaderboardSort = 'monthly_pnl'
): Promise<LeaderboardEntry[]> {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 600 })
  cacheTag('leaderboard')
  if (!hasConfiguredDatabaseConnection) {
    console.warn('[Leaderboard] Database connection is missing; returning empty leaderboard entries.')
    return getEmptyLeaderboardEntries()
  }

  let eligibleUsers: Array<{ id: string; email: string | null; username: string | null }> = []

  try {
    eligibleUsers = await prisma.user.findMany({
      where: { showOnLeaderboard: true },
      select: { id: true, email: true, username: true },
    })
  } catch (error) {
    if (isLeaderboardUnavailableError(error)) {
      console.warn('[Leaderboard] Leaderboard query unavailable; returning empty leaderboard entries.')
      return getEmptyLeaderboardEntries()
    }

    throw error
  }

  if (!eligibleUsers || eligibleUsers.length === 0) {
    return []
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const userIds = eligibleUsers.map((user) => user.id)
  const dateFilter = { closeDate: { gte: startOfMonth } }

  let aggregateRows: Array<{
    userId: string
    _sum: { pnl: unknown }
    _count: { id: number }
  }> = []
  let accountRows: Array<{
    userId: string
    _sum: { startingBalance: unknown }
  }> = []
  let monthlyTradeRows: Array<{
    userId: string
    pnl: unknown
    instrument: string
    timeInPosition: unknown
    closeDate: Date
  }> = []
  let accountCountRows: Array<{
    userId: string
    _count: { id: number }
  }> = []

  try {
    const [agg, accounts, monthlyTrades, accountCounts] = await Promise.all([
      prisma.trade.groupBy({
        by: ['userId'],
        _sum: { pnl: true },
        _count: { id: true },
        where: {
          userId: { in: userIds },
          ...dateFilter,
        },
      }),
      prisma.account.groupBy({
        by: ['userId'],
        _sum: { startingBalance: true },
        where: {
          userId: { in: userIds },
        },
      }),
      prisma.trade.findMany({
        where: {
          userId: { in: userIds },
          ...dateFilter,
        },
        select: {
          userId: true,
          pnl: true,
          instrument: true,
          timeInPosition: true,
          closeDate: true,
        },
        orderBy: [
          { userId: 'asc' },
          { closeDate: 'asc' },
        ],
      }),
      prisma.account.groupBy({
        by: ['userId'],
        _count: { id: true },
        where: {
          userId: { in: userIds },
        },
      }),
    ])

    aggregateRows = (Array.isArray(agg) ? agg : []).map((entry) => ({
      userId: entry.userId,
      _sum: { pnl: entry._sum.pnl },
      _count: { id: entry._count.id },
    }))
    accountRows = (Array.isArray(accounts) ? accounts : []).map((entry) => ({
      userId: entry.userId,
      _sum: { startingBalance: entry._sum.startingBalance },
    }))
    monthlyTradeRows = (Array.isArray(monthlyTrades) ? monthlyTrades : []).map((trade) => ({
      userId: trade.userId,
      pnl: trade.pnl,
      instrument: trade.instrument,
      timeInPosition: trade.timeInPosition,
      closeDate: trade.closeDate,
    }))
    accountCountRows = (Array.isArray(accountCounts) ? accountCounts : []).map((entry) => ({
      userId: entry.userId,
      _count: { id: entry._count?.id ?? 0 },
    }))
  } catch (error) {
    if (!isLeaderboardUnavailableError(error)) {
      throw error
    }

    console.warn('[Leaderboard] Query unavailable; returning empty leaderboard entries.')
    return getEmptyLeaderboardEntries()
  }
  const userMap = Object.fromEntries(
    eligibleUsers.map((user) => [user.id, toUsername(user.email, user.id)])
  )

  const accountBalanceMap = new Map(
    accountRows.map((entry) => [entry.userId, Number(entry._sum.startingBalance ?? 0)])
  )

  const accountCountMap = new Map(
    accountCountRows.map((entry) => [entry.userId, entry._count?.id ?? 0])
  )

  const tradesByUser = new Map<string, Array<{
    pnl: number
    instrument: string
    timeInPosition: number
  }>>()

  monthlyTradeRows.forEach((trade) => {
    const existing = tradesByUser.get(trade.userId) ?? []
    existing.push({
      pnl: Number(trade.pnl),
      instrument: trade.instrument,
      timeInPosition: Number(trade.timeInPosition ?? 0),
    })
    tradesByUser.set(trade.userId, existing)
  })

  const entries: LeaderboardEntry[] = aggregateRows.map((entry) => {
    const trades = tradesByUser.get(entry.userId) ?? []
    const pnlValues = trades.map((trade) => trade.pnl)
    const winTrades = pnlValues.filter((value) => value > 0)
    const lossTrades = pnlValues.filter((value) => value < 0)
    const decisiveTrades = winTrades.length + lossTrades.length
    const totalTrades = entry._count.id
    const monthlyPnl = Number(entry._sum.pnl ?? 0)
    const totalBalance = accountBalanceMap.get(entry.userId) ?? 0
    const winRate = decisiveTrades > 0 ? round((winTrades.length / decisiveTrades) * 100) : 0
    const returnPct = totalBalance > 0 ? round((monthlyPnl / totalBalance) * 100) : 0
    const avgWin = winTrades.length > 0 ? round(winTrades.reduce((sum, value) => sum + value, 0) / winTrades.length) : 0
    const avgLoss = lossTrades.length > 0 ? round(Math.abs(lossTrades.reduce((sum, value) => sum + value, 0) / lossTrades.length)) : 0
    const avgDurationMinutes = trades.length > 0
      ? round(trades.reduce((sum, trade) => sum + trade.timeInPosition, 0) / trades.length)
      : 0

    const instrumentCounts = new Map<string, number>()
    trades.forEach((trade) => {
      instrumentCounts.set(trade.instrument, (instrumentCounts.get(trade.instrument) ?? 0) + 1)
    })

    const topInstrument = Array.from(instrumentCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null

    return {
      rank: 0,
      userId: entry.userId,
      username: userMap[entry.userId] ?? toUsername(null, entry.userId),
      monthlyPnl,
      totalTrades,
      winRate,
      returnPct,
      topInstrument,
      avgWin,
      avgLoss,
      avgDurationMinutes,
      longestWinStreak: computeLongestStreak(pnlValues, 'win'),
      longestLossStreak: computeLongestStreak(pnlValues, 'loss'),
      accountCount: accountCountMap.get(entry.userId) ?? 0,
    }
  })

  return sortAndRankLeaderboardEntries(entries, sort)
}

// Server Action for client-side polling - fetches fresh leaderboard data
export async function refreshLeaderboardData(
  sort: LeaderboardSort = 'monthly_pnl'
): Promise<{ entries: LeaderboardEntry[]; lastUpdated: string }> {
  const entries = await getLeaderboardData(sort)
  const lastUpdated = new Date().toISOString()
  
  return { entries, lastUpdated }
}
