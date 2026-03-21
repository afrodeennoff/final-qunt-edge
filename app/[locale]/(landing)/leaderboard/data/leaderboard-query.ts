'use server'

import { prisma } from '@/lib/prisma'
import { getDatabaseUserId } from '@/server/auth'
import { unstable_cache } from 'next/cache'

export type LeaderboardEntry = {
  rank: number
  userId: string | null
  username: string
  monthlyPnl: number | null
  totalTrades: number | null
  winRate: number
}

export type LeaderboardEntryPublic = Omit<LeaderboardEntry, 'userId'>

const _getLeaderboardData = async (
  sort: 'monthly_pnl' | 'alltime_pnl' | 'winrate' = 'monthly_pnl'
): Promise<LeaderboardEntry[]> => {
  // Check if user is authenticated
  let userId: string | null = null
  try {
    userId = await getDatabaseUserId()
  } catch (error) {
    // User is not authenticated, continue with anonymous view
    userId = null
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const isMonthly = sort !== 'alltime_pnl'
  const dateFilter = isMonthly ? { closeDate: { gte: startOfMonth } } : {}

  // Get aggregated trade data
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

  // Get user information for authenticated users
  const userIds = agg.map((a) => a.userId)
  const [users, winCounts, lossCounts] = await Promise.all([
    prisma.user.findMany({
      where: { 
        id: { in: userIds },
        showOnLeaderboard: true
      },
      select: { id: true, email: true },
    }),
    // Count winning trades (pnl > 0)
    prisma.trade.groupBy({
      by: ['userId'],
      where: { 
        userId: { in: userIds }, 
        pnl: { gt: 0 }, 
        ...dateFilter 
      },
      _count: { id: true },
    }),
    // Count losing trades (pnl < 0) - for accurate win rate calculation
    prisma.trade.groupBy({
      by: ['userId'],
      where: { 
        userId: { in: userIds }, 
        pnl: { lt: 0 }, 
        ...dateFilter 
      },
      _count: { id: true },
    }),
  ])

  // Create maps for quick lookup
  const userMap = Object.fromEntries(
    users.map((u) => [u.id, u.email?.split('@')[0] ?? 'Anonymous'])
  )

  const winCountMap = Object.fromEntries(
    winCounts.map((w) => [w.userId, w._count.id])
  )

  const lossCountMap = Object.fromEntries(
    lossCounts.map((l) => [l.userId, l._count.id])
  )

  // Build leaderboard entries
  const entries: LeaderboardEntry[] = agg.map((entry) => {
    const userIdStr = entry.userId
    const winCount = winCountMap[userIdStr] ?? 0
    const lossCount = lossCountMap[userIdStr] ?? 0
    const totalDecisive = winCount + lossCount  // Exclude breakeven trades
    const totalTrades = entry._count.id
    
    // Calculate win rate excluding breakeven trades
    const winRate = totalDecisive > 0 ? Math.round((winCount / totalDecisive) * 100) : 0
    
    // Determine what data to show based on authentication
    const showFullDetails = userId !== null && userId === userIdStr && userMap[userIdStr] !== 'Anonymous'
    
    return {
      rank: 0,
      userId: showFullDetails ? userIdStr : null,
      username: showFullDetails 
        ? (userMap[userIdStr] || 'Anonymous') 
        : `Trader #${Math.floor(Math.random() * 1000)}`, // Anonymized for privacy
      monthlyPnl: showFullDetails 
        ? Number(entry._sum.pnl ?? 0) 
        : null, // Hide exact PnL for anonymous users
      totalTrades: showFullDetails ? totalTrades : null, // Hide exact trade count
      winRate: winRate // Win rate is safe to show (aggregated statistic)
    }
  })
  
  // Sort based on the selected criteria
  if (sort === 'winrate') {
    entries.sort((a, b) => {
      // Primary sort by win rate, secondary by monthly PnL for tie-breaking
      if (b.winRate !== a.winRate) return b.winRate - a.winRate
      
      // For win rate sorting, use monthly PnL as tie-breaker
      const aPnl = a.monthlyPnl ?? 0
      const bPnl = b.monthlyPnl ?? 0
      return bPnl - aPnl
    })
  } else {
    // For PnL sorting, handle null values (anonymous users show null)
    entries.sort((a, b) => {
      const aPnl = a.monthlyPnl ?? 0
      const bPnl = b.monthlyPnl ?? 0
      return bPnl - aPnl
    })
  }
  
  // Add rank numbers
  return entries.map((entry, idx) => ({ ...entry, rank: idx + 1 }))
};

export const getLeaderboardData = unstable_cache(
  _getLeaderboardData,
  ['leaderboard'],
  { revalidate: 300, tags: ['leaderboard'] }
)