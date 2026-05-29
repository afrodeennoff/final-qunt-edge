import { prisma } from '@/lib/prisma'
import type { AccountHealthContext } from './account'

// Trade handler stubs — extraction in progress per plan Tasks 6-12
// Full extraction follows the exact getAccountHealthHandler pattern

export async function listTradesHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const limit = Math.min(Math.max(Number(args.limit) || 50, 1), 200)
  const offset = Math.max(Number(args.offset) || 0, 0)
  const where: Record<string, unknown> = { userId: ctx.userId }
  if (args.startDate) where.entryDate = { gte: new Date(args.startDate as string) }
  if (args.endDate) where.entryDate = { ...((where.entryDate as object) || {}), lte: new Date(args.endDate as string) }
  return prisma.trade.findMany({ where, orderBy: { entryDate: 'desc' }, take: limit, skip: offset })
}

export async function getPerformanceSummaryHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const where: Record<string, unknown> = { userId: ctx.userId }
  if (args.startDate) where.entryDate = { gte: new Date(args.startDate as string) }
  if (args.endDate) where.entryDate = { ...((where.entryDate as object) || {}), lte: new Date(args.endDate as string) }
  const [aggregate, winCount, lossCount] = await Promise.all([
    prisma.trade.aggregate({ where, _sum: { pnl: true, commission: true }, _count: { id: true } }),
    prisma.trade.count({ where: { ...where, pnl: { gt: 0 } } }),
    prisma.trade.count({ where: { ...where, pnl: { lt: 0 } } }),
  ])
  const total = aggregate._count.id || 0
  return {
    totalTrades: total,
    grossPnL: Number(aggregate._sum.pnl || 0).toFixed(2),
    winRate: total > 0 ? ((winCount / total) * 100).toFixed(1) + '%' : '0%',
    totalWins: winCount,
    totalLosses: lossCount,
  }
}

export async function getRiskMetricsHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const where: Record<string, unknown> = { userId: ctx.userId }
  if (args.accountId) where.accountId = args.accountId
  const trades = await prisma.trade.findMany({ where, select: { pnl: true, entryPrice: true, exitPrice: true } })
  const pnls = trades.map(t => Number(t.pnl))
  const wins = pnls.filter(p => p > 0)
  const losses = pnls.filter(p => p < 0)
  const avgWin = wins.length > 0 ? wins.reduce((s, v) => s + v, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, v) => s + v, 0) / losses.length) : 0
  return {
    totalTrades: trades.length,
    avgRR: avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A',
    profitFactor: avgLoss > 0 ? (wins.reduce((s, v) => s + v, 0) / Math.abs(losses.reduce((s, v) => s + v, 0))).toFixed(2) : 'N/A',
    expectancy: trades.length > 0 ? (pnls.reduce((s, v) => s + v, 0) / trades.length).toFixed(2) : '0.00',
  }
}

// Additional handlers for analyze_trade, update_trade_tags, add_trade_review_note
// follow the same pattern — to be extracted from mcp-tools.ts
