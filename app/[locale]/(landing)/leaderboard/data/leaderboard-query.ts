'use server'

import { prisma } from '@/lib/prisma'

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
}

export type LeaderboardSort = 'monthly_pnl' | 'winrate' | 'totalTrades'

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

function isMissingColumnError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2022'
  )
}

export async function getLeaderboardData(
  sort: LeaderboardSort = 'monthly_pnl'
): Promise<LeaderboardEntry[]> {
  let eligibleUsers: Array<{ id: string; email: string | null }> = []

  try {
    eligibleUsers = await prisma.user.findMany({
      where: { showOnLeaderboard: true },
      select: { id: true, email: true },
    })
  } catch (error) {
    if (isMissingColumnError(error)) {
      console.warn('[Leaderboard] Missing showOnLeaderboard column; returning empty public leaderboard until schema is updated.')
      return []
    }

    throw error
  }

  if (eligibleUsers.length === 0) {
    return []
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const userIds = eligibleUsers.map((user) => user.id)
  const dateFilter = { closeDate: { gte: startOfMonth } }

  const [agg, accounts, monthlyTrades] = await Promise.all([
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
  ])

  const userMap = Object.fromEntries(
    eligibleUsers.map((user) => [user.id, toUsername(user.email, user.id)])
  )

  const accountBalanceMap = new Map(
    accounts.map((entry) => [entry.userId, Number(entry._sum.startingBalance ?? 0)])
  )

  const tradesByUser = new Map<string, Array<{
    pnl: number
    instrument: string
    timeInPosition: number
  }>>()

  monthlyTrades.forEach((trade) => {
    const existing = tradesByUser.get(trade.userId) ?? []
    existing.push({
      pnl: Number(trade.pnl),
      instrument: trade.instrument,
      timeInPosition: Number(trade.timeInPosition ?? 0),
    })
    tradesByUser.set(trade.userId, existing)
  })

  const entries: LeaderboardEntry[] = agg.map((entry) => {
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
    }
  })

  if (sort === 'winrate') {
    entries.sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate
      return b.monthlyPnl - a.monthlyPnl
    })
  } else if (sort === 'totalTrades') {
    entries.sort((a, b) => {
      if (b.totalTrades !== a.totalTrades) return b.totalTrades - a.totalTrades
      return b.monthlyPnl - a.monthlyPnl
    })
  } else {
    entries.sort((a, b) => {
      if (b.monthlyPnl !== a.monthlyPnl) return b.monthlyPnl - a.monthlyPnl
      return b.winRate - a.winRate
    })
  }

  return entries.map((entry, idx) => ({ ...entry, rank: idx + 1 }))
}
