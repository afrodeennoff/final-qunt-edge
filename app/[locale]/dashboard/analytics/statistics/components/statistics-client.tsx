'use client'

import { useEffect, useState, useMemo } from 'react'
import { getStatisticsAction } from '@/server/statistics'
import { StatsTable, type StatsTableRow } from './stats-table'
import type { StatisticsResult } from '../types'
import { cn } from '@/lib/utils'
import { unifiedSectionEyebrowClassName } from '@/components/layout/unified-page-recipes'

type TimePeriod = '7d' | '14d' | '30d' | '90d' | 'all'

function formatPnl(pnl: number) {
  const sign = pnl >= 0 ? '+' : ''
  return `${sign}$${Math.abs(pnl).toFixed(2)}`
}

function computeRiskMetrics(pnls: number[], profitFactor: number) {
  if (pnls.length === 0) return null
  const mean = pnls.reduce((s, v) => s + v, 0) / pnls.length
  const stdDev = Math.sqrt(pnls.reduce((s, v) => s + (v - mean) ** 2, 0) / pnls.length)
  const downside = pnls.filter(v => v < 0)
  const downsideDev = downside.length > 0
    ? Math.sqrt(downside.reduce((s, v) => s + (v - mean) ** 2, 0) / downside.length)
    : 0
  const sharpe = stdDev > 0 ? (mean / stdDev) * Math.sqrt(252) : 0
  const sortino = downsideDev > 0 ? (mean / downsideDev) * Math.sqrt(252) : 0

  // Max drawdown from cumulative PnL
  let peak = 0
  let maxDd = 0
  let cumulative = 0
  for (const pnl of pnls) {
    cumulative += pnl
    if (cumulative > peak) peak = cumulative
    const dd = peak - cumulative
    if (dd > maxDd) maxDd = dd
  }

  // Win/Loss ratio
  const wins = pnls.filter(v => v > 0)
  const losses = pnls.filter(v => v < 0)
  const avgWin = wins.length > 0 ? wins.reduce((s, v) => s + v, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, v) => s + v, 0) / losses.length) : 0

  return {
    sharpe: sharpe.toFixed(2),
    sortino: sortino.toFixed(2),
    expectancy: mean.toFixed(2),
    maxDrawdown: maxDd.toFixed(2),
    profitFactor: profitFactor > 0 ? profitFactor.toFixed(2) : '--',
    winLossRatio: avgLoss > 0 ? (avgWin / avgLoss).toFixed(1) : '--',
  }
}

function groupByWeekday(dailyStats: StatisticsResult['dailyStats']): StatsTableRow[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const map = new Map<string, { trades: number; wins: number; rr: number[] }>()
  for (const d of dailyStats) {
    const dayIdx = new Date(d.date + 'T12:00:00').getDay()
    const dayName = days[dayIdx]
    if (!map.has(dayName)) map.set(dayName, { trades: 0, wins: 0, rr: [] })
    const entry = map.get(dayName)!
    entry.trades += d.totalTrades
    if (d.winRate >= 50) entry.wins += Math.round(d.totalTrades * d.winRate / 100)
    entry.rr.push(d.avgRR)
  }
  // Sort by weekday order (Mon-Fri)
  const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return Array.from(map.entries())
    .filter(([, v]) => v.trades > 0)
    .map(([day, v]) => ({
      name: day,
      totalTrades: v.trades,
      winRate: v.trades > 0 ? (v.wins / v.trades) * 100 : 0,
      avgRR: v.rr.length > 0 ? v.rr.reduce((s, r) => s + r, 0) / v.rr.length : 0,
      totalRR: v.rr.reduce((s, r) => s + r, 0),
    }))
    .sort((a, b) => weekdayOrder.indexOf(a.name) - weekdayOrder.indexOf(b.name))
}

function groupByTimeframe(dailyStats: StatisticsResult['dailyStats']): StatsTableRow[] {
  // Since we don't have a timeframe field, group daily stats by week-of-year
  // to provide a meaningful "timeframe" breakdown
  const map = new Map<string, { trades: number; wins: number; rr: number[] }>()
  for (const d of dailyStats) {
    const date = new Date(d.date + 'T12:00:00')
    // Use a simple "Week N" label based on ISO week
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
    const label = `Week ${weekNum}`
    if (!map.has(label)) map.set(label, { trades: 0, wins: 0, rr: [] })
    const entry = map.get(label)!
    entry.trades += d.totalTrades
    if (d.winRate >= 50) entry.wins += Math.round(d.totalTrades * d.winRate / 100)
    entry.rr.push(d.avgRR)
  }
  return Array.from(map.entries())
    .filter(([, v]) => v.trades > 0)
    .map(([week, v]) => ({
      name: week,
      totalTrades: v.trades,
      winRate: v.trades > 0 ? (v.wins / v.trades) * 100 : 0,
      avgRR: v.rr.length > 0 ? v.rr.reduce((s, r) => s + r, 0) / v.rr.length : 0,
      totalRR: v.rr.reduce((s, r) => s + r, 0),
    }))
    .slice(0, 10) // Show top 10 weeks
}

export default function StatisticsClient() {
  const [data, setData] = useState<StatisticsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<TimePeriod>('all')

  useEffect(() => {
    getStatisticsAction().then(result => {
      setData(result)
      setLoading(false)
    })
  }, [])

  // Client-side time filtering
  const filteredData = useMemo(() => {
    if (!data) return null
    if (period === 'all') return data

    const now = new Date()
    const daysMap: Record<TimePeriod, number> = { '7d': 7, '14d': 14, '30d': 30, '90d': 90, 'all': 0 }
    const cutoff = new Date(now.getTime() - daysMap[period] * 86400000).toISOString().slice(0, 10)

    const filteredPnls = data.allPnls.filter(p => p.entryDate.slice(0, 10) >= cutoff)
    const pnlValues = filteredPnls.map(p => p.pnl)

    const dailyFiltered = data.dailyStats.filter(d => d.date >= cutoff)

    return {
      ...data,
      dailyStats: dailyFiltered,
      allPnls: filteredPnls,
      grandTotal: filteredPnls.length,
      grandPnl: pnlValues.reduce((s, v) => s + v, 0),
    } as StatisticsResult
  }, [data, period])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card/20 p-4 h-20" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card/20 p-4 h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (!filteredData) {
    return <p className="text-sm text-muted-foreground p-4">Failed to load statistics.</p>
  }

  const tickerRows: StatsTableRow[] = filteredData.tickerStats.map(s => ({
    name: s.ticker,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
  }))

  const weekdayRows = groupByWeekday(filteredData.dailyStats)

  const setupRows: StatsTableRow[] = filteredData.setupStats.map(s => ({
    name: s.tag,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
  }))

  const timeframeRows = groupByTimeframe(filteredData.dailyStats)

  const pnlValues = filteredData.allPnls.map(p => p.pnl)
  const risk = computeRiskMetrics(pnlValues, filteredData.profitFactor)

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Header + Time Filters */}
      <div className="flex items-center justify-between">
        <div className={unifiedSectionEyebrowClassName}>Statistics</div>
        <div className="flex gap-1 p-1 rounded-xl bg-card/50">
          {(['7d', '14d', '30d', '90d', 'all'] as TimePeriod[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                period === p
                  ? 'bg-semantic-success/15 text-semantic-success'
                  : 'text-muted-foreground/50 hover:text-foreground',
              )}
            >
              {p === 'all' ? 'All Time' : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Total PnL</div>
          <div className={cn('text-xl font-bold tabular-nums mt-1', filteredData.grandPnl >= 0 ? 'text-semantic-success' : 'text-semantic-error')}>
            {formatPnl(filteredData.grandPnl)}
          </div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Win Rate</div>
          <div className="text-xl font-bold tabular-nums mt-1">{filteredData.grandWinRate.toFixed(1)}%</div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Avg R</div>
          <div className={cn('text-xl font-bold tabular-nums mt-1', filteredData.avgRR >= 1 ? 'text-semantic-success' : 'text-semantic-error')}>
            {filteredData.avgRR >= 1 ? '+' : ''}{filteredData.avgRR.toFixed(2)}R
          </div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Profit Factor</div>
          <div className="text-xl font-bold tabular-nums mt-1">{filteredData.profitFactor.toFixed(2)}</div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Total Trades</div>
          <div className="text-xl font-bold tabular-nums mt-1">{filteredData.grandTotal}</div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Best Day</div>
          <div className="text-xl font-bold tabular-nums mt-1 text-semantic-success">{formatPnl(filteredData.bestDay)}</div>
        </div>
      </div>

      {/* 2x2 Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsTable
          title="Symbol Performance"
          rows={tickerRows}
          emptyMessage="No trades found"
        />
        <StatsTable
          title="Weekday Performance"
          rows={weekdayRows}
          emptyMessage="No trades found"
        />
        <StatsTable
          title="Concept / Tag Performance"
          rows={setupRows}
          emptyMessage="Tag your trades in the journal to see setup stats"
        />
        <StatsTable
          title="Timeframe Performance"
          rows={timeframeRows}
          emptyMessage="No trades found"
        />
      </div>

      {/* Risk & Performance Metrics */}
      {risk && (
        <div className="rounded-2xl bg-card/30 border border-foreground/[0.06] p-6">
          <div className={cn(unifiedSectionEyebrowClassName, 'mb-4')}>Risk & Performance Metrics</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="rounded-xl p-4 bg-background/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Sharpe Ratio</div>
              <div className="text-xl font-bold tabular-nums mt-2">{risk.sharpe}</div>
            </div>
            <div className="rounded-xl p-4 bg-background/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Sortino Ratio</div>
              <div className="text-xl font-bold tabular-nums mt-2">{risk.sortino}</div>
            </div>
            <div className="rounded-xl p-4 bg-background/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Expectancy</div>
              <div className="text-xl font-bold tabular-nums mt-2">${risk.expectancy}</div>
            </div>
            <div className="rounded-xl p-4 bg-background/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Max Drawdown</div>
              <div className="text-xl font-bold tabular-nums mt-2 text-semantic-error">-${risk.maxDrawdown}</div>
            </div>
            <div className="rounded-xl p-4 bg-background/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Profit Factor</div>
              <div className="text-xl font-bold tabular-nums mt-2">{risk.profitFactor}</div>
            </div>
            <div className="rounded-xl p-4 bg-background/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Win / Loss Ratio</div>
              <div className="text-xl font-bold tabular-nums mt-2">{risk.winLossRatio}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
