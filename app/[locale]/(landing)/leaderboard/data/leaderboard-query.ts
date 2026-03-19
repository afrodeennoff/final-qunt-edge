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

export async function getLeaderboardData(
  sort: 'monthly_pnl' | 'alltime_pnl' | 'winrate' = 'monthly_pnl'
): Promise<LeaderboardEntry[]> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const isMonthly = sort !== 'alltime_pnl'
  const dateFilter = isMonthly ? { closeDate: { gte: startOfMonth } } : {}

  const agg = await prisma.trade.groupBy({
    by: ['userId'],
    _sum: { pnl: true },
    _count: { id: true },
    where: dateFilter,
    orderBy: sort === 'winrate'
      ? undefined
      : { _sum: { pnl: 'desc' } },
    take: 100,
  })

  const userIds = agg.map((a) => a.userId)

  const [users, winCounts] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true },
    }),
    prisma.trade.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, pnl: { gt: 0 }, ...dateFilter },
      _count: { id: true },
    }),
  ])

  const userMap = Object.fromEntries(
    users.map((u) => [u.id, u.email?.split('@')[0] ?? 'Trader'])
  )

  const winCountMap = Object.fromEntries(
    winCounts.map((w) => [w.userId, w._count.id])
  )

  const entries: LeaderboardEntry[] = agg.map((entry) => {
    const winCount = winCountMap[entry.userId] ?? 0
    const total = entry._count.id
    return {
      rank: 0,
      userId: entry.userId,
      username: userMap[entry.userId] || 'Anonymous',
      monthlyPnl: Number(entry._sum.pnl ?? 0),
      totalTrades: total,
      winRate: total > 0 ? Math.round((winCount / total) * 100) : 0,
    }
  })

  if (sort === 'winrate') {
    entries.sort((a, b) => b.winRate - a.winRate || b.monthlyPnl - a.monthlyPnl)
  }

  return entries.map((entry, idx) => ({ ...entry, rank: idx + 1 }))
}
