/**
 * SECURITY: All queries and mutations in this file MUST be scoped by ctx.userId.
 * Never accept userId from args. Use requireUserId(ctx) and assertNoCrossUserAccess from '../security'.
 * Admin tools must additionally call requireAdmin(ctx).
 */

import { prisma } from '@/lib/prisma'
import type { AccountHealthContext } from './account'
import { requireUserId, assertNoCrossUserAccess } from '../security'

// Trade handler stubs — extraction in progress per plan Tasks 6-12
// Full extraction follows the exact getAccountHealthHandler pattern

export async function listTradesHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const limit = Math.min(Math.max(Number(args.limit) || 50, 1), 200)
  const offset = Math.max(Number(args.offset) || 0, 0)
  const where: Record<string, unknown> = { userId }
  if (args.startDate) where.entryDate = { gte: new Date(args.startDate as string) }
  if (args.endDate) where.entryDate = { ...((where.entryDate as object) || {}), lte: new Date(args.endDate as string) }
  return prisma.trade.findMany({ where, orderBy: { entryDate: 'desc' }, take: limit, skip: offset })
}

export async function getPerformanceSummaryHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const where: Record<string, unknown> = { userId }
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
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)
  const where: Record<string, unknown> = { userId }
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

export async function createTradeHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)

  // Basic required field validation (inputSchema will also enforce at tool level)
  const accountNumber = typeof args.accountNumber === 'string' && args.accountNumber.trim()
    ? args.accountNumber.trim()
    : null
  const instrument = typeof args.instrument === 'string' && args.instrument.trim()
    ? args.instrument.trim()
    : null
  if (!accountNumber) throw new Error('accountNumber is required')
  if (!instrument) throw new Error('instrument is required')

  // Verify account belongs to this user (strict scoping)
  const account = await prisma.account.findFirst({
    where: { number: accountNumber, userId },
    select: { number: true },
  })
  if (!account) {
    throw new Error('Account not found')
  }

  // Parse dates (accept ISO strings)
  const entryDate = args.entryDate ? new Date(args.entryDate as string) : null
  const closeDate = args.closeDate ? new Date(args.closeDate as string) : null
  if (!entryDate || Number.isNaN(entryDate.getTime())) throw new Error('Valid entryDate (ISO string) is required')
  if (!closeDate || Number.isNaN(closeDate.getTime())) throw new Error('Valid closeDate (ISO string) is required')

  // Numeric fields with safe defaults
  const quantity = typeof args.quantity === 'number' ? args.quantity : 0
  const entryPrice = typeof args.entryPrice === 'number' ? args.entryPrice : 0
  const closePrice = typeof args.closePrice === 'number' ? args.closePrice : 0
  const commission = typeof args.commission === 'number' ? args.commission : 0
  const side = typeof args.side === 'string' ? args.side : ''
  const comment = typeof args.comment === 'string' ? args.comment : null
  const tags = Array.isArray(args.tags) ? args.tags.filter((t: unknown) => typeof t === 'string') : []

  // Compute pnl if not explicitly provided (LONG: (close-entry)*qty ; SHORT: (entry-close)*qty )
  let pnl = typeof args.pnl === 'number' ? args.pnl : 0
  if (typeof args.pnl !== 'number') {
    const direction = side.toUpperCase() === 'SHORT' || side.toUpperCase() === 'SELL' ? -1 : 1
    pnl = (closePrice - entryPrice) * direction * quantity - commission
  }

  const trade = await prisma.trade.create({
    data: {
      userId, // FROM CTX ONLY — never from args
      accountNumber,
      instrument,
      side,
      quantity,
      entryPrice,
      closePrice,
      pnl,
      commission,
      entryDate,
      closeDate,
      comment,
      tags,
      // defaults for other fields (entryId etc) handled by Prisma @default
    },
  })

  return trade
}

export async function updateTradeHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)

  const tradeId = typeof args.tradeId === 'string' && args.tradeId.trim() ? args.tradeId.trim() : null
  if (!tradeId) throw new Error('tradeId is required')

  // Verify ownership + fetch current values for potential pnl recompute (like createTrade)
  const current = await prisma.trade.findFirst({
    where: { id: tradeId, userId },
    select: {
      id: true,
      accountNumber: true,
      instrument: true,
      side: true,
      quantity: true,
      entryPrice: true,
      closePrice: true,
      commission: true,
      pnl: true,
    },
  })
  if (!current) {
    throw new Error('Trade not found')
  }

  const updates: Record<string, unknown> = {}

  if (typeof args.instrument === 'string' && args.instrument.trim()) updates.instrument = args.instrument.trim()
  if (typeof args.side === 'string') updates.side = args.side
  if (typeof args.quantity === 'number') updates.quantity = args.quantity
  if (typeof args.entryPrice === 'number') updates.entryPrice = args.entryPrice
  if (typeof args.closePrice === 'number') updates.closePrice = args.closePrice
  if (typeof args.commission === 'number') updates.commission = args.commission
  if (typeof args.comment === 'string' || args.comment === null) updates.comment = args.comment
  if (Array.isArray(args.tags)) updates.tags = args.tags.filter((t: unknown) => typeof t === 'string')

  // Dates (ISO strings)
  if (args.entryDate != null) {
    const d = new Date(args.entryDate as string)
    if (Number.isNaN(d.getTime())) throw new Error('Invalid entryDate (ISO string)')
    updates.entryDate = d
  }
  if (args.closeDate != null) {
    const d = new Date(args.closeDate as string)
    if (Number.isNaN(d.getTime())) throw new Error('Invalid closeDate (ISO string)')
    updates.closeDate = d
  }

  // Account change (verify new account owned by user)
  if (typeof args.accountNumber === 'string' && args.accountNumber.trim()) {
    const newAcc = args.accountNumber.trim()
    if (newAcc !== current.accountNumber) {
      const account = await prisma.account.findFirst({
        where: { number: newAcc, userId },
        select: { number: true },
      })
      if (!account) throw new Error('Account not found')
      updates.accountNumber = newAcc
    }
  }

  // Auto-recompute pnl on price/qty/side/comm changes if pnl not explicitly provided (mirrors createTrade logic)
  const hasCalcFields = updates.entryPrice !== undefined || updates.closePrice !== undefined ||
                        updates.quantity !== undefined || updates.side !== undefined || updates.commission !== undefined
  if (typeof args.pnl !== 'number' && hasCalcFields) {
    const finalEntry = updates.entryPrice !== undefined ? (updates.entryPrice as number) : Number(current.entryPrice)
    const finalClose = updates.closePrice !== undefined ? (updates.closePrice as number) : Number(current.closePrice)
    const finalQty = updates.quantity !== undefined ? (updates.quantity as number) : Number(current.quantity)
    const finalSide = (updates.side as string) || current.side || ''
    const finalComm = updates.commission !== undefined ? (updates.commission as number) : Number(current.commission)
    const direction = finalSide.toUpperCase() === 'SHORT' || finalSide.toUpperCase() === 'SELL' ? -1 : 1
    updates.pnl = (finalClose - finalEntry) * direction * finalQty - finalComm
  } else if (typeof args.pnl === 'number') {
    updates.pnl = args.pnl
  }

  if (Object.keys(updates).length === 0) throw new Error('No fields to update')

  const updated = await prisma.trade.update({
    where: { id: tradeId, userId },
    data: updates as Parameters<typeof prisma.trade.update>[0]['data'],
  })

  return updated
}
