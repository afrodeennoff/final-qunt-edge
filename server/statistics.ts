'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@/prisma/generated/prisma'
import { getDatabaseUserId } from './auth'
import { getDataRetentionDays } from './usage-limits'
import type {
  StatisticsResult, TickerStat, DailyStat, SetupStat, WeekdayStat,
} from '@/app/[locale]/dashboard/statistics/types'

const KNOWN_TIMEFRAMES = new Set(['5m', '15m', '30m', '1H', '4H', 'Daily'])
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function extractDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d)
}

function formatISO(d: Date | string): string {
  const dt = extractDate(d)
  return dt.toISOString()
}

function computeRRFromAgg(grossWin: number, grossLoss: number, wins: number, losses: number) {
  const avgWin = wins > 0 ? grossWin / wins : 0
  const avgLoss = losses > 0 ? grossLoss / losses : 0
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0
  const totalRR = grossLoss > 0 ? grossWin / grossLoss : 0
  return { avgRR, totalRR, wins, losses, grossWin, grossLoss }
}

export async function getStatisticsAction(
  periodDays?: number,
  accountNumber?: string,
): Promise<StatisticsResult> {
  const userId = await getDatabaseUserId()

  const requestedPeriod = periodDays && periodDays > 0 ? periodDays : 365
  const retentionDays = await getDataRetentionDays(userId)
  const effectivePeriod = retentionDays !== null ? Math.min(requestedPeriod, retentionDays) : requestedPeriod
  const cutoff = new Date(Date.now() - effectivePeriod * 86400000)

  const baseWhere: Prisma.TradeWhereInput = { userId, entryDate: { gte: cutoff } }
  if (accountNumber) baseWhere.accountNumber = accountNumber

  // 1. Grand total aggregate (single DB query)
  const grandAgg = await prisma.trade.aggregate({
    where: baseWhere,
    _sum: { pnl: true },
    _count: true,
  })
  const grandTotal = grandAgg._count
  const grandPnl = Number(grandAgg._sum.pnl ?? 0)

  // 2. Ticker stats via groupBy (SQL GROUP BY)
  const tickerGroup = await prisma.trade.groupBy({
    by: ['instrument'],
    where: baseWhere,
    _sum: { pnl: true },
    _count: { id: true },
  })

  // 3. Per-ticker PnL breakdown via raw SQL for win/loss split
  const tickerRawRows = await prisma.$queryRaw<Array<{
    instrument: string; gross_win: string; gross_loss: string; win_count: bigint; loss_count: bigint
  }>>`
    SELECT
      instrument,
      SUM(CASE WHEN pnl > 0 THEN pnl ELSE 0 END) as gross_win,
      SUM(CASE WHEN pnl < 0 THEN ABS(pnl) ELSE 0 END) as gross_loss,
      COUNT(*) FILTER (WHERE pnl > 0) as win_count,
      COUNT(*) FILTER (WHERE pnl < 0) as loss_count
    FROM "Trade"
    WHERE user_id = ${userId}
      AND entry_date >= ${cutoff}
      ${accountNumber ? Prisma.sql`AND account_number = ${accountNumber}` : Prisma.empty}
    GROUP BY instrument
    ORDER BY COUNT(*) DESC
  `

  const tickerMap = new Map(tickerRawRows.map(r => [r.instrument, r]))
  const tickerStats: TickerStat[] = tickerGroup.map(g => {
    const raw = tickerMap.get(g.instrument)
    const wins = Number(raw?.win_count ?? 0)
    const losses = Number(raw?.loss_count ?? 0)
    const grossWin = Number(raw?.gross_win ?? 0)
    const grossLoss = Number(raw?.gross_loss ?? 0)
    const resolved = wins + losses
    const { avgRR, totalRR } = computeRRFromAgg(grossWin, grossLoss, wins, losses)
    return {
      ticker: g.instrument || 'Unknown',
      totalTrades: g._count.id,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl: Number(g._sum.pnl ?? 0),
      wins,
      losses,
      grossWin,
      grossLoss,
    }
  })

  // 4. Daily PnL aggregation via raw SQL GROUP BY
  const dailyRows = await prisma.$queryRaw<Array<{
    date: Date; gross_pnl: string; trade_count: bigint; gross_win: string; gross_loss: string; win_count: bigint; loss_count: bigint
  }>>`
    SELECT
      DATE(entry_date) as date,
      SUM(pnl) as gross_pnl,
      COUNT(*) as trade_count,
      SUM(CASE WHEN pnl > 0 THEN pnl ELSE 0 END) as gross_win,
      SUM(CASE WHEN pnl < 0 THEN ABS(pnl) ELSE 0 END) as gross_loss,
      COUNT(*) FILTER (WHERE pnl > 0) as win_count,
      COUNT(*) FILTER (WHERE pnl < 0) as loss_count
    FROM "Trade"
    WHERE user_id = ${userId}
      AND entry_date >= ${cutoff}
      ${accountNumber ? Prisma.sql`AND account_number = ${accountNumber}` : Prisma.empty}
    GROUP BY DATE(entry_date)
    ORDER BY date DESC
  `

  const dailyStats: DailyStat[] = dailyRows.map(r => {
    const wins = Number(r.win_count)
    const losses = Number(r.loss_count)
    const grossWin = Number(r.gross_win)
    const grossLoss = Number(r.gross_loss)
    const resolved = wins + losses
    const { avgRR, totalRR } = computeRRFromAgg(grossWin, grossLoss, wins, losses)
    return {
      date: formatISO(r.date),
      totalTrades: Number(r.trade_count),
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl: Number(r.gross_pnl),
    }
  })

  // 5. Weekday stats derived from daily aggregation
  const weekdayMap = new Map<number, { grossWin: number; grossLoss: number; wins: number; losses: number; count: number; pnl: number }>()
  for (const r of dailyRows) {
    const d = extractDate(r.date)
    const dayIdx = d.getDay()
    const entry = weekdayMap.get(dayIdx) || { grossWin: 0, grossLoss: 0, wins: 0, losses: 0, count: 0, pnl: 0 }
    entry.grossWin += Number(r.gross_win)
    entry.grossLoss += Number(r.gross_loss)
    entry.wins += Number(r.win_count)
    entry.losses += Number(r.loss_count)
    entry.count += Number(r.trade_count)
    entry.pnl += Number(r.gross_pnl)
    weekdayMap.set(dayIdx, entry)
  }

  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0]
  const weekdayStats: WeekdayStat[] = []
  for (const idx of weekdayOrder) {
    const entry = weekdayMap.get(idx)
    if (!entry || entry.count === 0) continue
    const resolved = entry.wins + entry.losses
    const { avgRR, totalRR } = computeRRFromAgg(entry.grossWin, entry.grossLoss, entry.wins, entry.losses)
    weekdayStats.push({
      day: WEEKDAY_NAMES[idx],
      totalTrades: entry.count,
      winRate: resolved > 0 ? (entry.wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl: entry.pnl,
      wins: entry.wins,
      losses: entry.losses,
    })
  }

  // 6. Journal-linked stats (setups / timeframes)
  const tradesWithJournal = await prisma.trade.findMany({
    where: baseWhere,
    select: {
      pnl: true,
      entryDate: true,
      instrument: true,
      side: true,
      id: true,
      journal: {
        select: { id: true, customTags: true, excerptTitle: true, featuredExcerpt: true },
      },
    },
    orderBy: { entryDate: 'desc' },
    take: 10_000,
  })

  const tagMap = new Map<string, { grossWin: number; grossLoss: number; wins: number; losses: number; count: number; pnl: number }>()
  const timeframeMap = new Map<string, { grossWin: number; grossLoss: number; wins: number; losses: number; count: number; pnl: number }>()
  for (const t of tradesWithJournal) {
    const journal = t.journal
    if (!journal || !journal.customTags || journal.customTags.length === 0) continue
    const pnlNum = Number(t.pnl)
    for (const tag of journal.customTags) {
      const map = KNOWN_TIMEFRAMES.has(tag) ? timeframeMap : tagMap
      let entry = map.get(tag)
      if (!entry) {
        entry = { grossWin: 0, grossLoss: 0, wins: 0, losses: 0, count: 0, pnl: 0 }
        map.set(tag, entry)
      }
      entry.count++
      entry.pnl += pnlNum
      if (pnlNum > 0) { entry.wins++; entry.grossWin += pnlNum }
      else if (pnlNum < 0) { entry.losses++; entry.grossLoss += Math.abs(pnlNum) }
    }
  }

  const setupStats: SetupStat[] = []
  for (const [tag, entry] of tagMap) {
    if (entry.count === 0) continue
    const resolved = entry.wins + entry.losses
    const { avgRR, totalRR } = computeRRFromAgg(entry.grossWin, entry.grossLoss, entry.wins, entry.losses)
    setupStats.push({
      tag,
      totalTrades: entry.count,
      winRate: resolved > 0 ? (entry.wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl: entry.pnl,
    })
  }
  setupStats.sort((a, b) => b.totalTrades - a.totalTrades)

  const timeframeStats: SetupStat[] = []
  for (const [tf, entry] of timeframeMap) {
    if (entry.count === 0) continue
    const resolved = entry.wins + entry.losses
    const { avgRR, totalRR } = computeRRFromAgg(entry.grossWin, entry.grossLoss, entry.wins, entry.losses)
    timeframeStats.push({
      tag: tf,
      totalTrades: entry.count,
      winRate: resolved > 0 ? (entry.wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      pnl: entry.pnl,
    })
  }
  timeframeStats.sort((a, b) => b.totalTrades - a.totalTrades)

  // 7. Featured excerpts
  const featuredExcerpts = tradesWithJournal
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

  // 8. Grand total stats
  const grandTotalGrossWin = dailyRows.reduce((s, r) => s + Number(r.gross_win), 0)
  const grandTotalGrossLoss = dailyRows.reduce((s, r) => s + Number(r.gross_loss), 0)
  const grandTotalWins = dailyRows.reduce((s, r) => s + Number(r.win_count), 0)
  const grandTotalLosses = dailyRows.reduce((s, r) => s + Number(r.loss_count), 0)
  const grandResolved = grandTotalWins + grandTotalLosses
  const { avgRR: grandAvgRR, totalRR: grandTotalRR } = computeRRFromAgg(
    grandTotalGrossWin, grandTotalGrossLoss, grandTotalWins, grandTotalLosses
  )

  // 9. Best/worst day
  const dayPnls = dailyRows.map(r => Number(r.gross_pnl))

  // 10. Consecutive win/loss streaks
  const sortedForStreak = [...tradesWithJournal]
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
  let maxConsecWins = 0
  let maxConsecLosses = 0
  let curWins = 0
  let curLosses = 0
  for (const t of sortedForStreak) {
    const pnl = Number(t.pnl)
    if (pnl > 0) { curWins++; curLosses = 0; if (curWins > maxConsecWins) maxConsecWins = curWins }
    else if (pnl < 0) { curLosses++; curWins = 0; if (curLosses > maxConsecLosses) maxConsecLosses = curLosses }
  }

  // 11. All PnLs for chart (limit to reduce payload)
  const allPnls = tradesWithJournal.map(t => ({
    pnl: Number(t.pnl),
    entryDate: formatISO(t.entryDate),
  }))

  const grossProfit = grandTotalGrossWin
  const grossLoss = grandTotalGrossLoss
  const winningTrades = grandTotalWins
  const losingTrades = grandTotalLosses
  const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0
  const avgLoss = losingTrades > 0 ? grossLoss / losingTrades : 0
  const totalRMultiple = avgLoss > 0 ? grandPnl / avgLoss : 0
  const expectancy = grandTotal > 0 ? grandPnl / grandTotal : 0

  return {
    tickerStats,
    dailyStats,
    setupStats,
    weekdayStats,
    timeframeStats,
    allPnls,
    grandTotal,
    grandWinRate: grandResolved > 0 ? (grandTotalWins / grandResolved) * 100 : 0,
    grandPnl,
    bestDay: dayPnls.length > 0 ? Math.max(...dayPnls) : 0,
    worstDay: dayPnls.length > 0 ? Math.min(...dayPnls) : 0,
    profitFactor: grandTotalRR,
    avgRR: grandAvgRR,
    grossProfit,
    grossLoss,
    avgWin,
    avgLoss,
    maxConsecWins,
    maxConsecLosses,
    totalRMultiple,
    winningTrades,
    losingTrades,
    expectancy,
    featuredExcerpts,
  }
}
