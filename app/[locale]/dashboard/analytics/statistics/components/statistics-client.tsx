'use client'

import { useRef, useState, useMemo } from 'react'
import { computeStatistics, type ComputableTrade } from '@/lib/compute-statistics'
import { StatsTable, type StatsTableRow } from './stats-table'
import type { StatisticsResult, SetupStat, WeekdayStat, TickerStat } from '../types'
import { useUserStore } from '@/store/user-store'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useDashboardStats } from '@/context/data-provider'


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
  const pnl = 'pnl' in s ? s.pnl : 0
  return {
    name: 'ticker' in s ? s.ticker : 'day' in s ? s.day : s.tag,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
    pnl,
  }
}

export default function StatisticsClient() {
  const accounts = useUserStore(s => s.accounts)
  const { formattedTrades } = useDashboardStats()

  const [period, setPeriod] = useState<TimePeriod>('all')
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountDropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountDropRef.current && !accountDropRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const data = useMemo(() => {
    try {
      let trades = Array.isArray(formattedTrades) ? formattedTrades : []

      if (period !== 'all') {
        const cutoff = new Date(Date.now() - (PERIOD_DAYS[period] || 0) * 86400000)
        trades = trades.filter(t => {
          const d = t?.entryDate ? new Date(t.entryDate) : null
          return d && !isNaN(d.getTime()) && d >= cutoff
        })
      }
      if (selectedAccount) {
        trades = trades.filter(t => t?.accountNumber === selectedAccount)
      }

      const computable: ComputableTrade[] = trades
        .filter(t => t && t.id && t.entryDate != null)
        .map(t => ({
          id: t.id,
          instrument: t.instrument || 'Unknown',
          side: t.side || null,
          pnl: Number(t.pnl) || 0,
          entryDate: t.entryDate,
          journal: (t as any).journal ?? null,
        }))

      return computeStatistics(computable)
    } catch (e) {
      console.error('Statistics computation failed:', e)
      return { grandTotal: 0, tickerStats: [], weekdayStats: [], setupStats: [], timeframeStats: [], dailyStats: [], allPnls: [], grandPnl: 0, grandWinRate: 0, avgRR: 0, profitFactor: 0, bestDay: 0 }
    }
  }, [formattedTrades, period, selectedAccount])

  // Use provider's loading state if available, otherwise derive from empty trades
  const isLoading = !Array.isArray(formattedTrades) || (formattedTrades.length === 0 && period === 'all' && !selectedAccount)  // rough heuristic

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5 bg-[#0a0c0a] min-h-screen">
        <div className="h-5 w-24 bg-white/10 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#111311] border border-white/5 p-4 h-20 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#111311] border border-white/5 p-4 h-64 animate-pulse" />
          ))}
        </div>
        <div className="rounded-2xl bg-[#111311] border border-white/5 p-5 h-32 animate-pulse" />
      </div>
    )
  }

  if (!data || (data.grandTotal ?? 0) === 0) {
    return <div className="p-6 text-white/40 text-sm">No trades found for the selected period/account.</div>
  }

  const tickerRows: StatsTableRow[] = data.tickerStats.map(statToRow)
  const weekdayRows: StatsTableRow[] = data.weekdayStats.map(statToRow)
  const setupRows: StatsTableRow[] = data.setupStats.map(statToRow)
  const timeframeRows: StatsTableRow[] = data.timeframeStats.map(statToRow)

  const pnlValues = data.allPnls.map(p => p.pnl)
  const risk = computeRiskMetrics(pnlValues, data.profitFactor)

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5 bg-[#0a0c0a] min-h-screen text-white">

      {/* Header + Time Filters — exact match */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-semibold tracking-[2px] uppercase text-[#00ff9f]">STATISTICS</div>
          {accounts.length > 1 && (
            <div ref={accountDropRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111311] px-2.5 py-1 text-[11px] text-white/60 hover:text-white hover:border-white/20 transition-colors"
              >
                <span>{selectedAccount ? 'Acct ' + selectedAccount : 'All Accounts'}</span>
                <ChevronDown size={12} className={cn('transition-transform', accountOpen && 'rotate-180')} />
              </button>
              {accountOpen && (
                <div className="absolute top-full mt-1 left-0 z-20 min-w-[180px] rounded-xl border border-white/10 bg-[#111311] py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => { setSelectedAccount(null); setAccountOpen(false) }}
                    className={cn('w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5 transition-colors', !selectedAccount ? 'text-[#00ff9f]' : 'text-white/60')}
                  >
                    All Accounts
                  </button>
                  {accounts.map(a => (
                    <button
                      key={a.number}
                      type="button"
                      onClick={() => { setSelectedAccount(a.number === selectedAccount ? null : a.number); setAccountOpen(false) }}
                      className={cn('w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5 transition-colors', a.number === selectedAccount ? 'text-[#00ff9f]' : 'text-white/60')}
                    >
                      {a.number}{a.propfirm ? ' \u2013 ' + a.propfirm : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1 p-1 rounded-2xl bg-[#111311] border border-white/5">
          {([
            { key: '7d' as const, label: '7D' },
            { key: '14d' as const, label: '14D' },
            { key: '30d' as const, label: '30D' },
            { key: '90d' as const, label: '90D' },
            { key: 'all' as const, label: 'All Time' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={cn(
                'px-5 py-1 rounded-xl text-xs font-semibold transition-all',
                period === key
                  ? 'bg-[#00ff9f] text-black'
                  : 'text-white/40 hover:text-white',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Bar — exact 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'TOTAL PNL', value: formatPnl(data.grandPnl ?? 0), positive: (data.grandPnl ?? 0) >= 0 },
          { label: 'WIN RATE', value: `${(data.grandWinRate ?? 0).toFixed(1)}%` },
          { label: 'AVG R', value: `${(data.avgRR ?? 0) >= 1 ? '+' : ''}${(data.avgRR ?? 0).toFixed(2)}R`, positive: (data.avgRR ?? 0) >= 1 },
          { label: 'PROFIT FACTOR', value: (data.profitFactor ?? 0).toFixed(2) },
          { label: 'TOTAL TRADES', value: (data.grandTotal ?? 0).toString() },
          { label: 'BEST DAY', value: formatPnl(data.bestDay ?? 0), positive: true },
        ].map((kpi, i) => (
          <div key={i} className="rounded-2xl bg-[#111311] border border-white/5 p-4">
            <div className="text-[9px] tracking-[1.5px] uppercase text-white/40">{kpi.label}</div>
            <div className={cn('text-2xl font-semibold tabular-nums mt-1 tracking-[-0.5px]', kpi.positive ? 'text-[#00ff9f]' : 'text-[#ff4d4d]')}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* 2x2 Tables — pixel perfect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatsTable
          title="SYMBOL PERFORMANCE"
          rows={tickerRows}
          firstColLabel="SYMBOL"
          emptyMessage="No trades found"
        />
        <StatsTable
          title="WEEKDAY PERFORMANCE"
          rows={weekdayRows}
          firstColLabel="DAY"
          emptyMessage="No trades found"
        />
        <StatsTable
          title="CONCEPT / TAG PERFORMANCE"
          rows={setupRows}
          firstColLabel="TAG"
          emptyMessage="Tag your trades in the journal to see setup stats"
        />
        <StatsTable
          title="TIMEFRAME PERFORMANCE"
          rows={timeframeRows}
          firstColLabel="TIMEFRAME"
          emptyMessage="Tag your trades with timeframe tags (5m, 15m, 1H, etc.)"
        />
      </div>

      {/* Risk & Performance Metrics — exact bottom section */}
      {risk && (
        <div className="rounded-2xl bg-[#111311] border border-white/5 p-5">
          <div className="text-[10px] tracking-[2px] uppercase text-[#00ff9f]/70 mb-4">RISK & PERFORMANCE METRICS</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'SHARPE RATIO', value: risk.sharpe },
              { label: 'SORTINO RATIO', value: risk.sortino },
              { label: 'EXPECTANCY', value: `+$${risk.expectancy}` },
              { label: 'MAX DRAWDOWN', value: `-$${risk.maxDrawdown}`, negative: true },
              { label: 'PROFIT FACTOR', value: risk.profitFactor },
              { label: 'WIN / LOSS RATIO', value: risk.winLossRatio },
            ].map((m, i) => (
              <div key={i} className="rounded-xl bg-black/40 p-3">
                <div className="text-[9px] tracking-widest text-white/40">{m.label}</div>
                <div className={cn('text-2xl font-semibold tabular-nums mt-1', m.negative ? 'text-[#ff4d4d]' : 'text-white')}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal Excerpts — featured note reference log */}
      {data?.featuredExcerpts && data.featuredExcerpts.length > 0 && (
        <div className="rounded-2xl bg-[#111311] border border-white/5 p-5">
          <div className="text-[10px] tracking-[2px] uppercase text-[#00ff9f]/70 mb-4">JOURNAL EXCERPTS</div>
          <div className="space-y-2">
            {data.featuredExcerpts.slice(0, 15).map(ex => (
              <div
                key={ex.id}
                className="flex items-start gap-3 rounded-xl bg-black/40 p-3 hover:bg-black/60 transition-colors group cursor-default"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {ex.excerptTitle || 'Untitled'}
                    </span>
                    <span className="shrink-0 text-[9px] tabular-nums text-white/30">
                      {new Date(ex.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/40">{ex.instrument}</span>
                    <span className={cn(
                      'text-[9px] font-semibold',
                      ex.side === 'LONG' ? 'text-[#00ff9f]' : ex.side === 'SHORT' ? 'text-[#ff4d4d]' : 'text-white/30'
                    )}>
                      {ex.side}
                    </span>
                    {ex.featuredExcerpt && (
                      <div
                        className="text-[10px] text-white/30 line-clamp-1 max-w-[300px]"
                        dangerouslySetInnerHTML={{ __html: ex.featuredExcerpt }}
                      />
                    )}
                  </div>
                </div>
                <div className={cn(
                  'shrink-0 text-xs font-semibold tabular-nums',
                  ex.pnl >= 0 ? 'text-[#00ff9f]' : 'text-[#ff4d4d]'
                )}>
                  {formatPnl(ex.pnl)}
                </div>
              </div>
            ))}
          </div>
          {data.featuredExcerpts.length > 15 && (
            <div className="mt-2 text-center text-[9px] text-white/25">
              Showing 15 of {data.featuredExcerpts.length} excerpts
            </div>
          )}
        </div>
      )}
    </div>
  )
}
