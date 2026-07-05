'use client'

import { useEffect, useMemo, useState } from 'react'
import { getTraderFullData, type TraderFullData } from '../actions/user'
import { DashboardStatCard } from "@/components/ui/dashboard-stat-card"
import { unifiedInsetPanelClassName, unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp, BarChart3, Activity, DollarSign, Award, TrendingDown,
  Flame, Target, CalendarDays, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, Minus,
} from 'lucide-react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  subMonths, addMonths, subDays, parseISO,
} from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from 'recharts'

function fmt(v: number): string {
  return `${v >= 0 ? '+' : '-'}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function fmtPct(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
}

function round(v: number, d = 2): number {
  return Math.round(v * 10 ** d) / 10 ** d
}

type Trade = TraderFullData['trades'][number]

function buildDayPnl(trades: Trade[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of trades) {
    const key = format(parseISO(t.closeDate), 'yyyy-MM-dd')
    map.set(key, (map.get(key) ?? 0) + t.pnl - t.commission)
  }
  return map
}

function buildCumulativeEquity(trades: Trade[]) {
  const sorted = [...trades].sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime())
  const daily: { date: string; pnl: number; cum: number }[] = []
  let cum = 0
  const byDay = new Map<string, number>()
  for (const t of sorted) {
    const key = format(parseISO(t.closeDate), 'yyyy-MM-dd')
    byDay.set(key, (byDay.get(key) ?? 0) + t.pnl - t.commission)
  }
  const sortedDays = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))
  for (const [date, pnl] of sortedDays) {
    cum += pnl
    daily.push({ date: format(parseISO(date), 'MMM dd'), pnl: round(pnl), cum: round(cum) })
  }
  return daily
}

function buildMonthlyBreakdown(trades: Trade[]) {
  const map = new Map<string, { trades: number; pnl: number; wins: number }>()
  for (const t of trades) {
    const key = format(parseISO(t.closeDate), 'yyyy-MM')
    const e = map.get(key) ?? { trades: 0, pnl: 0, wins: 0 }
    e.trades++
    e.pnl += t.pnl - t.commission
    if (t.pnl - t.commission > 0) e.wins++
    map.set(key, e)
  }
  return [...map.entries()].sort(([a], [b]) => b.localeCompare(a)).slice(0, 12)
}

function computeStats(trades: Trade[]) {
  if (!trades.length) return null
  const netPnl = trades.reduce((s, t) => s + t.pnl - t.commission, 0)
  const wins = trades.filter(t => t.pnl - t.commission > 0)
  const losses = trades.filter(t => t.pnl - t.commission < 0)
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0
  const grossProfit = wins.reduce((s, t) => s + t.pnl - t.commission, 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl - t.commission, 0))
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0
  const avgLoss = losses.length > 0 ? -(grossLoss / losses.length) : 0

  const dayPnl = buildDayPnl(trades)
  const dayValues = [...dayPnl.values()]
  const bestDay = dayValues.length ? Math.max(...dayValues) : 0
  const worstDay = dayValues.length ? Math.min(...dayValues) : 0

  let consecWins = 0; let maxConsecWins = 0
  let consecLosses = 0; let maxConsecLosses = 0
  const sorted = [...trades].sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime())
  for (const t of sorted) {
    if (t.pnl - t.commission > 0) { consecWins++; consecLosses = 0; maxConsecWins = Math.max(maxConsecWins, consecWins) }
    else { consecLosses++; consecWins = 0; maxConsecLosses = Math.max(maxConsecLosses, consecLosses) }
  }

  const avgRR = wins.length > 0 && losses.length > 0 ? (grossProfit / wins.length) / (grossLoss / losses.length) : 0

  const rrTrades = trades.filter(t => t.riskRewardRatio != null).map(t => t.riskRewardRatio!)
  const avgRRR = rrTrades.length > 0 ? rrTrades.reduce((s, v) => s + v, 0) / rrTrades.length : null

  const totalTime = trades.reduce((s, t) => s + t.timeInPosition, 0)
  const avgHoldingMinutes = trades.length > 0 ? totalTime / trades.length : 0

  return {
    totalTrades: trades.length,
    netPnl, winRate, profitFactor,
    avgWin, avgLoss, avgRR, avgRRR,
    bestDay, worstDay,
    maxConsecWins, maxConsecLosses,
    avgHoldingMinutes,
    dayPnl, dayValues,
    wins: wins.length, losses: losses.length,
  }
}

function CalendarSection({ dayPnl }: { dayPnl: Map<string, number> }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  const weekTotals = weeks.map(w => w.filter(d => isSameMonth(d, currentMonth)).reduce((s, d) => s + (dayPnl.get(format(d, 'yyyy-MM-dd')) ?? 0), 0))
  const monthDays = days.filter(d => isSameMonth(d, currentMonth) && (dayPnl.get(format(d, 'yyyy-MM-dd')) ?? 0) !== 0)
  const monthVals = monthDays.map(d => dayPnl.get(format(d, 'yyyy-MM-dd'))!)
  const pos = monthVals.filter(v => v > 0).length
  const neg = monthVals.filter(v => v < 0).length
  const total = weekTotals.reduce((s, v) => s + v, 0)

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className={cn(unifiedInsetPanelClassName, 'p-4 sm:p-5')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Trade Calendar</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="w-28 text-center text-xs font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-colors">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px text-center text-[10px] font-semibold text-muted-foreground mb-1">
        {dayNames.map(d => <div key={d} className="py-1">{d}</div>)}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-px">
          {week.map((d) => {
            const key = format(d, 'yyyy-MM-dd')
            const val = dayPnl.get(key)
            const inMonth = isSameMonth(d, currentMonth)
            const today = isToday(d)
            return (
              <div
                key={key}
                className={cn(
                  'flex items-center justify-center h-9 w-full text-[11px] font-semibold rounded-sm transition-colors',
                  !inMonth && 'text-transparent',
                  today && 'ring-1 ring-primary/40',
                  val != null && val > 0 && 'bg-semantic-success-bg text-semantic-success',
                  val != null && val < 0 && 'bg-semantic-error-bg text-semantic-error',
                  val == null && inMonth && 'bg-muted/10 text-muted-foreground/30',
                  val === 0 && inMonth && 'bg-muted/10 text-muted-foreground/30',
                )}
                title={val != null ? `${key}: ${fmt(val)}` : key}
              >
                {inMonth ? format(d, 'd') : ''}
              </div>
            )
          })}
          <div className={cn(
            'flex items-center justify-end pr-2 text-[10px] font-semibold col-span-1 h-9',
            weekTotals[wi] > 0 ? 'text-semantic-success' : weekTotals[wi] < 0 ? 'text-semantic-error' : 'text-muted-foreground/40'
          )}>
            {weekTotals[wi] !== 0 ? (weekTotals[wi] > 0 ? '+' : '') + Math.round(weekTotals[wi]).toLocaleString() : ''}
          </div>
        </div>
      ))}

      <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground pt-2 border-t border-border/10">
        <span>{pos} winning days</span>
        <span>{neg} losing days</span>
        <span className={total > 0 ? 'text-semantic-success' : total < 0 ? 'text-semantic-error' : ''}>
          Total: {fmt(total)}
        </span>
      </div>
    </div>
  )
}

function EquityChart({ data }: { data: { date: string; pnl: number; cum: number }[] }) {
  if (!data.length) return null
  return (
    <div className={cn(unifiedInsetPanelClassName, 'p-4 sm:p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Equity Curve</span>
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" opacity={0.5} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" opacity={0.5} tickLine={false} tickFormatter={(v) => fmt(v)} width={60} />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: 'none', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'var(--muted-foreground)', fontSize: 10 }}
              formatter={(value: number) => [fmt(value), '']}
            />
            <ReferenceLine y={0} stroke="var(--border)" opacity={0.4} />
            <Area type="monotone" dataKey="cum" stroke="var(--primary)" strokeWidth={2} fill="url(#eqGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function RecentTrades({ trades }: { trades: Trade[] }) {
  const recent = trades.slice(0, 15)
  return (
    <div className={cn(unifiedInsetPanelClassName, 'p-4 sm:p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-primary" />
        <span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Recent Trades</span>
      </div>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-muted-foreground border-b border-border/10">
              <th className="text-left font-semibold pb-2 pr-3">Date</th>
              <th className="text-left font-semibold pb-2 pr-3">Instrument</th>
              <th className="text-left font-semibold pb-2 pr-3">Side</th>
              <th className="text-right font-semibold pb-2 pr-3">Qty</th>
              <th className="text-right font-semibold pb-2 pr-3">PnL</th>
              <th className="text-right font-semibold pb-2 pr-3">Tags</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t) => {
              const pnl = t.pnl - t.commission
              return (
                <tr key={t.id} className="border-b border-border/5 hover:bg-muted/10 transition-colors">
                  <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{format(parseISO(t.closeDate), 'MMM dd')}</td>
                  <td className="py-2 pr-3 font-medium">{t.instrument}</td>
                  <td className="py-2 pr-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-[10px] font-semibold',
                      t.side === 'LONG' || t.side === 'Buy' ? 'text-semantic-success' : 'text-semantic-error'
                    )}>
                      {t.side === 'LONG' || t.side === 'Buy' ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                      {t.side || '-'}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-right text-muted-foreground">{Number(t.quantity).toFixed(t.quantity % 1 === 0 ? 0 : 2)}</td>
                  <td className={cn('py-2 pr-3 text-right font-semibold tabular-nums', pnl >= 0 ? 'text-semantic-success' : 'text-semantic-error')}>{fmt(pnl)}</td>
                  <td className="py-2 pr-3 text-right">
                    {t.tags.length > 0 ? (
                      <span className="inline-flex gap-1 flex-wrap justify-end">
                        {t.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/20 text-muted-foreground">{tag}</span>
                        ))}
                        {t.tags.length > 2 && <span className="text-[9px] text-muted-foreground/60">+{t.tags.length - 2}</span>}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MonthlyBreakdown({ trades }: { trades: Trade[] }) {
  const months = useMemo(() => buildMonthlyBreakdown(trades), [trades])
  if (!months.length) return null
  return (
    <div className={cn(unifiedInsetPanelClassName, 'p-4 sm:p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Monthly Performance</span>
      </div>
      <div className="space-y-2">
        {months.map(([key, m]) => {
          const winRate = m.trades > 0 ? (m.wins / m.trades) * 100 : 0
          return (
            <div key={key} className="flex items-center gap-3 py-1.5 border-b border-border/5 last:border-0">
              <span className="w-16 text-[11px] font-semibold text-foreground/80">{key}</span>
              <div className="flex-1 h-2 rounded-full bg-muted/15 overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', m.pnl >= 0 ? 'bg-semantic-success-bg' : 'bg-semantic-error-bg')} style={{ width: `${Math.min(100, Math.max(2, Math.abs(m.pnl / 1000)))}%` }} />
              </div>
              <span className={cn('w-20 text-right text-[11px] font-semibold tabular-nums', m.pnl >= 0 ? 'text-semantic-success' : 'text-semantic-error')}>
                {fmt(m.pnl)}
              </span>
              <span className="w-12 text-right text-[10px] text-muted-foreground">{winRate.toFixed(0)}%</span>
              <span className="w-8 text-right text-[10px] text-muted-foreground">{m.trades}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TraderDetailClient({ userId }: { userId: string }) {
  const [data, setData] = useState<TraderFullData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getTraderFullData(userId).then(res => {
      if (!mounted) return
      if (res.success && res.data) setData(res.data)
      setLoading(false)
    }).catch(() => { setLoading(false) })
    return () => { mounted = false }
  }, [userId])

  const stats = useMemo(() => data ? computeStats(data.trades) : null, [data])
  const equity = useMemo(() => data ? buildCumulativeEquity(data.trades) : [], [data])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  if (!data || !stats) {
    return (
      <div className={cn(unifiedInsetPanelClassName, 'p-8 text-center')}>
        <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No trade history for this trader.</p>
      </div>
    )
  }

  const avgHrs = stats.avgHoldingMinutes > 60
    ? `${(stats.avgHoldingMinutes / 60).toFixed(1)}h`
    : `${Math.round(stats.avgHoldingMinutes)}m`

  return (
    <div className="space-y-6">
      {/* Extended Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          label="Total PnL"
          value={fmt(stats.netPnl)}
          valueClassName={stats.netPnl >= 0 ? 'text-primary' : 'text-destructive'}
          icon={<DollarSign className="h-4 w-4" />}
          size="sm"
        />
        <DashboardStatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          valueClassName={stats.winRate >= 50 ? 'text-primary' : 'text-warning'}
          icon={<Target className="h-4 w-4" />}
          size="sm"
        />
        <DashboardStatCard
          label="Total Trades"
          value={stats.totalTrades}
          icon={<Activity className="h-4 w-4" />}
          size="sm"
        />
        <DashboardStatCard
          label="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
          valueClassName={stats.profitFactor >= 1.5 ? 'text-primary' : stats.profitFactor > 0 ? 'text-warning' : undefined}
          icon={<BarChart3 className="h-4 w-4" />}
          size="sm"
        />
        <DashboardStatCard
          label="Avg Win"
          value={fmt(stats.avgWin)}
          icon={<Award className="h-4 w-4" />}
          size="sm"
          valueClassName="text-semantic-success"
        />
        <DashboardStatCard
          label="Avg Loss"
          value={fmt(stats.avgLoss)}
          icon={<TrendingDown className="h-4 w-4" />}
          size="sm"
          valueClassName="text-semantic-error"
        />
        <DashboardStatCard
          label="Best Day"
          value={fmt(stats.bestDay)}
          icon={<ArrowUp className="h-4 w-4" />}
          size="sm"
          valueClassName="text-semantic-success"
        />
        <DashboardStatCard
          label="Worst Day"
          value={fmt(stats.worstDay)}
          icon={<ArrowDown className="h-4 w-4" />}
          size="sm"
          valueClassName="text-semantic-error"
        />
        <DashboardStatCard
          label="Consecutive Wins"
          value={stats.maxConsecWins}
          icon={<Flame className="h-4 w-4" />}
          size="sm"
        />
        <DashboardStatCard
          label="Consecutive Losses"
          value={stats.maxConsecLosses}
          icon={<Minus className="h-4 w-4" />}
          size="sm"
          valueClassName="text-destructive"
        />
        <DashboardStatCard
          label="Avg R Multiple"
          value={stats.avgRRR != null ? stats.avgRRR.toFixed(2) : '-'}
          icon={<Target className="h-4 w-4" />}
          size="sm"
        />
        <DashboardStatCard
          label="Avg Holding Time"
          value={avgHrs}
          icon={<Activity className="h-4 w-4" />}
          size="sm"
        />
      </div>

      {/* Mentor Insight */}
      <div className={cn(unifiedInsetPanelClassName, 'p-4 sm:p-5')}>
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-4 w-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Mentor Insight</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">
          {stats.totalTrades === 0 ? 'No activity yet.' :
            stats.winRate < 35 && stats.netPnl < 0 ?
              `High loss rate (${stats.winRate.toFixed(0)}%) with negative PnL. Review risk management: avg loss is ${fmt(stats.avgLoss)} vs avg win of ${fmt(stats.avgWin)}. Focus on cutting losers earlier.` :
            stats.maxConsecLosses > 5 ?
              `Alert: ${stats.maxConsecLosses} consecutive losses — likely tilt or strategy drift. Recommend taking a break and reviewing recent trade plans.` :
            stats.netPnl > 0 && stats.avgRRR != null && stats.avgRRR > 1.5 ?
              `Solid execution: ${stats.winRate.toFixed(0)}% win rate with ${stats.avgRRR.toFixed(2)}R avg. Risk-reward discipline is strong. Focus on scaling what works.` :
            stats.netPnl > 0 ?
              `Profitable trader (${fmt(stats.netPnl)}), ${stats.totalTrades} trades executed. Avg win ${fmt(stats.avgWin)} / avg loss ${fmt(stats.avgLoss)}. Monitor for consistency.` :
              `Underwater by ${fmt(stats.netPnl)} across ${stats.totalTrades} trades. Avg R multiple: ${stats.avgRRR != null ? stats.avgRRR.toFixed(2) : 'N/A'}. Review trade plans and risk rules.`
          }
        </p>
      </div>

      {/* Two-column layout: Calendar + Equity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CalendarSection dayPnl={stats.dayPnl} />
        <EquityChart data={equity} />
      </div>

      {/* Monthly Breakdown + Recent Trades */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyBreakdown trades={data.trades} />
        <RecentTrades trades={data.trades} />
      </div>
    </div>
  )
}