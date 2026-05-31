'use client'

import { useEffect, useState } from 'react'
import { getStatisticsAction } from '@/server/statistics'
import { StatsTable, type StatsTableRow } from './stats-table'
import type { StatisticsResult } from '../types'
import { unifiedInsetPanelClassName } from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

export function StatisticsClient() {
  const [data, setData] = useState<StatisticsResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStatisticsAction().then(result => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className={cn(unifiedInsetPanelClassName, 'rounded-xl p-4')}>
            <div className="h-4 w-32 bg-muted/30 rounded mb-4" />
            <div className="h-48 bg-muted/20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Failed to load statistics.</p>
  }

  const tickerRows: StatsTableRow[] = data.tickerStats.map(s => ({
    name: s.ticker,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
  }))

  const dailyRows: StatsTableRow[] = data.dailyStats.map(s => ({
    name: s.date,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
  }))

  const setupRows: StatsTableRow[] = data.setupStats.map(s => ({
    name: s.tag,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
  }))

  return (
    <div className="space-y-8">
      {/* Grand total summary */}
      <div className={cn(unifiedInsetPanelClassName, 'rounded-xl px-4 py-3 flex items-center gap-6 flex-wrap')}>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total Trades</span>
          <p className="text-xl font-bold tabular-nums">{data.grandTotal}</p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Overall Winrate</span>
          <p className={cn("text-xl font-bold tabular-nums", data.grandWinRate >= 50 ? 'metric-positive' : 'metric-negative')}>
            {data.grandWinRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className={cn(unifiedInsetPanelClassName, 'rounded-xl p-4 space-y-6')}>
        <StatsTable title="Ticker Stats" rows={tickerRows} emptyMessage="No trades found" />
      </div>

      <div className={cn(unifiedInsetPanelClassName, 'rounded-xl p-4 space-y-6')}>
        <StatsTable title="Daily Stats" rows={dailyRows} emptyMessage="No trades found" />
      </div>

      <div className={cn(unifiedInsetPanelClassName, 'rounded-xl p-4 space-y-6')}>
        <StatsTable
          title="Setup Stats (by Journal Tag)"
          rows={setupRows}
          emptyMessage="Tag your trades in the journal to see setup stats"
        />
      </div>
    </div>
  )
}
