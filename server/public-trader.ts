'use server'

import { prisma } from '@/lib/prisma'
import { startOfDay } from 'date-fns'
import { isPrismaSchemaMismatchError } from '@/lib/prisma-guard'

export type PublicTrade = {
  id: string
  instrument: string | null
  pnl: number
  closeDate: Date
}

export type PublicTraderMetrics = {
  netPnl: number
  avgReturn: number
  consistencyRate: number
  winRate: number
  totalTrades: number
  winningStreak: number
  drawdown: number
  riskReward: number
  avgWin: number
  avgLossAbs: number
}

export type PublicTraderSnapshot = {
  id: string
  username: string
  totalPnl: number
  totalTrades: number
  winRate: number
  avgPnl: number
  recentTrades: PublicTrade[]
  allTrades: PublicTrade[]
  dayPnl: Record<string, number>
  metrics: PublicTraderMetrics
}

function toUsername(email: string | null | undefined, username: string | null, fallbackId: string): string {
  if (username) return username
  const base = email?.split('@')[0]?.trim()
  return base || `Trader ${fallbackId.slice(0, 8)}`
}

function getWinningStreak(values: number[]) {
  let c = 0
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] > 0) c++
    else break
  }
  return c
}

function computePublicMetrics(allTrades: { pnl: number; closeDate: Date }[]): PublicTraderMetrics {
  const pnlValues = allTrades.map((t) => t.pnl)
  const wins = pnlValues.filter((v) => v > 0)
  const losses = pnlValues.filter((v) => v < 0)
  const total = allTrades.length
  const netPnl = pnlValues.reduce((a, b) => a + b, 0)
  const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
  const avgLossAbs = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0
  const decisive = wins.length + losses.length
  const winRate = decisive > 0 ? (wins.length / decisive) * 100 : 0
  const avgReturn = total > 0 ? netPnl / total : 0

  let running = 0
  let peak = 0
  let maxDD = 0
  for (const n of pnlValues) {
    running += n
    peak = Math.max(peak, running)
    maxDD = Math.max(maxDD, peak - running)
  }

  const dayMap = new Map<string, number>()
  allTrades.forEach((t) => {
    const k = startOfDay(t.closeDate).toISOString().slice(0, 10)
    dayMap.set(k, (dayMap.get(k) ?? 0) + t.pnl)
  })
  const dayValues = [...dayMap.values()]
  const consistencyRate = dayValues.length > 0 ? (dayValues.filter((v) => v > 0).length / dayValues.length) * 100 : 0

  return {
    netPnl,
    avgReturn,
    consistencyRate,
    winRate,
    totalTrades: total,
    winningStreak: getWinningStreak(pnlValues),
    drawdown: maxDD,
    riskReward: avgLossAbs > 0 ? avgWin / avgLossAbs : 0,
    avgWin,
    avgLossAbs,
  }
}

export async function getPublicTraderSnapshot(slug: string): Promise<PublicTraderSnapshot | null> {
  let user: { id: string; email: string | null; username: string | null; showOnLeaderboard: boolean } | null = null

  try {
    user = await prisma.user.findUnique({
      where: { id: slug },
      select: { id: true, email: true, username: true, showOnLeaderboard: true },
    })
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) return null
    throw error
  }

  if (!user?.showOnLeaderboard) return null

  const trades = await prisma.trade.findMany({
    where: { userId: user.id },
    select: { id: true, instrument: true, pnl: true, closeDate: true },
    orderBy: { closeDate: 'desc' },
    take: 3000,
  })

  const mapped: PublicTrade[] = trades.map((t) => ({
    id: t.id,
    instrument: t.instrument,
    pnl: Number(t.pnl ?? 0),
    closeDate: t.closeDate,
  }))

  const dayPnlMap = new Map<string, number>()
  for (const trade of mapped) {
    const key = startOfDay(trade.closeDate).toISOString().slice(0, 10)
    dayPnlMap.set(key, (dayPnlMap.get(key) ?? 0) + trade.pnl)
  }

  const dayPnl: Record<string, number> = {}
  dayPnlMap.forEach((value, key) => {
    dayPnl[key] = value
  })

  const totalPnl = mapped.reduce((sum, t) => sum + t.pnl, 0)
  const totalTrades = mapped.length
  const wins = mapped.filter((t) => t.pnl > 0).length
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
  const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0
  const metrics = computePublicMetrics(mapped.map((t) => ({ ...t, closeDate: t.closeDate })))

  return {
    id: user.id,
    username: toUsername(user.email, user.username, user.id),
    totalPnl,
    totalTrades,
    winRate,
    avgPnl,
    recentTrades: mapped.slice(0, 10),
    allTrades: mapped.slice(0, 50),
    dayPnl,
    metrics,
  }
}
