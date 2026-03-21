'use server'

import { prisma } from '@/lib/prisma'

export type LeaderboardEntry = {
  rank: number
  userId: string
  username: string
  monthlyPnl: number
  totalTrades: number
  winRate: number
}

export type LeaderboardSort = 'monthly_pnl' | 'winrate' | 'totalTrades'

function toUsername(email: string | null | undefined, fallbackId: string): string {
  const base = email?.split('@')[0]?.trim()
  if (base) return base
  return `Trader ${fallbackId.slice(0, 8)}`
}

export async function getLeaderboardData(
  sort: LeaderboardSort = 'monthly_pnl'
): Promise<LeaderboardEntry[]> {
  const eligibleUsers = await prisma.user.findMany({
    where: { showOnLeaderboard: true },
    select: { id: true, email: true },
  })

  if (eligibleUsers.length === 0) {
    return []
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const dateFilter = { closeDate: { gte: startOfMonth } }
  const userIds = eligibleUsers.map((user) => user.id)

  const [agg, winCounts, lossCounts] = await Promise.all([
    prisma.trade.groupBy({
      by: ['userId'],
      _sum: { pnl: true },
      _count: { id: true },
      where: {
        userId: { in: userIds },
        ...dateFilter,
      },
    }),
    prisma.trade.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        pnl: { gt: 0 },
        ...dateFilter,
      },
      _count: { id: true },
    }),
    prisma.trade.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        pnl: { lt: 0 },
        ...dateFilter,
      },
      _count: { id: true },
    }),
  ])

  const userMap = Object.fromEntries(
    eligibleUsers.map((user) => [user.id, toUsername(user.email, user.id)])
  )

  const winCountMap = Object.fromEntries(
    winCounts.map((entry) => [entry.userId, entry._count.id])
  )

  const lossCountMap = Object.fromEntries(
    lossCounts.map((entry) => [entry.userId, entry._count.id])
  )

  const entries: LeaderboardEntry[] = agg.map((entry) => {
    const winCount = winCountMap[entry.userId] ?? 0
    const lossCount = lossCountMap[entry.userId] ?? 0
    const totalDecisive = winCount + lossCount
    const totalTrades = entry._count.id
    const winRate = totalDecisive > 0 ? Math.round((winCount / totalDecisive) * 100) : 0

    return {
      rank: 0,
      userId: entry.userId,
      username: userMap[entry.userId] ?? toUsername(null, entry.userId),
      monthlyPnl: Number(entry._sum.pnl ?? 0),
      totalTrades,
      winRate,
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
    entries.sort((a, b) => b.monthlyPnl - a.monthlyPnl)
  }

  return entries.map((entry, idx) => ({ ...entry, rank: idx + 1 }))
}
