import { prisma } from '@/lib/prisma'
import { computeDrawdown } from '../mcp-tools' // temporary reuse of existing helper during migration

export interface AccountHealthContext {
  userId: string
}

export async function getAccountHealthHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const accountFilter = typeof args.accountId === 'string' && args.accountId
    ? { id: args.accountId }
    : undefined

  const accounts = await prisma.account.findMany({
    where: { userId: ctx.userId, ...(accountFilter || {}) },
  })

  if (!accounts.length) {
    throw new Error(accountFilter ? 'Account not found' : 'No accounts found')
  }

  const now = new Date()
  const results = await Promise.all(accounts.map(async (acc) => {
    const trades = await prisma.trade.findMany({
      where: { accountNumber: acc.number, userId: ctx.userId },
      select: { pnl: true, entryDate: true, closeDate: true },
      orderBy: { entryDate: 'desc' },
    })

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

    const payouts = await prisma.payout.findMany({
      where: { accountId: acc.id },
      select: { amount: true, status: true },
    })

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
  }))

  return results
}
