'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@/prisma/generated/prisma'
import { getDatabaseUserId } from './auth'
import type {
  StatisticsResult, TickerStat, DailyStat, SetupStat, WeekdayStat,
} from '@/app/[locale]/dashboard/analytics/statistics/types'

const KNOWN_TIMEFRAMES = new Set(['5m', '15m', '30m', '1H', '4H', 'Daily'])

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

function extractDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d)
}

function formatISO(d: Date | string): string {
  const dt = extractDate(d)
  return dt.toISOString()
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function getStatisticsAction(
  periodDays?: number,
  accountNumber?: string,
): Promise<StatisticsResult> {
  const userId = await getDatabaseUserId()

  const where: Prisma.TradeWhereInput = { userId }
  const effectivePeriod = periodDays && periodDays > 0 ? periodDays : 365
  const cutoff = new Date(Date.now() - effectivePeriod * 86400000)
  where.entryDate = { gte: cutoff }
  if (accountNumber) where.accountNumber = accountNumber

  const trades = await prisma.trade.findMany({
    where,
    include: { journal: { select: { id: true, customTags: true, excerptTitle: true, featuredExcerpt: true } } },
    orderBy: { entryDate: 'desc' },
  })

  // ── Ticker Stats ──
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
    const pnl = tList.reduce((s, t) => s + t.pnl, 0)
    tickerStats.push({
      ticker,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl,
      wins,
      losses,
      grossWin,
      grossLoss,
    })
  }
  tickerStats.sort((a, b) => b.totalTrades - a.totalTrades)

  // ── Daily Stats ──
  const dateMap = new Map<string, Array<{ pnl: number }>>()
  for (const t of trades) {
    const d = extractDate(t.entryDate)
    const key = d.toISOString().slice(0, 10)
    if (!dateMap.has(key)) dateMap.set(key, [])
    dateMap.get(key)!.push({ pnl: Number(t.pnl) })
  }

  const dailyStats: DailyStat[] = []
  for (const [date, tList] of dateMap) {
    const { avgRR, totalRR, wins, losses } = computeRR(tList)
    const resolved = wins + losses
    const pnl = tList.reduce((s, t) => s + t.pnl, 0)
    dailyStats.push({
      date,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl,
    })
  }
  dailyStats.sort((a, b) => b.date.localeCompare(a.date))

  // ── Setup Stats (concept / tag performance, excludes known timeframe tags) ──
  const tagMap = new Map<string, Array<{ pnl: number }>>()
  const timeframeMap = new Map<string, Array<{ pnl: number }>>()
  for (const t of trades) {
    const journal = t.journal
    if (!journal || !journal.customTags || journal.customTags.length === 0) continue
    const pnlNum = Number(t.pnl)
    for (const tag of journal.customTags) {
      if (KNOWN_TIMEFRAMES.has(tag)) {
        if (!timeframeMap.has(tag)) timeframeMap.set(tag, [])
        timeframeMap.get(tag)!.push({ pnl: pnlNum })
      } else {
        if (!tagMap.has(tag)) tagMap.set(tag, [])
        tagMap.get(tag)!.push({ pnl: pnlNum })
      }
    }
  }

  const setupStats: SetupStat[] = []
  for (const [tag, tList] of tagMap) {
    const { avgRR, totalRR, wins, losses } = computeRR(tList)
    const resolved = wins + losses
    const pnl = tList.reduce((s, t) => s + t.pnl, 0)
    setupStats.push({
      tag,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl,
    })
  }
  setupStats.sort((a, b) => b.totalTrades - a.totalTrades)

  // ── Timeframe Stats ──
  const timeframeStats: SetupStat[] = []
  for (const [tf, tList] of timeframeMap) {
    const { avgRR, totalRR, wins, losses } = computeRR(tList)
    const resolved = wins + losses
    const pnl = tList.reduce((s, t) => s + t.pnl, 0)
    timeframeStats.push({
      tag: tf,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl,
    })
  }
  timeframeStats.sort((a, b) => b.totalTrades - a.totalTrades)

  // ── Weekday Stats ──
  const weekdayMap = new Map<number, Array<{ pnl: number }>>()
  for (const t of trades) {
    const d = extractDate(t.entryDate)
    const dayIdx = d.getDay()
    if (!weekdayMap.has(dayIdx)) weekdayMap.set(dayIdx, [])
    weekdayMap.get(dayIdx)!.push({ pnl: Number(t.pnl) })
  }

  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0]
  const weekdayStats: WeekdayStat[] = []
  for (const idx of weekdayOrder) {
    const tList = weekdayMap.get(idx)
    if (!tList || tList.length === 0) continue
    const { avgRR, totalRR, wins, losses } = computeRR(tList)
    const resolved = wins + losses
    const pnl = tList.reduce((s, t) => s + t.pnl, 0)
    weekdayStats.push({
      day: WEEKDAY_NAMES[idx],
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl,
      wins,
      losses,
    })
  }

  // ── Grand total ──
  const grandResult = computeRR(trades.map(t => ({ pnl: Number(t.pnl) })))
  const grandResolved = grandResult.wins + grandResult.losses

  // ── Daily PnL aggregation for best/worst day ──
  const dayPnlMap = new Map<string, number>()
  for (const t of trades) {
    const d = extractDate(t.entryDate)
    const key = d.toISOString().slice(0, 10)
    dayPnlMap.set(key, (dayPnlMap.get(key) || 0) + Number(t.pnl))
  }
  const dayPnls = Array.from(dayPnlMap.values())

  // ── Featured Excerpts ──
  const featuredExcerpts = trades
    .filter(t => t.journal && (t.journal.excerptTitle || t.journal.featuredExcerpt))
    .map(t => ({
      id: t.journal!.id,
      tradeId: t.id,
      instrument: t.instrument || 'Unknown',
      side: t.side || '',
      pnl: Number(t.pnl),
      entryDate: formatISO(t.entryDate),
      excerptTitle: t.journal!.excerptTitle,
      featuredExcerpt: t.journal!.featuredExcerpt,
    }))
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate))

  return {
    tickerStats,
    dailyStats,
    setupStats,
    weekdayStats,
    timeframeStats,
    allPnls: trades.map(t => ({
      pnl: Number(t.pnl),
      entryDate: formatISO(t.entryDate),
    })),
    grandTotal: trades.length,
    grandWinRate: grandResolved > 0 ? (grandResult.wins / grandResolved) * 100 : 0,
    grandPnl: trades.reduce((s, t) => s + Number(t.pnl), 0),
    bestDay: dayPnls.length > 0 ? Math.max(...dayPnls) : 0,
    worstDay: dayPnls.length > 0 ? Math.min(...dayPnls) : 0,
    profitFactor: grandResult.totalRR,
    avgRR: grandResult.avgRR,
    featuredExcerpts,
  }
}
