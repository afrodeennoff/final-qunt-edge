'use server'
import { prisma } from '@/lib/prisma'

export type LeaderboardEntry = {
  rank: number
  userId: string
  username: string
  monthlyPnl: number
  totalTrades: number
  winRate: number
  consistency: number
}

export async function getLeaderboardData(
  sort: 'monthly_pnl' | 'alltime_pnl' | 'winrate' = 'monthly_pnl'
): Promise<LeaderboardEntry[]> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Aggregate trades by user for the current month
  const monthlyAgg: any[] = await prisma.trade.groupBy({
    by: ['userId'],
    _sum: { pnl: true },
    _count: { id: true },
    where: { closeDate: { gte: startOfMonth } },
    orderBy: { _sum: { pnl: 'desc' } as any },
    take: 100,
  }) as any

  // Fetch user metadata to map userId -> username
  const userIds = monthlyAgg.map((a: any) => a.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  })
  const userMap = Object.fromEntries(
    users.map((u) => [u.id, u.email?.split('@')[0] ?? 'Trader'] as [string, string])
  )

  return monthlyAgg.map((entry, idx) => ({
    rank: idx + 1,
    userId: entry.userId,
    username: userMap[entry.userId] || 'Anonymous',
    monthlyPnl: Number(entry._sum.pnl ?? 0),
    totalTrades: (entry._count?.id ?? 0),
    winRate: 0,
    consistency: 0,
  }))
}
