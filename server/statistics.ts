'use server'

import { prisma } from '@/lib/prisma'
import { getDatabaseUserId } from './auth'
import type { StatisticsResult, TickerStat, DailyStat, SetupStat } from '@/app/[locale]/dashboard/analytics/statistics/types'

function computeRR(trades: Array<{ pnl: number }>) {
  let grossWin = 0
  let grossLoss = 0
  let wins = 0
  let losses = 0

  for (const t of trades) {
    if (t.pnl > 0) { grossWin += t.pnl; wins++ }
    else if (t.pnl < 0) { grossLoss += Math.abs(t.pnl); losses++ }
  }

  const avgWin = wins > 0 ? grossWin / wins : 0
  const avgLoss = losses > 0 ? grossLoss / losses : 0
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0
  const totalRR = grossLoss > 0 ? grossWin / grossLoss : 0

  return { avgRR, totalRR, wins, losses, grossWin, grossLoss }
}

export async function getStatisticsAction(): Promise<StatisticsResult> {
  const userId = await getDatabaseUserId()

  const trades = await prisma.trade.findMany({
    where: { userId },
    include: { journal: true },
    orderBy: { entryDate: 'desc' },
  })

  // Ticker Stats
  const tickerMap = new Map<string, Array<{ pnl: number }>>()
  for (const t of trades) {
    const instr = t.instrument || 'Unknown'
    if (!tickerMap.has(instr)) tickerMap.set(instr, [])
    tickerMap.get(instr)!.push({ pnl: Number(t.pnl) })
  }

  const tickerStats: TickerStat[] = []
  for (const [ticker, tList] of tickerMap) {
    const { avgRR, totalRR, wins, losses, grossWin, grossLoss } = computeRR(tList)
    const resolved = wins + losses
    tickerStats.push({
      ticker,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      wins,
      losses,
      grossWin,
      grossLoss,
    })
  }
  tickerStats.sort((a, b) => b.totalTrades - a.totalTrades)

  // Daily Stats
  const dateMap = new Map<string, Array<{ pnl: number }>>()
  for (const t of trades) {
    const d = t.entryDate instanceof Date ? t.entryDate : new Date(t.entryDate)
    const key = d.toISOString().slice(0, 10)
    if (!dateMap.has(key)) dateMap.set(key, [])
    dateMap.get(key)!.push({ pnl: Number(t.pnl) })
  }

  const dailyStats: DailyStat[] = []
  for (const [date, tList] of dateMap) {
    const { avgRR, totalRR, wins, losses } = computeRR(tList)
    const resolved = wins + losses
    dailyStats.push({
      date,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
    })
  }
  dailyStats.sort((a, b) => b.date.localeCompare(a.date))

  // Setup Stats (from JournalEntry.customTags)
  const tagMap = new Map<string, Array<{ pnl: number }>>()
  for (const t of trades) {
    const journal = t.journal
    if (!journal || !journal.customTags || journal.customTags.length === 0) continue
    const pnlNum = Number(t.pnl)
    for (const tag of journal.customTags) {
      if (!tagMap.has(tag)) tagMap.set(tag, [])
      tagMap.get(tag)!.push({ pnl: pnlNum })
    }
  }

  const setupStats: SetupStat[] = []
  for (const [tag, tList] of tagMap) {
    const { avgRR, totalRR, wins, losses } = computeRR(tList)
    const resolved = wins + losses
    setupStats.push({
      tag,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
    })
  }
  setupStats.sort((a, b) => b.totalTrades - a.totalTrades)

  // Grand total
  const grandResult = computeRR(trades.map(t => ({ pnl: Number(t.pnl) })))
  const grandResolved = grandResult.wins + grandResult.losses

  // Daily PnL aggregation for best/worst day
  const dayPnlMap = new Map<string, number>()
  for (const t of trades) {
    const d = t.entryDate instanceof Date ? t.entryDate : new Date(t.entryDate)
    const key = d.toISOString().slice(0, 10)
    dayPnlMap.set(key, (dayPnlMap.get(key) || 0) + Number(t.pnl))
  }
  const dayPnls = Array.from(dayPnlMap.values())

  return {
    tickerStats,
    dailyStats,
    setupStats,
    allPnls: trades.map(t => ({ pnl: Number(t.pnl), entryDate: t.entryDate instanceof Date ? t.entryDate.toISOString() : String(t.entryDate) })),
    grandTotal: trades.length,
    grandWinRate: grandResolved > 0 ? (grandResult.wins / grandResolved) * 100 : 0,
    grandPnl: trades.reduce((s, t) => s + Number(t.pnl), 0),
    bestDay: dayPnls.length > 0 ? Math.max(...dayPnls) : 0,
    worstDay: dayPnls.length > 0 ? Math.min(...dayPnls) : 0,
    profitFactor: grandResult.totalRR,
    avgRR: grandResult.avgRR,
  }
}
