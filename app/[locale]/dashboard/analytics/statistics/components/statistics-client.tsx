'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { computeStatistics, type ComputableTrade } from '@/lib/compute-statistics'
import { StatsTable, type StatsTableRow } from './stats-table'
import type { StatisticsResult, SetupStat, WeekdayStat, TickerStat } from '../types'
import { useUserStore } from '@/store/user-store'
import { cn } from '@/lib/utils'
import { ChevronDown, X } from 'lucide-react'
import { useDashboardStats } from '@/context/data-provider'
import { getJournalTradesAction } from '@/server/journal'


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
  const userId = useUserStore(s => s.supabaseUser?.id ?? s.user?.id ?? null)
  const { formattedTrades, statistics } = useDashboardStats()
  const providerLoading = useUserStore(s => s.isLoading)

  // Fetch journal entries to merge with trades for tag/excerpt statistics
  const [journalMap, setJournalMap] = useState<Map<string, { customTags: string[]; excerptTitle: string | null; featuredExcerpt: string | null }>>(new Map())

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    let currentPage = 1
    const pageSize = 200
    const allEntries: Array<{ trade: Record<string, unknown>; journal: Record<string, unknown> | null }> = []

    async function fetchAll() {
      let hasMore = true
      const uid = userId!
      while (hasMore) {
        const result = await getJournalTradesAction(uid, currentPage, pageSize)
        if (cancelled) return
        for (const entry of result.entries) {
          allEntries.push(entry as typeof allEntries[number])
        }
        hasMore = currentPage < result.totalPages
        currentPage++
      }
      if (cancelled) return
      const map = new Map<string, { customTags: string[]; excerptTitle: string | null; featuredExcerpt: string | null }>()
      for (const entry of allEntries) {
        const trade = entry.trade as Record<string, unknown>
        const journal = entry.journal as Record<string, unknown> | null
        const tradeId = trade?.id as string | undefined
        if (tradeId && journal) {
          map.set(tradeId, {
            customTags: (journal.customTags as string[]) ?? [],
            excerptTitle: (journal.excerptTitle as string | null) ?? null,
            featuredExcerpt: (journal.featuredExcerpt as string | null) ?? null,
          })
        }
      }
      setJournalMap(map)
    }

    fetchAll().catch(() => {})
    return () => { cancelled = true }
  }, [userId])

  const [period, setPeriod] = useState<TimePeriod>('all')
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountDropRef = useRef<HTMLDivElement>(null)
  const [selectedExcerpt, setSelectedExcerpt] = useState<typeof data.featuredExcerpts[number] | null>(null)

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
        .map(t => {
          const j = journalMap.get(t.id)
          return {
            id: t.id,
            instrument: t.instrument || 'Unknown',
            side: t.side || null,
            pnl: Number(t.pnl) || 0,
            entryDate: t.entryDate,
            journal: j ? { id: t.id, customTags: j.customTags, excerptTitle: j.excerptTitle, featuredExcerpt: j.featuredExcerpt } : null,
          }
        })

      return computeStatistics(computable)
    } catch (e) {
      console.error('Statistics computation failed:', e)
      return { grandTotal: 0, tickerStats: [], weekdayStats: [], setupStats: [], timeframeStats: [], dailyStats: [], allPnls: [], grandPnl: 0, grandWinRate: 0, avgRR: 0, profitFactor: 0, bestDay: 0, featuredExcerpts: [] }
    }
  }, [formattedTrades, period, selectedAccount, journalMap])

  // Use provider's loading state
  const isLoading = providerLoading || !Array.isArray(formattedTrades)

  if (isLoading) {
    return (
      <div className="w-full px-4 lg:px-6 py-6 space-y-5 bg-background min-h-screen">
        <div className="h-5 w-24 bg-muted rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-4 h-20 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-4 h-64 animate-pulse" />
          ))}
        </div>
        <div className="rounded-2xl bg-card border border-border p-5 h-32 animate-pulse" />
      </div>
    )
  }

  if (!data || (data.grandTotal ?? 0) === 0) {
    return <div className="p-6 text-muted-foreground text-sm">No trades found for the selected period/account.</div>
  }

  const tickerRows: StatsTableRow[] = data.tickerStats.map(statToRow)
  const weekdayRows: StatsTableRow[] = data.weekdayStats.map(statToRow)
  const setupRows: StatsTableRow[] = data.setupStats.map(statToRow)
  const timeframeRows: StatsTableRow[] = data.timeframeStats.map(statToRow)

  const pnlValues = data.allPnls.map(p => p.pnl)
  const risk = computeRiskMetrics(pnlValues, data.profitFactor)

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-5 bg-background min-h-screen text-foreground">

      {/* Header + Time Filters — exact match */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-semibold tracking-[2px] uppercase text-primary">STATISTICS</div>
          {accounts.length > 1 && (
            <div ref={accountDropRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                <span>{selectedAccount ? 'Acct ' + selectedAccount : 'All Accounts'}</span>
                <ChevronDown size={12} className={cn('transition-transform', accountOpen && 'rotate-180')} />
              </button>
              {accountOpen && (
                <div className="absolute top-full mt-1 left-0 z-20 min-w-[180px] rounded-xl border border-border bg-card py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => { setSelectedAccount(null); setAccountOpen(false) }}
                    className={cn('w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted/50 transition-colors', !selectedAccount ? 'text-primary' : 'text-muted-foreground')}
                  >
                    All Accounts
                  </button>
                  {accounts.map(a => (
                    <button
                      key={a.number}
                      type="button"
                      onClick={() => { setSelectedAccount(a.number === selectedAccount ? null : a.number); setAccountOpen(false) }}
                      className={cn('w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted/50 transition-colors', a.number === selectedAccount ? 'text-primary' : 'text-muted-foreground')}
                    >
                      {a.number}{a.propfirm ? ' \u2013 ' + a.propfirm : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1 p-1 rounded-2xl bg-card border border-border">
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
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
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
          <div key={i} className="rounded-2xl bg-card border border-border p-4">
            <div className="text-[9px] tracking-[1.5px] uppercase text-muted-foreground">{kpi.label}</div>
            <div className={cn('text-2xl font-semibold tabular-nums mt-1 tracking-[-0.5px]', kpi.positive ? 'text-primary' : 'text-destructive')}>
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
        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="text-[10px] tracking-[2px] uppercase text-primary/70 mb-4">RISK & PERFORMANCE METRICS</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'SHARPE RATIO', value: risk.sharpe },
              { label: 'SORTINO RATIO', value: risk.sortino },
              { label: 'EXPECTANCY', value: `+$${risk.expectancy}` },
              { label: 'MAX DRAWDOWN', value: `-$${risk.maxDrawdown}`, negative: true },
              { label: 'PROFIT FACTOR', value: risk.profitFactor },
              { label: 'WIN / LOSS RATIO', value: risk.winLossRatio },
            ].map((m, i) => (
              <div key={i} className="rounded-xl bg-muted/40 p-3">
                <div className="text-[9px] tracking-widest text-muted-foreground">{m.label}</div>
                <div className={cn('text-2xl font-semibold tabular-nums mt-1', m.negative ? 'text-destructive' : 'text-foreground')}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal Excerpts — clickable headline cards */}
      {data?.featuredExcerpts && data.featuredExcerpts.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="text-[10px] tracking-[2px] uppercase text-primary/70 mb-4">JOURNAL EXCERPTS</div>
          <div className="space-y-2">
            {data.featuredExcerpts.slice(0, 15).map(ex => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setSelectedExcerpt(ex)}
                className="w-full flex items-center gap-4 rounded-xl bg-muted/40 p-4 hover:bg-muted/60 transition-colors text-left group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {ex.excerptTitle || 'Untitled'}
                    </span>
                    <span className="shrink-0 text-[9px] tabular-nums text-muted-foreground/60">
                      {new Date(ex.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{ex.instrument}</span>
                    <span className={cn(
                      'text-[9px] font-semibold',
                      ex.side === 'LONG' ? 'text-primary' : ex.side === 'SHORT' ? 'text-destructive' : 'text-muted-foreground/50'
                    )}>
                      {ex.side}
                    </span>
                    {ex.featuredExcerpt && (
                      <span className="text-[9px] text-muted-foreground/50 truncate max-w-[300px]">
                        {ex.featuredExcerpt.replace(/<[^>]+>/g, '').slice(0, 60)}…
                      </span>
                    )}
                  </div>
                </div>
                <div className={cn(
                  'shrink-0 text-xs font-semibold tabular-nums',
                  ex.pnl >= 0 ? 'text-primary' : 'text-destructive'
                )}>
                  {formatPnl(ex.pnl)}
                </div>
              </button>
            ))}
          </div>
          {data.featuredExcerpts.length > 15 && (
            <div className="mt-2 text-center text-[9px] text-muted-foreground/50">
              Showing 15 of {data.featuredExcerpts.length} excerpts
            </div>
          )}
        </div>
      )}

      {/* Excerpt Detail Modal */}
      {selectedExcerpt && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedExcerpt(null)}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden bg-card border border-border animate-in slide-in-from-bottom-4 duration-250"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
                <div>
                  <div className="text-[17px] font-semibold tracking-tight text-white">
                    {selectedExcerpt.excerptTitle || 'Untitled Excerpt'}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(selectedExcerpt.entryDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[11px] text-muted-foreground">{selectedExcerpt.instrument}</span>
                    <span className={cn(
                      'text-[10px] font-semibold',
                      selectedExcerpt.side === 'LONG' ? 'text-primary' : selectedExcerpt.side === 'SHORT' ? 'text-destructive' : 'text-muted-foreground/50'
                    )}>
                      {selectedExcerpt.side}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'text-sm font-semibold tabular-nums',
                    selectedExcerpt.pnl >= 0 ? 'text-primary' : 'text-destructive'
                  )}>
                    {formatPnl(selectedExcerpt.pnl)}
                  </div>
                  <button type="button" onClick={() => setSelectedExcerpt(null)} className="text-muted-foreground hover:text-foreground p-1">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-background">
                {selectedExcerpt.featuredExcerpt ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none [&_p]:mb-3 [&_p]:text-foreground/80 [&_p]:leading-relaxed [&_strong]:text-foreground [&_em]:text-muted-foreground [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_ul]:text-muted-foreground [&_ol]:text-muted-foreground [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: selectedExcerpt.featuredExcerpt }}
                  />
                ) : (
                  <div className="text-muted-foreground text-sm">No excerpt content.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
