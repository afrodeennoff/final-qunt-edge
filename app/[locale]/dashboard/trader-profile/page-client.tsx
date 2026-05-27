'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { endOfDay, format, startOfDay, subDays, subMonths, subYears } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon, CircleDot, Globe, Lock, Sparkles } from 'lucide-react'

import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  useDashboardAccountsList,
  useDashboardIsLoading,
  useDashboardStats,
} from '@/context/data-provider'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { getLeaderboardVisibility, toggleLeaderboardVisibility } from '@/server/user-profile'
import { useUserStore } from '@/store/user-store'
import { TraderProfileShareButton } from './components/trader-profile-share-button'

const RadarChartCard = dynamic(() => import('./components/RadarChartCard'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl border border-border/30 bg-muted" />,
})

const CalendarWidget = dynamic(() => import('./components/CalendarWidget'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl border border-border/30 bg-muted" />,
})

interface BenchmarkMetrics {
  riskReward: number
  drawdown: number
  winRate: number
  avgReturn: number
  sampleSize: number
}

interface TraderMetrics {
  riskReward: number
  drawdown: number
  winRate: number
  avgReturn: number
  totalTrades: number
  netPnl: number
  consistencyRate: number
  winningStreak: number
  sumGain: number
  breakEvenRate: number
}

type DateFilterPreset =
  | 'last_week'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'last_year'
  | 'custom'

type StatTone = 'default' | 'positive' | 'negative'

const insetPanelClassName = 'rounded-xl border border-border/25 bg-card/95 shadow-sm'

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v))
}
function scoreHigherBetter(v: number, b: number) {
  const m = Math.max(v, b, 1)
  return clamp((Math.max(0, v) / m) * 100)
}
function scoreLowerBetter(v: number, b: number) {
  const m = Math.max(v, b, 1)
  return clamp((1 - Math.max(0, v) / m) * 100)
}
function scoreSigned(v: number, b: number) {
  const mn = Math.min(v, b, 0)
  const mx = Math.max(v, b, 1)
  return mx === mn ? 50 : clamp(((v - mn) / (mx - mn)) * 100)
}
function fv(v: number, d = 2) {
  return Number.isFinite(v) ? v.toFixed(d) : '0.00'
}
function fs(v: number, d = 2) {
  return Number.isFinite(v) ? `${v >= 0 ? '+' : ''}${v.toFixed(d)}` : '0.00'
}
function getWinningStreak(values: number[]) {
  let c = 0
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] > 0) c++
    else break
  }
  return c
}
function isDateWithinRange(v: Date, r?: DateRange) {
  const f = r?.from ? startOfDay(r.from) : undefined
  const t = r?.to ? endOfDay(r.to) : undefined
  if (f && v < f) return false
  if (t && v > t) return false
  return true
}

function StatTile({
  label,
  value,
  tone = 'default',
  className,
}: {
  label: string
  value: string
  tone?: StatTone
  className?: string
}) {
  return (
    <div className={cn(insetPanelClassName, 'px-4 py-3', className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1.5 text-xl font-semibold tabular-nums tracking-tight',
          tone === 'positive' && 'text-semantic-success',
          tone === 'negative' && 'text-semantic-error',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function MeterRow({
  label,
  value,
  progress,
}: {
  label: string
  value: string
  progress: number
}) {
  return (
    <div className={cn(insetPanelClassName, 'px-4 py-3')}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-border/20">
        <div
          className="h-full rounded-full bg-primary/50 transition-[width] duration-300"
          style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
        />
      </div>
    </div>
  )
}

export default function TraderProfilePageClient() {
  const { formattedTrades } = useDashboardStats()
  const isLoading = useDashboardIsLoading()
  const accounts = useDashboardAccountsList()
  const user = useUserStore((s) => s.user)
  const supabaseUser = useUserStore((s) => s.supabaseUser)
  const isMobile = useIsMobile()

  const [benchmark, setBenchmark] = useState<BenchmarkMetrics | null>(null)
  const [dateFilterPreset, setDateFilterPreset] = useState<DateFilterPreset>('last_month')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | undefined>(undefined)
  const [tradeFeedPage, setTradeFeedPage] = useState(1)
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false)
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false)

  const isOwnProfile = Boolean(supabaseUser)

  useEffect(() => {
    if (!isOwnProfile) return
    let alive = true
    getLeaderboardVisibility()
      .then((r) => {
        if (alive) setShowOnLeaderboard(r.showOnLeaderboard)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [isOwnProfile])

  const handleToggleLeaderboard = async () => {
    if (isTogglingVisibility) return
    setIsTogglingVisibility(true)
    try {
      const r = await toggleLeaderboardVisibility()
      if (r.success) setShowOnLeaderboard(r.showOnLeaderboard)
    } catch {
    } finally {
      setIsTogglingVisibility(false)
    }
  }

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch('/api/trader-profile/benchmark', {
          credentials: 'include',
          cache: 'no-store',
        })
        if (r.ok && alive) {
          const p = (await r.json()) as { benchmark?: BenchmarkMetrics }
          setBenchmark(p.benchmark ?? null)
        }
      } catch {}
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const profileName = useMemo(() => {
    return (
      user?.username ||
      supabaseUser?.user_metadata?.full_name ||
      supabaseUser?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      supabaseUser?.email?.split('@')[0] ||
      'Trader'
    )
  }, [user, supabaseUser])

  const profileAvatar = useMemo(() => {
    const a = supabaseUser?.user_metadata?.avatar_url
    return typeof a === 'string' && a.length > 0 ? a : null
  }, [supabaseUser])

  const profileInitials = useMemo(() => {
    const p = profileName
      .split(' ')
      .map((v: string) => v.trim())
      .filter(Boolean)
      .slice(0, 2)
    return p.length === 0
      ? 'TR'
      : p
          .map((part: string) => part[0]?.toUpperCase() ?? '')
          .join('') || 'TR'
  }, [profileName])

  const activeDateRange = useMemo<DateRange | undefined>(() => {
    const now = new Date()
    switch (dateFilterPreset) {
      case 'last_week':
        return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) }
      case 'last_month':
        return { from: startOfDay(subMonths(now, 1)), to: endOfDay(now) }
      case 'last_3_months':
        return { from: startOfDay(subMonths(now, 3)), to: endOfDay(now) }
      case 'last_6_months':
        return { from: startOfDay(subMonths(now, 6)), to: endOfDay(now) }
      case 'last_year':
        return { from: startOfDay(subYears(now, 1)), to: endOfDay(now) }
      case 'custom':
        return customDateRange
      default:
        return undefined
    }
  }, [customDateRange, dateFilterPreset])

  const filteredTrades = useMemo(() => {
    const trades = formattedTrades || []
    const from = activeDateRange?.from ? startOfDay(activeDateRange.from) : undefined
    const to = activeDateRange?.to ? endOfDay(activeDateRange.to) : undefined
    if (!from && !to) return trades
    return trades.filter((trade: { entryDate: string | Date }) => {
      const e = new Date(trade.entryDate)
      if (isNaN(e.getTime())) return false
      if (from && e < from) return false
      if (to && e > to) return false
      return true
    })
  }, [activeDateRange, formattedTrades])

  const metrics = useMemo<TraderMetrics>(() => {
    const trades = filteredTrades || []
    const sorted = [...trades].sort(
      (a: { entryDate: string | Date }, b: { entryDate: string | Date }) =>
        new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
    )
    const pnlValues = sorted.map((trade: { pnl?: number }) => Number(trade.pnl || 0))
    const netValues = sorted.map(
      (trade: { pnl?: number; commission?: number }) =>
        Number(trade.pnl || 0) - Number(trade.commission || 0),
    )
    const wins = pnlValues.filter((v: number) => v > 0)
    const losses = pnlValues.filter((v: number) => v < 0)
    const sumGain = wins.reduce((a: number, v: number) => a + v, 0)
    const avgWin = wins.length > 0 ? wins.reduce((a: number, b: number) => a + b, 0) / wins.length : 0
    const avgLossAbs =
      losses.length > 0
        ? Math.abs(losses.reduce((a: number, b: number) => a + b, 0) / losses.length)
        : 0
    const decisive = wins.length + losses.length
    const winRate = decisive > 0 ? (wins.length / decisive) * 100 : 0
    const totalTrades = trades.length
    const cumulativePnl = netValues.reduce((a: number, v: number) => a + v, 0)
    const avgReturn = totalTrades > 0 ? cumulativePnl / totalTrades : 0
    let running = 0
    let peak = 0
    let maxDD = 0
    for (const n of netValues) {
      running += n
      peak = Math.max(peak, running)
      maxDD = Math.max(maxDD, peak - running)
    }
    const dayPnl = new Map<string, number>()
    sorted.forEach((trade: { entryDate: string | Date; pnl?: number }) => {
      const k = new Date(trade.entryDate).toISOString().slice(0, 10)
      dayPnl.set(k, (dayPnl.get(k) ?? 0) + Number(trade.pnl || 0))
    })
    const activeDaysArr = [...dayPnl.values()]
    const consistencyRate =
      activeDaysArr.length > 0
        ? (activeDaysArr.filter((v: number) => v > 0).length / activeDaysArr.length) * 100
        : 0
    const winningStreak = getWinningStreak(pnlValues)
    const breakEvenRate =
      avgWin + avgLossAbs > 0 ? (avgLossAbs / (avgWin + avgLossAbs)) * 100 : 0
    return {
      riskReward: avgLossAbs > 0 ? avgWin / avgLossAbs : 0,
      drawdown: maxDD,
      winRate,
      avgReturn,
      totalTrades,
      netPnl: cumulativePnl,
      consistencyRate,
      winningStreak,
      sumGain,
      breakEvenRate,
    }
  }, [filteredTrades])

  const radarData = useMemo(() => {
    const b = benchmark ?? {
      riskReward: 0,
      drawdown: 0,
      winRate: 0,
      avgReturn: 0,
      sampleSize: 0,
    }
    const totalTradeBaseline = Math.max(20, b.sampleSize)
    return [
      { metric: 'TOTAL TRADES', trader: scoreHigherBetter(metrics.totalTrades, totalTradeBaseline) },
      {
        metric: 'RISK REWARD',
        trader: scoreHigherBetter(metrics.riskReward, b.riskReward),
      },
      { metric: 'AVG. DRAWDOWN', trader: scoreLowerBetter(metrics.drawdown, b.drawdown) },
      { metric: 'WIN RATE', trader: scoreHigherBetter(metrics.winRate, b.winRate) },
      { metric: 'AVG RETURN', trader: scoreSigned(metrics.avgReturn, b.avgReturn) },
    ]
  }, [benchmark, metrics])

  const closedTrades = useMemo(
    () =>
      [...(filteredTrades || [])]
        .filter((trade: { closeDate?: string | Date | null }) => {
          if (!trade.closeDate) return false
          const p = new Date(trade.closeDate)
          return !isNaN(p.getTime())
        })
        .sort(
          (
            a: { closeDate?: string | Date | null },
            b: { closeDate?: string | Date | null },
          ) =>
            new Date(b.closeDate as string | Date).getTime() -
            new Date(a.closeDate as string | Date).getTime(),
        ),
    [filteredTrades],
  )

  const tradesPerPage = 5
  const totalPages = Math.max(1, Math.ceil(closedTrades.length / tradesPerPage))
  const paginatedClosedTrades = useMemo(() => {
    const s = (tradeFeedPage - 1) * tradesPerPage
    return closedTrades.slice(s, s + tradesPerPage)
  }, [closedTrades, tradeFeedPage])

  const totalWithdraw = useMemo(
    () =>
      (accounts || []).reduce(
        (acc: number, acct: { payouts?: { status: string; date: string; amount: number }[] }) =>
          acc +
          (acct.payouts || [])
            .filter(
              (p) => p.status === 'PAID' && isDateWithinRange(new Date(p.date), activeDateRange),
            )
            .reduce((s: number, p: { amount: number }) => s + Number(p.amount || 0), 0),
        0,
      ),
    [accounts, activeDateRange],
  )

  const totalCapital = useMemo(
    () =>
      (accounts || []).reduce(
        (s: number, acct: { startingBalance?: number }) => s + Number(acct.startingBalance || 0),
        0,
      ) +
      (filteredTrades || []).reduce(
        (s: number, t: { pnl?: number; commission?: number }) =>
          s + Number(t.pnl || 0) - Number(t.commission || 0),
        0,
      ) -
      totalWithdraw,
    [accounts, filteredTrades, totalWithdraw],
  )

  const activeAccountsCount = useMemo(
    () => (accounts || []).filter((a: { number?: string | number }) => Boolean(a.number)).length,
    [accounts],
  )

  const tradeCalendarDays = useMemo(() => {
    const byDay = new Map<string, Date>()
    ;(filteredTrades || []).forEach((trade: { entryDate: string | Date }) => {
      const d = new Date(trade.entryDate)
      if (!isNaN(d.getTime())) {
        const k = d.toISOString().slice(0, 10)
        if (!byDay.has(k))
          byDay.set(k, new Date(d.getFullYear(), d.getMonth(), d.getDate()))
      }
    })
    return Array.from(byDay.values()).sort((a, b) => a.getTime() - b.getTime())
  }, [filteredTrades])

  const tradePnlByDay = useMemo(() => {
    const m = new Map<string, number>()
    ;(filteredTrades || []).forEach(
      (trade: { entryDate: string | Date; pnl?: number; commission?: number }) => {
        const k = new Date(trade.entryDate).toISOString().slice(0, 10)
        m.set(k, (m.get(k) ?? 0) + Number(trade.pnl || 0) - Number(trade.commission || 0))
      },
    )
    return m
  }, [filteredTrades])

  const positivePnlDays = useMemo(
    () => tradeCalendarDays.filter((d) => (tradePnlByDay.get(d.toISOString().slice(0, 10)) ?? 0) > 0),
    [tradeCalendarDays, tradePnlByDay],
  )

  const negativePnlDays = useMemo(
    () => tradeCalendarDays.filter((d) => (tradePnlByDay.get(d.toISOString().slice(0, 10)) ?? 0) < 0),
    [tradeCalendarDays, tradePnlByDay],
  )

  const latestTradeDay =
    tradeCalendarDays.length > 0
      ? tradeCalendarDays[tradeCalendarDays.length - 1]
      : undefined

  const selectedPnl = useMemo(() => {
    const t = selectedCalendarDay ?? latestTradeDay
    if (!t) return 0
    return tradePnlByDay.get(t.toISOString().slice(0, 10)) ?? 0
  }, [selectedCalendarDay, latestTradeDay, tradePnlByDay])

  const selectedDayLabel = useMemo(() => {
    if (selectedCalendarDay) return format(selectedCalendarDay, 'EEE, MMM d')
    if (latestTradeDay) return format(latestTradeDay, 'EEE, MMM d')
    return 'No active session'
  }, [selectedCalendarDay, latestTradeDay])

  const reviewWindowSummary = useMemo(() => {
    if (activeDateRange?.from && activeDateRange?.to)
      return `${format(activeDateRange.from, 'MMM d, yyyy')} - ${format(activeDateRange.to, 'MMM d, yyyy')}`
    if (activeDateRange?.from) return format(activeDateRange.from, 'MMM d, yyyy')
    return 'All available trades'
  }, [activeDateRange])

  const tradeFeedSummary = useMemo(() => {
    if (closedTrades.length === 0) return '0 of 0'
    const s = (tradeFeedPage - 1) * tradesPerPage + 1
    const e = Math.min(tradeFeedPage * tradesPerPage, closedTrades.length)
    return `${s}-${e} of ${closedTrades.length}`
  }, [closedTrades.length, tradeFeedPage])

  useEffect(() => {
    setTradeFeedPage(1)
  }, [dateFilterPreset, customDateRange?.from, customDateRange?.to, closedTrades.length])

  return (
    <UnifiedPageShell density="compact" widthClassName="max-w-[2400px]">
      <div className="space-y-5">
        {/* Profile Header */}
        <UnifiedSurface className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="h-20 w-20 shrink-0 rounded-2xl border border-border sm:h-24 sm:w-24">
                <AvatarImage src={profileAvatar ?? undefined} alt={`${profileName} avatar`} />
                <AvatarFallback className="bg-background text-lg font-semibold">
                  {profileInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Trader Profile
                  </Badge>
                  <TraderProfileShareButton />
                </div>
                <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">
                  {profileName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Performance board for reviewing consistency, session rhythm, and active account
                  health.
                </p>
              </div>
            </div>
            <div className={cn(insetPanelClassName, 'w-full p-3.5 sm:w-auto sm:min-w-[18rem]')}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Public visibility
                  </p>
                  <Badge
                    variant={showOnLeaderboard ? 'default' : 'outline'}
                    className="inline-flex gap-1.5"
                  >
                    {showOnLeaderboard ? (
                      <Globe className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    {showOnLeaderboard ? 'Public' : 'Private'}
                  </Badge>
                </div>
                {isOwnProfile && (
                  <Switch
                    checked={showOnLeaderboard}
                    onCheckedChange={() => handleToggleLeaderboard()}
                    disabled={isTogglingVisibility}
                  />
                )}
              </div>
            </div>
          </div>
        </UnifiedSurface>

        {/* Metrics + Controls */}
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <StatTile
                label="Net PnL"
                value={fs(metrics.netPnl)}
                tone={metrics.netPnl > 0 ? 'positive' : metrics.netPnl < 0 ? 'negative' : 'default'}
              />
              <StatTile
                label="Avg net / trade"
                value={fs(metrics.avgReturn)}
                tone={
                  metrics.avgReturn > 0
                    ? 'positive'
                    : metrics.avgReturn < 0
                      ? 'negative'
                      : 'default'
                }
              />
              <StatTile
                label="Consistency"
                value={`${fv(metrics.consistencyRate)}%`}
                tone={metrics.consistencyRate >= 50 ? 'positive' : 'default'}
              />
            </div>
            <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
              <StatTile label="Win Rate" value={`${fv(metrics.winRate)}%`} />
              <StatTile label="Total Trades" value={String(metrics.totalTrades)} />
              <StatTile
                label="Current Streak"
                value={metrics.winningStreak > 0 ? `${metrics.winningStreak} wins` : 'Reset'}
              />
              <StatTile label="Active Accounts" value={String(activeAccountsCount)} />
            </div>
          </div>

          <div className={cn(insetPanelClassName, 'p-5')}>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Review Window
                </p>
                <p className="mt-1 text-sm font-semibold">{reviewWindowSummary}</p>
              </div>
              <div className="flex gap-2">
                <Select
                  value={dateFilterPreset}
                  onValueChange={(v: DateFilterPreset) => setDateFilterPreset(v)}
                >
                  <SelectTrigger className="h-10 flex-1 border-border bg-muted">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_week">Last Week</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                    <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {dateFilterPreset === 'custom' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-10 border-border bg-muted">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="end">
                      <Calendar
                        mode="range"
                        selected={customDateRange}
                        onSelect={setCustomDateRange}
                        numberOfMonths={isMobile ? 1 : 2}
                        className="p-0"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar + Radar */}
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <UnifiedSurface className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Daily Session Pattern
              </p>
              <Badge variant="outline">
                {selectedDayLabel} · {fs(selectedPnl)}
              </Badge>
            </div>
            <CalendarWidget
              selectedDay={selectedCalendarDay}
              latestTradeDay={latestTradeDay}
              onSelectDay={setSelectedCalendarDay}
              positivePnlDays={positivePnlDays}
              negativePnlDays={negativePnlDays}
              tradePnlByDay={tradePnlByDay}
            />
          </UnifiedSurface>
          <UnifiedSurface className="space-y-5 p-5 sm:p-6">
            <RadarChartCard
              radarData={radarData}
              isBenchmarkLoading={false}
              benchmarkSampleSize={benchmark?.sampleSize}
            />
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Execution Quality
              </p>
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  label="Max DD"
                  value={fv(metrics.drawdown)}
                  tone={metrics.drawdown > 0 ? 'negative' : 'default'}
                />
                <StatTile
                  label="Risk/Reward"
                  value={fv(metrics.riskReward)}
                  tone={metrics.riskReward >= 1 ? 'positive' : 'default'}
                />
              </div>
              <MeterRow
                label="Win Rate"
                value={`${fv(metrics.winRate)}%`}
                progress={Math.min(100, Math.max(8, metrics.winRate))}
              />
              <MeterRow
                label="Trade Volume"
                value={`${metrics.totalTrades} trades`}
                progress={metrics.totalTrades}
              />
            </div>
          </UnifiedSurface>
        </div>

        {/* Trade History */}
        <UnifiedSurface className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Trade History
            </p>
            <Badge variant="secondary">{tradeFeedSummary}</Badge>
          </div>
          <div className="space-y-2">
            {paginatedClosedTrades.length === 0 ? (
              <div
                className={cn(
                  insetPanelClassName,
                  'px-4 py-4 text-sm text-muted-foreground',
                )}
              >
                No closed trades in range.
              </div>
            ) : (
              paginatedClosedTrades.map(
                (trade: {
                  id: string
                  pnl?: number
                  instrument?: string
                  entryDate: string | Date
                  closeDate?: string | Date | null
                }) => {
                  const pnl = Number(trade.pnl || 0)
                  return (
                    <div
                      key={trade.id}
                      className={cn(
                        insetPanelClassName,
                        'flex items-center justify-between gap-3 px-4 py-3',
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <CircleDot
                          className={cn(
                            'h-3.5 w-3.5 shrink-0',
                            pnl >= 0 ? 'text-semantic-success' : 'text-semantic-error',
                          )}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {trade.instrument || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Closed{' '}
                            {trade.closeDate
                              ? format(new Date(trade.closeDate), 'MMM d, yyyy • p')
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <p
                        className={cn(
                          'shrink-0 text-sm font-semibold tabular-nums',
                          pnl >= 0 ? 'text-semantic-success' : 'text-semantic-error',
                        )}
                      >
                        {fs(pnl)}
                      </p>
                    </div>
                  )
                },
              )
            )}
          </div>
          {closedTrades.length > tradesPerPage && (
            <div className={cn(insetPanelClassName, 'mt-4 px-3 py-2')}>
              <Pagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setTradeFeedPage((c) => Math.max(1, c - 1))
                      }}
                      className={
                        tradeFeedPage === 1 ? 'pointer-events-none opacity-50' : ''
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive size="default" className="min-w-20">
                      {tradeFeedPage} / {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setTradeFeedPage((c) => Math.min(totalPages, c + 1))
                      }}
                      className={
                        tradeFeedPage >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </UnifiedSurface>
      </div>
    </UnifiedPageShell>
  )
}
