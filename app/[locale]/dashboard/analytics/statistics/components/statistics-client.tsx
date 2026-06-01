'use client'

import { useEffect, useState, useMemo } from 'react'
import { getStatisticsAction } from '@/server/statistics'
import { StatsTable, type StatsTableRow } from './stats-table'
import type { StatisticsResult, SetupStat, WeekdayStat, TickerStat } from '../types'
import { cn } from '@/lib/utils'


type TimePeriod = '7d' | '14d' | '30d' | '90d' | 'all'

const PERIOD_DAYS: Record<TimePeriod, number | undefined> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  '90d': 90,
  'all': undefined,
}

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

  let peak = 0
  let maxDd = 0
  let cumulative = 0
  for (const pnl of pnls) {
    cumulative += pnl
    if (cumulative > peak) peak = cumulative
    const dd = peak - cumulative
    if (dd > maxDd) maxDd = dd
  }

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

function statToRow(s: TickerStat | SetupStat | WeekdayStat): StatsTableRow {
  return {
    name: 'ticker' in s ? s.ticker : 'day' in s ? s.day : s.tag,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
  }
}

export default function StatisticsClient() {
  const [data, setData] = useState<StatisticsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<TimePeriod>('all')

  useEffect(() => {
    setLoading(true)
    getStatisticsAction(PERIOD_DAYS[period]).then(result => {
      setData(result)
      setLoading(false)
    })
  }, [period])

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

  if (!data) {
    return <p className="text-sm text-muted-foreground p-4">Failed to load statistics.</p>
  }

  const tickerRows: StatsTableRow[] = data.tickerStats.map(statToRow)
  const weekdayRows: StatsTableRow[] = data.weekdayStats.map(statToRow)
  const setupRows: StatsTableRow[] = data.setupStats.map(statToRow)
  const timeframeRows: StatsTableRow[] = data.timeframeStats.map(statToRow)

  const pnlValues = data.allPnls.map(p => p.pnl)
  const risk = computeRiskMetrics(pnlValues, data.profitFactor)

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Header + Time Filters */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-primary">Statistics</div>
        <div className="flex gap-1 p-1 rounded-xl bg-card">
          {(['7d', '14d', '30d', '90d', 'all'] as TimePeriod[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                period === p
                  ? 'bg-primary text-primary-foreground font-semibold'
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
          <div className={cn('text-xl font-bold tabular-nums mt-1', data.grandPnl >= 0 ? 'text-semantic-success' : 'text-semantic-error')}>
            {formatPnl(data.grandPnl)}
          </div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Win Rate</div>
          <div className="text-xl font-bold tabular-nums mt-1">{data.grandWinRate.toFixed(1)}%</div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Avg R</div>
          <div className={cn('text-xl font-bold tabular-nums mt-1', data.avgRR >= 1 ? 'text-semantic-success' : 'text-semantic-error')}>
            {data.avgRR >= 1 ? '+' : ''}{data.avgRR.toFixed(2)}R
          </div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Profit Factor</div>
          <div className="text-xl font-bold tabular-nums mt-1">{data.profitFactor.toFixed(2)}</div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Total Trades</div>
          <div className="text-xl font-bold tabular-nums mt-1">{data.grandTotal}</div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Best Day</div>
          <div className="text-xl font-bold tabular-nums mt-1 text-semantic-success">{formatPnl(data.bestDay)}</div>
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
          emptyMessage="Tag your trades with timeframe tags (5m, 15m, 1H, etc.)"
        />
      </div>

      {/* Risk & Performance Metrics */}
      {risk && (
        <div className="rounded-2xl bg-card/30 border border-foreground/[0.06] p-6">
          <div className={cn('text-[11px] font-semibold tracking-[0.16em] uppercase text-primary', 'mb-4')}>Risk & Performance Metrics</div>
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
