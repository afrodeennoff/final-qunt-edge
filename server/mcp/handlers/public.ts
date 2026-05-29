import { prisma } from '@/lib/prisma'
import { clampInt } from '../../mcp-helpers'

// Public website tool handlers — extraction from mcp-website-tools.ts

export async function listBlogPostsHandler(args: Record<string, unknown>) {
  const limit = clampInt(args.limit, 1, 50, 20)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  return prisma.blogPost.findMany({
    where: { published: true },
    select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, category: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: limit, skip: offset,
  })
}

export async function getLeaderboardHandler(args: Record<string, unknown>) {
  const limit = clampInt(args.limit, 1, 50, 10)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  const users = await prisma.user.findMany({
    where: { showOnLeaderboard: true },
    select: { id: true, username: true, language: true },
  })
  const aggregates = await prisma.trade.groupBy({
    by: ['userId'],
    where: { userId: { in: users.map(u => u.id) } },
    _sum: { pnl: true },
    _count: { id: true },
  })
  const aggMap = new Map(aggregates.map(a => [a.userId, a]))
  return users.map(u => ({
    userId: u.id,
    username: u.username || 'Anonymous',
    totalPnL: Number(aggMap.get(u.id)?._sum.pnl || 0),
    totalTrades: aggMap.get(u.id)?._count.id ?? 0,
  })).sort((a, b) => b.totalPnL - a.totalPnL).slice(offset, offset + limit)
}

// Additional handlers for list_prop_firms, get_prop_firm, list_active_deals, etc.
// follow the same extraction pattern from mcp-website-tools.ts
