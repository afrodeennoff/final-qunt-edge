'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { computeStatistics, type ComputableTrade } from '@/lib/compute-statistics'
import { StatsTable, type StatsTableRow } from './stats-table'
import type { SetupStat, WeekdayStat, TickerStat } from '../types'
import { useUserStore } from '@/store/user-store'
import { cn } from '@/lib/utils'
import { ChevronDown, X, Wallet } from 'lucide-react'
import { useDashboardStats } from '@/context/data-provider'
import { getJournalTradesAction } from '@/server/journal'
import {
  unifiedSectionPanelClassName,
  unifiedMetricPanelClassName,
  unifiedSectionEyebrowClassName,
} from '@/components/layout/unified-page-recipes'


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

function formatCompact(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

function computeRiskMetrics(pnls: number[]) {
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

  return { sharpe: sharpe.toFixed(2), sortino: sortino.toFixed(2), maxDrawdown: maxDd.toFixed(2) }
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

type KpiDef = {
  label: string
  value: string
  tone?: 'positive' | 'negative' | 'neutral'
}

function KpiCard({ label, value, tone = 'neutral' }: KpiDef) {
  const toneClass = tone === 'negative'
    ? 'text-destructive'
    : tone === 'positive'
      ? 'text-success'
      : 'text-foreground'
  return (
    <div className={cn(unifiedMetricPanelClassName, 'group transition-all duration-300 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/10')}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{label}</div>
      <div className={cn('text-xl lg:text-2xl font-bold tabular-nums mt-1.5 tracking-[-0.02em]', toneClass)}>
        {value}
      </div>
    </div>
  )
}

export default function StatisticsClient() {
  const accounts = useUserStore(s => s.accounts)
  const userId = useUserStore(s => s.supabaseUser?.id ?? s.user?.id ?? null)
  const { formattedTrades } = useDashboardStats()
  const providerLoading = useUserStore(s => s.isLoading)

  const [journalMap, setJournalMap] = useState<Map<string, { customTags: string[]; excerptTitle: string | null; featuredExcerpt: string | null }>>(new Map())

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    let currentPage = 1
    const pageSize = 200
    const allEntries: Array<{ trade: Record<string, unknown>; journal: Record<string, unknown> | null }> = []

    async function fetchAll() {
      let hasMore = true
      while (hasMore) {
        const result = await getJournalTradesAction(currentPage, pageSize)
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
  const [now] = useState(() => Date.now())
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountDropRef = useRef<HTMLDivElement>(null)
  const [selectedExcerpt, setSelectedExcerpt] = useState<{ id: string; excerptTitle: string | null; featuredExcerpt: string | null; instrument: string; side: string; pnl: number; entryDate: string } | null>(null)

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
        const cutoff = new Date(now - (PERIOD_DAYS[period] || 0) * 86400000)
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
      return { grandTotal: 0, tickerStats: [], weekdayStats: [], setupStats: [], timeframeStats: [], dailyStats: [], allPnls: [], grandPnl: 0, grandWinRate: 0, avgRR: 0, profitFactor: 0, bestDay: 0, worstDay: 0, grossProfit: 0, grossLoss: 0, avgWin: 0, avgLoss: 0, maxConsecWins: 0, maxConsecLosses: 0, totalRMultiple: 0, winningTrades: 0, losingTrades: 0, expectancy: 0, featuredExcerpts: [] }
    }
  }, [formattedTrades, period, selectedAccount, journalMap, now])

  const isLoading = providerLoading || !Array.isArray(formattedTrades)

  if (isLoading) {
    return (
      <div className="w-full px-4 lg:px-6 py-6 space-y-5 bg-background min-h-screen">
        <div className="h-5 w-24 bg-muted rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card p-4 h-20 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card p-4 h-64 animate-pulse" />
          ))}
        </div>
        <div className="rounded-2xl bg-card p-5 h-32 animate-pulse" />
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
  const risk = computeRiskMetrics(pnlValues)

  const perfKpis: KpiDef[] = [
    { label: 'NET PROFIT', value: formatPnl(data.grandPnl), tone: data.grandPnl >= 0 ? 'positive' : 'negative' },
    { label: 'PROFIT FACTOR', value: (data.profitFactor ?? 0).toFixed(2), tone: (data.profitFactor ?? 0) >= 1 ? 'positive' : 'negative' },
    { label: 'WIN RATE', value: `${(data.grandWinRate ?? 0).toFixed(1)}%`, tone: (data.grandWinRate ?? 0) >= 50 ? 'positive' : 'negative' },
    { label: 'TOTAL TRADES', value: data.grandTotal.toString() },
    { label: 'TOTAL R MULTIPLE', value: `${data.totalRMultiple >= 0 ? '+' : ''}${data.totalRMultiple.toFixed(1)}R`, tone: data.totalRMultiple >= 0 ? 'positive' : 'negative' },
    { label: 'EXPECTANCY', value: formatPnl(data.expectancy), tone: data.expectancy >= 0 ? 'positive' : 'negative' },
  ]

  const pnlKpis: KpiDef[] = [
    { label: 'GROSS PROFIT', value: formatPnl(data.grossProfit), tone: 'positive' },
    { label: 'GROSS LOSS', value: formatPnl(data.grossLoss), tone: 'negative' },
    { label: 'AVERAGE WIN', value: formatPnl(data.avgWin), tone: 'positive' },
    { label: 'AVERAGE LOSS', value: formatPnl(data.avgLoss), tone: 'negative' },
    { label: 'WINNING TRADES', value: (data.winningTrades ?? 0).toString(), tone: 'positive' },
    { label: 'LOSING TRADES', value: (data.losingTrades ?? 0).toString(), tone: 'negative' },
  ]

  const riskKpis: KpiDef[] = [
    { label: 'MAX DRAWDOWN', value: `-$${formatCompact(Number(risk?.maxDrawdown ?? 0))}`, tone: 'negative' },
    { label: 'SHARPE RATIO', value: risk?.sharpe ?? '--', tone: Number(risk?.sharpe ?? 0) >= 1 ? 'positive' : 'neutral' },
    { label: 'SORTINO RATIO', value: risk?.sortino ?? '--', tone: Number(risk?.sortino ?? 0) >= 1 ? 'positive' : 'neutral' },
    { label: 'MAX CONS WINS', value: (data.maxConsecWins ?? 0).toString(), tone: 'positive' },
    { label: 'MAX CONS LOSSES', value: (data.maxConsecLosses ?? 0).toString(), tone: 'negative' },
  ]

  const selectedAccountLabel = accounts.find(a => a.number === selectedAccount)

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6 bg-background min-h-screen text-foreground">

      {/* Page eyebrow */}
      <div className={unifiedSectionEyebrowClassName}>Statistics</div>

      {/* Filter bar — account + time period */}
      <div className={cn(unifiedSectionPanelClassName, 'flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4')}>
        <div ref={accountDropRef} className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen(!accountOpen)}
            className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted/50"
          >
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{selectedAccountLabel ? (selectedAccountLabel.propfirm || `Acct ${selectedAccount}`) : 'All Accounts'}</span>
            {selectedAccount && <span className="text-[10px] text-muted-foreground/50">{selectedAccount}</span>}
            <ChevronDown size={14} className={cn('text-muted-foreground transition-transform', accountOpen && 'rotate-180')} />
          </button>
          {accountOpen && (
            <div className="absolute top-full mt-1.5 left-0 z-30 min-w-[220px] rounded-xl border-0 bg-popover py-1.5 shadow-2xl shadow-black/40">
              <button
                type="button"
                onClick={() => { setSelectedAccount(null); setAccountOpen(false) }}
                className={cn('w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted/40', !selectedAccount ? 'text-primary' : 'text-muted-foreground')}
              >
                <span>All Accounts</span>
                {!selectedAccount && <span className="text-[10px]">{data.grandTotal} trades</span>}
              </button>
              {accounts.map(a => (
                <button
                  key={a.number}
                  type="button"
                  onClick={() => { setSelectedAccount(a.number === selectedAccount ? null : a.number); setAccountOpen(false) }}
                  className={cn('w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted/40', a.number === selectedAccount ? 'text-primary' : 'text-muted-foreground')}
                >
                  <span className="flex items-center gap-2">
                    {a.propfirm || `Acct ${a.number}`}
                    {a.propfirm && <span className="text-[10px] text-muted-foreground/40">{a.number}</span>}
                  </span>
                </button>
              ))}
              {accounts.length === 0 && (
                <div className="px-3.5 py-3 text-[11px] text-muted-foreground/40">No accounts connected</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-muted/30 p-1">
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
                'px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200',
                period === key
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 mb-3">Performance Summary</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {perfKpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
        </div>
      </div>

      {/* Profit & Loss Detail */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 mb-3">Profit &amp; Loss Detail</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pnlKpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
        </div>
      </div>

      {/* Risk & Consistency */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 mb-3">Risk &amp; Consistency</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {riskKpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
        </div>
      </div>

      {/* 2x2 Tables */}
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

      {/* Journal Excerpts */}
      {data?.featuredExcerpts && data.featuredExcerpts.length > 0 && (
        <div className={cn(unifiedSectionPanelClassName, 'p-5')}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 mb-4">Journal Excerpts</div>
          <div className="space-y-2">
            {data.featuredExcerpts.slice(0, 15).map(ex => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setSelectedExcerpt(ex)}
                className="w-full flex items-center gap-4 rounded-xl bg-muted/30 p-4 hover:bg-muted/50 transition-all duration-200 text-left group hover:shadow-[0_0_35px_-18px] hover:shadow-primary/10"
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
                      'text-[9px] font-bold',
                      ex.side === 'LONG' ? 'text-success' : ex.side === 'SHORT' ? 'text-destructive' : 'text-muted-foreground/50'
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
                  'shrink-0 text-xs font-bold tabular-nums',
                  ex.pnl >= 0 ? 'text-success' : 'text-destructive'
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
              className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden bg-card animate-in slide-in-from-bottom-4 duration-250 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 bg-card shrink-0">
                <div>
                  <div className="text-[17px] font-semibold tracking-tight text-foreground">
                    {selectedExcerpt.excerptTitle || 'Untitled Excerpt'}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(selectedExcerpt.entryDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[11px] text-muted-foreground">{selectedExcerpt.instrument}</span>
                    <span className={cn(
                      'text-[10px] font-bold',
                      selectedExcerpt.side === 'LONG' ? 'text-success' : selectedExcerpt.side === 'SHORT' ? 'text-destructive' : 'text-muted-foreground/50'
                    )}>
                      {selectedExcerpt.side}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'text-sm font-bold tabular-nums',
                    selectedExcerpt.pnl >= 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {formatPnl(selectedExcerpt.pnl)}
                  </div>
                  <button type="button" onClick={() => setSelectedExcerpt(null)} className="text-muted-foreground hover:text-foreground p-1">
                    <X size={18} />
                  </button>
                </div>
              </div>

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
