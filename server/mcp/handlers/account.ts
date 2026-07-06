/**
 * SECURITY: All queries and mutations in this file MUST be scoped by ctx.userId.
 * Never accept userId from args. Use requireUserId(ctx) and assertNoCrossUserAccess from '../security'.
 * Admin tools must additionally call requireAdmin(ctx).
 */

import { prisma } from '@/lib/prisma'
import { computeDrawdown } from '../../mcp-tools' // temporary reuse of existing helper during migration
import { requireUserId, assertNoCrossUserAccess } from '../security'
import type { McpAuthContext } from '../../mcp-auth'

export async function getAccountHealthHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)

  const accountFilter = typeof args.accountId === 'string' && args.accountId
    ? { id: args.accountId }
    : undefined

  const accounts = await prisma.account.findMany({
    where: { userId, ...(accountFilter || {}) },
    take: 200,
  })

  if (!accounts.length) {
    throw new Error(accountFilter ? 'Account not found' : 'No accounts found')
  }

  const now = new Date()
  const accountNumbers = accounts.map(a => a.number)
  const allTrades = await prisma.trade.findMany({
    where: { accountNumber: { in: accountNumbers }, userId },
    select: { pnl: true, entryDate: true, closeDate: true, accountNumber: true },
    orderBy: { entryDate: 'desc' },
    take: 10_000,
  })
  const tradesByAccount = new Map<string, typeof allTrades>()
  for (const t of allTrades) {
    const list = tradesByAccount.get(t.accountNumber)
    if (list) list.push(t)
    else tradesByAccount.set(t.accountNumber, [t])
  }

  const accountIds = accounts.map(a => a.id)
  const allPayouts = await prisma.payout.findMany({
    where: { accountId: { in: accountIds } },
    select: { amount: true, status: true, accountId: true },
    take: 200,
  })
  const payoutsByAccount = new Map<string, typeof allPayouts>()
  for (const p of allPayouts) {
    const list = payoutsByAccount.get(p.accountId)
    if (list) list.push(p)
    else payoutsByAccount.set(p.accountId, [p])
  }

  const results = accounts.map((acc) => {
    const trades = tradesByAccount.get(acc.number) || []

    const totalPnL = trades.reduce((sum, t) => sum + Number(t.pnl), 0)
    const currentBalance = Number(acc.startingBalance) + totalPnL

    const ddInfo = computeDrawdown(
      { startingBalance: Number(acc.startingBalance), drawdownThreshold: Number(acc.drawdownThreshold), buffer: Number(acc.buffer) },
      currentBalance,
    )

    const uniqueTradeDays = new Set(
      trades.map((t) => t.entryDate.toISOString().slice(0, 10)),
    ).size

    const profitTarget = Number(acc.profitTarget)
    const pnlSinceStart = totalPnL
    const profitTargetPct = profitTarget > 0 ? ((pnlSinceStart / profitTarget) * 100) : 0

    const trailingActive = acc.trailingDrawdown &&
      Number(acc.trailingStopProfit || 0) > 0 &&
      pnlSinceStart >= Number(acc.trailingStopProfit)

    const minDays = acc.minTradingDaysForPayout || 0
    const payoutEligible = !acc.evaluation ||
      (profitTargetPct >= 100 && uniqueTradeDays >= minDays)

    const payouts = payoutsByAccount.get(acc.id) || []
    const totalPayoutsReceived = payouts
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const last10PnL = trades.slice(0, 10).reduce((sum, t) => sum + Number(t.pnl), 0)

    const drawdownUsedPctNum = Number(ddInfo.drawdownUsedPct)
    const status = drawdownUsedPctNum > 80 ? 'CRITICAL' : drawdownUsedPctNum > 50 ? 'WARNING' : 'HEALTHY'

    return {
      id: acc.id,
      number: acc.number,
      propfirm: acc.propfirm,
      accountSize: acc.accountSize || '',
      startingBalance: Number(acc.startingBalance),
      currentBalance,
      pnl: totalPnL,
      drawdownUsed: ddInfo.drawdownUsed,
      drawdownUsedPct: ddInfo.drawdownUsedPct,
      bufferRemaining: ddInfo.bufferRemaining,
      atRisk: ddInfo.atRisk,
      status,
      profitTargetPct: profitTargetPct.toFixed(1),
      trailingActive,
      daysTraded: uniqueTradeDays,
      isEvaluation: acc.evaluation,
      payoutEligible,
      payoutsReceived: totalPayoutsReceived,
      recentPerformance: {
        last10TradesPnL: Number(last10PnL.toFixed(2)),
        tradeCount: trades.length,
      },
      dailyLossLimit: Number(acc.dailyLoss) || 0,
      lastUpdated: now.toISOString(),
    }
  })

  return results
}
