import { prisma } from '@/lib/prisma'
import type { McpAuthContext } from './mcp-auth'

export interface AccountHealthSnapshot {
  id: string
  number: string
  propfirm: string
  accountSize: string
  startingBalance: number
  currentBalance: number
  pnl: number
  drawdownUsed: number
  drawdownUsedPct: string
  bufferRemaining: number
  atRisk: boolean
  profitTargetPct: string
  trailingActive: boolean
  daysTraded: number
  isEvaluation: boolean
  payoutEligible: boolean
}

export interface PerformanceContext {
  totalTrades: number
  grossPnL: string
  netPnL: string
  winRate: string
  totalWins: number
  totalLosses: number
  avgWin: string
  avgLoss: string
  profitFactor: string
}

export interface RiskContext {
  totalTrades: number
  maxDrawdown: number
  maxDrawdownPct: string
  avgRiskPerTrade: string
  avgRR: string
  bestRR: string
  worstRR: string
  expectancy: string
  profitFactor: string
  sharpeRatio: string
  violationCount: number
}

function computeDrawdownInfo(startingBalance: number, drawdownThreshold: number, buffer: number, currentBalance: number) {
  const maxLossAllowed = drawdownThreshold || 0
  const bufferAmount = buffer || 0
  const balanceUsed = startingBalance - currentBalance
  const adjustedDrawdown = maxLossAllowed + bufferAmount
  const drawdownUsed = Math.max(0, balanceUsed)
  const drawdownUsedPct = adjustedDrawdown > 0 ? (drawdownUsed / adjustedDrawdown) * 100 : 0
  return {
    drawdownUsed,
    drawdownUsedPct: drawdownUsedPct.toFixed(1),
    bufferRemaining: Math.max(0, adjustedDrawdown - drawdownUsed),
    atRisk: drawdownUsedPct > 80,
  }
}

export async function buildAccountHealthSnapshot(ctx: McpAuthContext, accountId?: string): Promise<AccountHealthSnapshot[]> {
  const where: Record<string, unknown> = { userId: ctx.userId }
  if (accountId) where.id = accountId

  const accounts = await prisma.account.findMany({
    where: where as any,
    take: 200,
  })

  const accountNumbers = accounts.map((a) => a.number)
  const allTrades = await prisma.trade.findMany({
    where: { accountNumber: { in: accountNumbers }, userId: ctx.userId },
    select: { pnl: true, entryDate: true, closeDate: true, accountNumber: true },
    take: 10_000,
  })
  const tradesByAccount = new Map<string, typeof allTrades>()
  for (const t of allTrades) {
    const list = tradesByAccount.get(t.accountNumber)
    if (list) list.push(t)
    else tradesByAccount.set(t.accountNumber, [t])
  }

  const results = accounts.map((acc) => {
    const trades = tradesByAccount.get(acc.number) || []

    const totalPnL = trades.reduce((sum, t) => sum + Number(t.pnl), 0)
    const currentBalance = Number(acc.startingBalance) + totalPnL

    const ddInfo = computeDrawdownInfo(
      Number(acc.startingBalance),
      Number(acc.drawdownThreshold),
      Number(acc.buffer),
      currentBalance,
    )

    const uniqueTradeDays = new Set(
      trades.map((t) => t.entryDate.toISOString().slice(0, 10)),
    ).size

    const profitTarget = Number(acc.profitTarget)
    const profitTargetPct = profitTarget > 0 ? (totalPnL / profitTarget) * 100 : 0

    const trailingActive = acc.trailingDrawdown &&
      Number(acc.trailingStopProfit || 0) > 0 &&
      totalPnL >= Number(acc.trailingStopProfit)

    const minDays = acc.minTradingDaysForPayout || 0
    const payoutEligible = !acc.evaluation ||
      (profitTargetPct >= 100 && uniqueTradeDays >= minDays)

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
      profitTargetPct: profitTargetPct.toFixed(1),
      trailingActive,
      daysTraded: uniqueTradeDays,
      isEvaluation: acc.evaluation,
      payoutEligible,
    }
  })

  return results
}

export async function buildPerformanceContext(ctx: McpAuthContext, days?: number): Promise<PerformanceContext> {
  const where: Record<string, unknown> = { userId: ctx.userId }
  if (days && days > 0) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    where.entryDate = { gte: since }
  }

  const [totals, winCount, lossCount, winSum, lossSum] = await Promise.all([
    prisma.trade.aggregate({
      where: where as Parameters<typeof prisma.trade.aggregate>[0]['where'],
      _sum: { pnl: true, commission: true },
      _count: { id: true },
    }),
    prisma.trade.count({
      where: { ...where, pnl: { gt: 0 } } as any,
    }),
    prisma.trade.count({
      where: { ...where, pnl: { lt: 0 } } as any,
    }),
    prisma.trade.aggregate({
      where: { ...where, pnl: { gt: 0 } } as Parameters<typeof prisma.trade.aggregate>[0]['where'],
      _sum: { pnl: true },
    }),
    prisma.trade.aggregate({
      where: { ...where, pnl: { lt: 0 } } as Parameters<typeof prisma.trade.aggregate>[0]['where'],
      _sum: { pnl: true },
    }),
  ])

  const totalTrades = totals._count.id
  const grossPnL = Number(totals._sum.pnl ?? 0)
  const totalCommission = Number(totals._sum.commission ?? 0)
  const netPnL = grossPnL - totalCommission
  const totalWinAmount = Number(winSum._sum.pnl ?? 0)
  const totalLossAmount = Number(lossSum._sum.pnl ?? 0)

  return {
    totalTrades,
    grossPnL: grossPnL.toFixed(2),
    netPnL: netPnL.toFixed(2),
    winRate: totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : '0.0',
    totalWins: winCount,
    totalLosses: lossCount,
    avgWin: winCount > 0 ? (totalWinAmount / winCount).toFixed(2) : '0.00',
    avgLoss: lossCount > 0 ? (totalLossAmount / lossCount).toFixed(2) : '0.00',
    profitFactor: totalLossAmount !== 0
      ? (Math.abs(totalWinAmount / totalLossAmount)).toFixed(2)
      : 'N/A',
  }
}

export async function buildRiskContext(ctx: McpAuthContext): Promise<RiskContext> {
  const trades = await prisma.trade.findMany({
    where: { userId: ctx.userId },
    orderBy: { entryDate: 'asc' },
    take: 10_000,
    select: { pnl: true, entryPrice: true, closePrice: true, entryDate: true },
  })

  if (!trades.length) {
    return {
      totalTrades: 0,
      maxDrawdown: 0,
      maxDrawdownPct: '0.0',
      avgRiskPerTrade: '0.00%',
      avgRR: '0.00',
      bestRR: '0.00',
      worstRR: '0.00',
      expectancy: '0.00',
      profitFactor: '0.00',
      sharpeRatio: '0.00',
      violationCount: 0,
    }
  }

  const pnls = trades.map((t) => Number(t.pnl))
  const totalPnL = pnls.reduce((s, v) => s + v, 0)
  const wins = pnls.filter((p) => p > 0)
  const losses = pnls.filter((p) => p < 0)
  const winRate = trades.length > 0 ? wins.length / trades.length : 0

  let runningSum = 0
  let peak = 0
  let maxDD = 0
  for (const p of pnls) {
    runningSum += p
    if (runningSum > peak) peak = runningSum
    const dd = peak - runningSum
    if (dd > maxDD) maxDD = dd
  }

  const riskPcts = trades.map((t) => {
    const entry = Number(t.entryPrice)
    if (entry === 0) return 0
    return Math.abs(Number(t.closePrice) - entry) / entry * 100
  })
  const avgRiskPerTrade = riskPcts.length > 0
    ? (riskPcts.reduce((s, v) => s + v, 0) / riskPcts.length).toFixed(2)
    : '0.00'

  const rrs = trades.map((t) => {
    const entry = Number(t.entryPrice)
    if (entry === 0) return 0
    return (Number(t.closePrice) - entry) / entry
  })
  const validRRs = rrs.filter((r) => r !== 0)
  const avgRR = validRRs.length > 0
    ? (validRRs.reduce((s, v) => s + v, 0) / validRRs.length).toFixed(2)
    : '0.00'
  const bestRR = validRRs.length > 0 ? Math.max(...validRRs).toFixed(2) : '0.00'
  const worstRR = validRRs.length > 0 ? Math.min(...validRRs).toFixed(2) : '0.00'

  const avgWin = wins.length > 0 ? wins.reduce((s, v) => s + v, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, v) => s + v, 0) / losses.length) : 0
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss

  const totalWinAmount = wins.reduce((s, v) => s + v, 0)
  const totalLossAmount = Math.abs(losses.reduce((s, v) => s + v, 0))
  const profitFactor = totalLossAmount > 0 ? (totalWinAmount / totalLossAmount) : totalWinAmount > 0 ? Infinity : 0

  const meanPnL = totalPnL / trades.length
  const variance = pnls.reduce((s, v) => s + (v - meanPnL) ** 2, 0) / trades.length
  const stdPnL = Math.sqrt(variance)
  const sharpeRatio = stdPnL > 0 ? (meanPnL / stdPnL * Math.sqrt(trades.length)).toFixed(2) : '0.00'

  const violationCount = riskPcts.filter((r) => r > 2).length

  return {
    totalTrades: trades.length,
    maxDrawdown: Math.round(maxDD * 100) / 100,
    maxDrawdownPct: peak > 0 ? ((maxDD / peak) * 100).toFixed(1) : '0.0',
    avgRiskPerTrade: `${avgRiskPerTrade}%`,
    avgRR,
    bestRR: `${bestRR}:1`,
    worstRR: `${worstRR}:1`,
    expectancy: expectancy.toFixed(2),
    profitFactor: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2),
    sharpeRatio,
    violationCount,
  }
}
