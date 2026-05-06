'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { endOfDay, format, startOfDay, subDays, subMonths, subYears } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import {
  Calendar as CalendarIcon,
  CircleDot,
  Globe,
  Lock,
  Share2,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { UnifiedPerformanceDashboard } from './components/UnifiedPerformanceDashboard'
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
import { toast } from 'sonner'

import { TableSkeleton, CalendarSkeleton } from './components/Skeletons'
import { TraderProfileShareButton } from './components/trader-profile-share-button'

const RadarChartCard = dynamic(() => import('./components/RadarChartCard'), {
  loading: () => (
    <div className="rounded-xl border border-border/30 bg-card/40 p-3">
      <div className="h-64 w-full animate-pulse rounded-lg bg-muted/30" />
    </div>
  ),
})

const CalendarWidget = dynamic(() => import('./components/CalendarWidget'), {
  loading: () => <CalendarSkeleton />,
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

const insetPanelClassName =
  'rounded-xl border border-border/30 bg-card/40 shadow-none'

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function scoreHigherBetter(value: number, baseline: number) {
  const maxRef = Math.max(value, baseline, 1)
  return clamp((Math.max(0, value) / maxRef) * 100)
}

function scoreLowerBetter(value: number, baseline: number) {
  const maxRef = Math.max(value, baseline, 1)
  return clamp((1 - Math.max(0, value) / maxRef) * 100)
}

function scoreSigned(value: number, baseline: number) {
  const minRef = Math.min(value, baseline, 0)
  const maxRef = Math.max(value, baseline, 1)
  if (maxRef === minRef) return 50
  return clamp(((value - minRef) / (maxRef - minRef)) * 100)
}

function formatValue(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : '0.00'
}

function formatSigned(value: number, digits = 2) {
  if (!Number.isFinite(value)) return '0.00'
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}`
}

function formatCapitalCompact(value: number) {
  if (!Number.isFinite(value)) return '0'
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`
  return `${sign}${abs.toFixed(0)}`
}

function formatPnlCell(value: number) {
  if (!Number.isFinite(value)) return '0'
  if (value === 0) return '0'
  const sign = value > 0 ? '+' : '-'
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`
  return `${sign}${abs.toFixed(0)}`
}

function getTradeDay(dateValue: string | Date) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Invalid date'
  return date.toISOString().slice(0, 10)
}

function formatSocialUrl(url: string | null | undefined) {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (!trimmed.startsWith('http')) return `https://${trimmed}`
  return trimmed
}

function SocialLinks({ user }: { user: { id: string } }) {
  const userStore = useUserStore()
  const supabaseUser = userStore.supabaseUser

  const socialData = useMemo(() => {
    return {
      twitter: formatSocialUrl(supabaseUser?.user_metadata?.twitter_url),
      instagram: formatSocialUrl(supabaseUser?.user_metadata?.instagram_url),
      discord: formatSocialUrl(supabaseUser?.user_metadata?.discord_url),
      youtube: formatSocialUrl(supabaseUser?.user_metadata?.youtube_url),
    }
  }, [supabaseUser?.user_metadata])

  const hasAnySocial = Object.values(socialData).some(Boolean)

  if (!hasAnySocial) return null

  return (
    <div className="flex flex-wrap gap-2">
      {socialData.twitter && (
        <a
          href={socialData.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card/80 transition-colors"
        >
          <Twitter className="h-3.5 w-3.5" />
          <span>Twitter</span>
        </a>
      )}
      {socialData.instagram && (
        <a
          href={socialData.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card/80 transition-colors"
        >
          <Instagram className="h-3.5 w-3.5" />
          <span>Instagram</span>
        </a>
      )}
      {socialData.discord && (
        <a
          href={socialData.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card/80 transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Discord</span>
        </a>
      )}
      {socialData.youtube && (
        <a
          href={socialData.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card/80 transition-colors"
        >
          <Youtube className="h-3.5 w-3.5" />
          <span>YouTube</span>
        </a>
      )}
    </div>
  )
}

function getWinningStreak(values: number[]) {
  let count = 0
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index]
    if (value > 0) {
      count += 1
      continue
    }
    break
  }
  return count
}

function isDateWithinRange(value: Date, range?: DateRange) {
  const from = range?.from ? startOfDay(range.from) : undefined
  const to = range?.to ? endOfDay(range.to) : undefined
  if (from && value < from) return false
  if (to && value > to) return false
  return true
}

function formatTradeTimestamp(value: string | Date | null | undefined) {
  if (!value) return 'Unknown close time'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Unknown close time'
  return format(parsed, 'MMM d, yyyy • p')
}

function StatTile({
  label,
  value,
  helper,
  tone = 'default',
  className,
}: {
  label: string
  value: string
  helper?: string
  tone?: StatTone
  className?: string
}) {
  return (
    <div className={cn(insetPanelClassName, 'px-4 py-3.5', className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-foreground',
          tone === 'positive' && 'text-semantic-success',
          tone === 'negative' && 'text-semantic-error',
        )}
      >
        {value}
      </p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

function MeterRow({
  label,
  value,
  progress,
  fillClassName,
}: {
  label: string
  value: string
  progress: number
  fillClassName?: string
}) {
  return (
    <div className={cn(insetPanelClassName, 'px-4 py-3')}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
      </div>
      <div className="mt-2.5 h-1.5 rounded-full bg-border/25">
        <div
          className={cn(
            'h-full rounded-full bg-primary/50 transition-[width] duration-300',
            fillClassName,
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function SignalTile({
  label,
  value,
  helper,
  tone = 'default',
}: {
  label: string
  value: string
  helper?: string
  tone?: StatTone
}) {
  return (
    <div className={cn(insetPanelClassName, 'px-4 py-3')}>
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1.5 text-lg font-semibold tabular-nums tracking-tight text-foreground',
          tone === 'positive' && 'text-semantic-success',
          tone === 'negative' && 'text-semantic-error',
        )}
      >
        {value}
      </p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

function StripMetric({
  label,
  value,
  helper,
  tone = 'default',
  emphasis = false,
  className,
}: {
  label: string
  value: string
  helper?: string
  tone?: StatTone
  emphasis?: boolean
  className?: string
}) {
  return (
    <div className={cn(insetPanelClassName, 'p-3.5', className)}>
      <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1.5 font-semibold tracking-tight text-foreground',
          emphasis ? 'text-base sm:text-lg' : 'text-sm',
          tone === 'positive' && 'text-semantic-success',
          tone === 'negative' && 'text-semantic-error',
        )}
      >
        {value}
      </p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

function ProfileVisibilityPanel({
  isOwnProfile,
  showOnLeaderboard,
  isTogglingVisibility,
  onToggle,
}: {
  isOwnProfile: boolean
  showOnLeaderboard: boolean
  isTogglingVisibility: boolean
  onToggle: () => Promise<void>
}) {
  return (
    <div
      className={cn(
        insetPanelClassName,
        'w-full rounded-xl p-3.5 sm:w-auto sm:min-w-[18rem] lg:min-w-[19rem]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Public visibility
          </p>
          <Badge
            variant={showOnLeaderboard ? 'success' : 'outline'}
            className="mt-1 inline-flex gap-1.5"
          >
            {showOnLeaderboard ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            {showOnLeaderboard ? 'Public profile' : 'Private profile'}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {showOnLeaderboard
              ? 'Visible on the public leaderboard.'
              : 'Only visible inside your workspace.'}
          </p>
        </div>

        {isOwnProfile ? (
          <Switch
            checked={showOnLeaderboard}
            onCheckedChange={() => {
              void onToggle()
            }}
            disabled={isTogglingVisibility}
            aria-label="Toggle leaderboard visibility"
          />
        ) : (
          <Badge variant="secondary" className="shrink-0">
            View only
          </Badge>
        )}
      </div>
    </div>
  )
}

export default function TraderProfilePageClient() {
  const { formattedTrades } = useDashboardStats()
  const isLoading = useDashboardIsLoading()
  const accounts = useDashboardAccountsList()
  const user = useUserStore((state) => state.user)
  const supabaseUser = useUserStore((state) => state.supabaseUser)
  const isMobile = useIsMobile()

  const [benchmark, setBenchmark] = useState<BenchmarkMetrics | null>(null)
  const [isBenchmarkLoading, setIsBenchmarkLoading] = useState(true)
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

    void getLeaderboardVisibility()
      .then((result) => {
        if (alive) setShowOnLeaderboard(result.showOnLeaderboard)
      })
      .catch(() => {
        // The switch can safely stay off if the read fails.
      })

    return () => {
      alive = false
    }
  }, [isOwnProfile])

  const handleToggleLeaderboard = async () => {
    if (isTogglingVisibility) return
    setIsTogglingVisibility(true)
    try {
      const result = await toggleLeaderboardVisibility()
      if (result.success) {
        setShowOnLeaderboard(result.showOnLeaderboard)
      }
    } catch {
      // The user can retry without losing page state.
    } finally {
      setIsTogglingVisibility(false)
    }
  }

  useEffect(() => {
    let alive = true
    let timer: number | null = null

    const scheduleNext = (delayMs: number) => {
      if (!alive) return
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        void load()
      }, delayMs)
    }

    const load = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        scheduleNext(60_000)
        return
      }

      setIsBenchmarkLoading(true)
      try {
        const res = await fetch('/api/trader-profile/benchmark', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const payload = (await res.json()) as { benchmark?: BenchmarkMetrics }
        if (alive) setBenchmark(payload.benchmark ?? null)
      } catch (error) {
        console.error('[TraderProfile] failed to fetch benchmark', error)
        if (alive) setBenchmark(null)
      } finally {
        if (alive) setIsBenchmarkLoading(false)
        scheduleNext(60_000)
      }
    }

    const onVisibilityChange = () => {
      if (!alive) return
      if (document.visibilityState === 'visible') {
        void load()
      }
    }

    void load()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      alive = false
      if (timer) window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const profileName = useMemo(() => {
    return (
      supabaseUser?.user_metadata?.full_name ||
      supabaseUser?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      supabaseUser?.email?.split('@')[0] ||
      'Trader'
    )
  }, [
    supabaseUser?.email,
    supabaseUser?.user_metadata?.full_name,
    supabaseUser?.user_metadata?.name,
    user?.email,
  ])

  const profileAvatar = useMemo(() => {
    const avatar = supabaseUser?.user_metadata?.avatar_url
    return typeof avatar === 'string' && avatar.length > 0 ? avatar : null
  }, [supabaseUser?.user_metadata?.avatar_url])

  const profileInitials = useMemo(() => {
    const parts = profileName
      .split(' ')
      .map((value: string) => value.trim())
      .filter(Boolean)
      .slice(0, 2)

    if (parts.length === 0) return 'TR'
    return parts.map((part: string) => part[0]?.toUpperCase() ?? '').join('') || 'TR'
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

    return trades.filter((trade) => {
      const entry = new Date(trade.entryDate)
      if (Number.isNaN(entry.getTime())) return false
      if (from && entry < from) return false
      if (to && entry > to) return false
      return true
    })
  }, [activeDateRange, formattedTrades])

  const dateFilterLabel = useMemo(() => {
    if (dateFilterPreset !== 'custom') return null
    if (customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, 'MMM d, yyyy')} - ${format(customDateRange.to, 'MMM d, yyyy')}`
    }
    if (customDateRange?.from) {
      return format(customDateRange.from, 'MMM d, yyyy')
    }
    return 'Pick date range'
  }, [customDateRange, dateFilterPreset])

  const metrics = useMemo<TraderMetrics>(() => {
    const trades = filteredTrades || []
    const sorted = [...trades].sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
    )
    const pnlValues = sorted.map((trade) => Number(trade.pnl || 0))
    const netValues = sorted.map((trade) => Number(trade.pnl || 0) - Number(trade.commission || 0))
    const wins = pnlValues.filter((value) => value > 0)
    const losses = pnlValues.filter((value) => value < 0)
    const sumGain = wins.reduce((acc, value) => acc + value, 0)
    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
    const avgLossAbs =
      losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0
    const decisiveTrades = wins.length + losses.length
    const winRate = decisiveTrades > 0 ? (wins.length / decisiveTrades) * 100 : 0
    const totalTrades = trades.length
    const cumulativePnl = netValues.reduce((a, b) => a + b, 0)
    const avgReturn = totalTrades > 0 ? cumulativePnl / totalTrades : 0

    let runningNet = 0
    let peakNet = 0
    let maxDrawdown = 0
    for (const net of netValues) {
      runningNet += net
      peakNet = Math.max(peakNet, runningNet)
      maxDrawdown = Math.max(maxDrawdown, peakNet - runningNet)
    }

    const dayPnl = new Map<string, number>()
    sorted.forEach((trade) => {
      const key = getTradeDay(trade.entryDate)
      const prev = dayPnl.get(key) ?? 0
      dayPnl.set(key, prev + Number(trade.pnl || 0))
    })
    const activeDays = [...dayPnl.values()]
    const positiveDays = activeDays.filter((value) => value > 0).length
    const consistencyRate = activeDays.length > 0 ? (positiveDays / activeDays.length) * 100 : 0
    const winningStreak = getWinningStreak(pnlValues)
    const breakEvenRate = avgWin + avgLossAbs > 0 ? (avgLossAbs / (avgWin + avgLossAbs)) * 100 : 0

    return {
      riskReward: avgLossAbs > 0 ? avgWin / avgLossAbs : 0,
      drawdown: maxDrawdown,
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
    const baseline = benchmark ?? {
      riskReward: 0,
      drawdown: 0,
      winRate: 0,
      avgReturn: 0,
      sampleSize: 0,
    }
    const totalTradeBaseline = Math.max(20, baseline.sampleSize)

    return [
      {
        metric: 'TOTAL TRADES',
        trader: scoreHigherBetter(metrics.totalTrades, totalTradeBaseline),
      },
      { metric: 'RISK REWARD', trader: scoreHigherBetter(metrics.riskReward, baseline.riskReward) },
      { metric: 'AVG. DRAWDOWN', trader: scoreLowerBetter(metrics.drawdown, baseline.drawdown) },
      { metric: 'WIN RATE', trader: scoreHigherBetter(metrics.winRate, baseline.winRate) },
      { metric: 'AVG RETURN', trader: scoreSigned(metrics.avgReturn, baseline.avgReturn) },
    ]
  }, [
    benchmark,
    metrics.avgReturn,
    metrics.drawdown,
    metrics.riskReward,
    metrics.totalTrades,
    metrics.winRate,
  ])

  const closedTrades = useMemo(() => {
    return [...(filteredTrades || [])]
      .filter((trade) => {
        const closeDate = (trade as { closeDate?: string | Date | null }).closeDate
        if (!closeDate) return false
        const parsed = new Date(closeDate)
        return !Number.isNaN(parsed.getTime())
      })
      .sort((a, b) => {
        const closeA = new Date(
          (a as { closeDate?: string | Date | null }).closeDate as string | Date,
        ).getTime()
        const closeB = new Date(
          (b as { closeDate?: string | Date | null }).closeDate as string | Date,
        ).getTime()
        return closeB - closeA
      })
  }, [filteredTrades])

  const tradesPerPage = 5
  const tradeFeedTotalPages = Math.max(1, Math.ceil(closedTrades.length / tradesPerPage))

  const paginatedClosedTrades = useMemo(() => {
    const start = (tradeFeedPage - 1) * tradesPerPage
    return closedTrades.slice(start, start + tradesPerPage)
  }, [closedTrades, tradeFeedPage])

  const totalWithdrawAllAccounts = useMemo(() => {
    return (accounts || []).reduce((accountSum, account) => {
      const accountWithdraw = (account.payouts || [])
        .filter((payout) => {
          if (payout.status !== 'PAID') return false
          const payoutDate = new Date(payout.date)
          if (Number.isNaN(payoutDate.getTime())) return false
          return isDateWithinRange(payoutDate, activeDateRange)
        })
        .reduce((withdrawSum, payout) => withdrawSum + Number(payout.amount || 0), 0)
      return accountSum + accountWithdraw
    }, 0)
  }, [accounts, activeDateRange])

  const totalCapitalAllAccounts = useMemo(() => {
    const openingCapital = (accounts || []).reduce(
      (sum, account) => sum + Number(account.startingBalance || 0),
      0,
    )
    const filteredTradingPnl = (filteredTrades || []).reduce(
      (sum, trade) => sum + Number(trade.pnl || 0) - Number(trade.commission || 0),
      0,
    )
    return openingCapital + filteredTradingPnl - totalWithdrawAllAccounts
  }, [accounts, filteredTrades, totalWithdrawAllAccounts])

  const activeAccountsCount = useMemo(() => {
    return (accounts || []).filter((account) => Boolean(account.number)).length
  }, [accounts])

  const activeAccountLabels = useMemo(() => {
    return (accounts || [])
      .map((account) =>
        typeof account.number === 'string' ? account.number.trim() : String(account.number || ''),
      )
      .filter((value) => value.length > 0)
      .slice(0, 8)
  }, [accounts])

  const tradeCalendarDays = useMemo(() => {
    const byDay = new Map<string, Date>()
    ;(filteredTrades || []).forEach((trade) => {
      const date = new Date(trade.entryDate)
      if (Number.isNaN(date.getTime())) return
      const key = date.toISOString().slice(0, 10)
      if (!byDay.has(key))
        byDay.set(key, new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    })

    return Array.from(byDay.values()).sort((a, b) => a.getTime() - b.getTime())
  }, [filteredTrades])

  const tradePnlByDay = useMemo(() => {
    const map = new Map<string, number>()
    ;(filteredTrades || []).forEach((trade) => {
      const date = new Date(trade.entryDate)
      if (Number.isNaN(date.getTime())) return
      const key = date.toISOString().slice(0, 10)
      const prev = map.get(key) ?? 0
      const net = Number(trade.pnl || 0) - Number(trade.commission || 0)
      map.set(key, prev + net)
    })
    return map
  }, [filteredTrades])

  const positivePnlDays = useMemo(() => {
    return tradeCalendarDays.filter((day) => {
      const key = day.toISOString().slice(0, 10)
      return (tradePnlByDay.get(key) ?? 0) > 0
    })
  }, [tradeCalendarDays, tradePnlByDay])

  const negativePnlDays = useMemo(() => {
    return tradeCalendarDays.filter((day) => {
      const key = day.toISOString().slice(0, 10)
      return (tradePnlByDay.get(key) ?? 0) < 0
    })
  }, [tradeCalendarDays, tradePnlByDay])

  const latestTradeDay =
    tradeCalendarDays.length > 0 ? tradeCalendarDays[tradeCalendarDays.length - 1] : undefined
  const winRateGuidePercent = Math.min(30, Math.max(25, 100 - metrics.winRate))

  const selectedPnl = useMemo(() => {
    const target = selectedCalendarDay ?? latestTradeDay
    if (!target) return 0
    const key = target.toISOString().slice(0, 10)
    return tradePnlByDay.get(key) ?? 0
  }, [latestTradeDay, selectedCalendarDay, tradePnlByDay])

  const selectedDayLabel = useMemo(() => {
    if (selectedCalendarDay) return format(selectedCalendarDay, 'EEE, MMM d')
    if (latestTradeDay) return format(latestTradeDay, 'EEE, MMM d')
    return 'No active session'
  }, [latestTradeDay, selectedCalendarDay])

  const reviewWindowSummary = useMemo(() => {
    if (activeDateRange?.from && activeDateRange?.to) {
      return `${format(activeDateRange.from, 'MMM d, yyyy')} - ${format(activeDateRange.to, 'MMM d, yyyy')}`
    }
    if (activeDateRange?.from) return format(activeDateRange.from, 'MMM d, yyyy')
    return 'All available trades'
  }, [activeDateRange])

  const tradeFeedSummary = useMemo(() => {
    if (closedTrades.length === 0) return '0 of 0'
    const start = (tradeFeedPage - 1) * tradesPerPage + 1
    const end = Math.min(tradeFeedPage * tradesPerPage, closedTrades.length)
    return `${start}-${end} of ${closedTrades.length}`
  }, [closedTrades.length, tradeFeedPage])

  const primaryStripMetrics: Array<{ label: string; value: string; tone?: StatTone }> = [
    {
      label: 'Net PnL',
      value: formatSigned(metrics.netPnl),
      tone:
        metrics.netPnl > 0 ? 'positive' : metrics.netPnl < 0 ? 'negative' : ('default' as const),
    },
    {
      label: 'Avg net / trade',
      value: formatSigned(metrics.avgReturn),
      tone:
        metrics.avgReturn > 0
          ? 'positive'
          : metrics.avgReturn < 0
            ? 'negative'
            : ('default' as const),
    },
    {
      label: 'Consistency',
      value: `${formatValue(metrics.consistencyRate)}%`,
      tone: metrics.consistencyRate >= 50 ? ('positive' as const) : ('default' as const),
    },
  ]

  const secondaryStripMetrics: Array<{ label: string; value: string; tone?: StatTone }> = [
    {
      label: 'Break-even rate',
      value: `${formatValue(metrics.breakEvenRate)}%`,
    },
    {
      label: 'Active accounts',
      value: String(activeAccountsCount),
    },
    {
      label: 'Total trades',
      value: String(metrics.totalTrades),
    },
    {
      label: 'Current streak',
      value: metrics.winningStreak > 0 ? `${metrics.winningStreak} wins` : 'Reset',
      tone: metrics.winningStreak > 0 ? ('positive' as const) : ('default' as const),
    },
  ]

  useEffect(() => {
    const hasSelection = Boolean(selectedCalendarDay)
    const selectionInRange = selectedCalendarDay
      ? isDateWithinRange(selectedCalendarDay, activeDateRange)
      : false

    if ((!hasSelection || !selectionInRange) && latestTradeDay) {
      setSelectedCalendarDay(latestTradeDay)
    }
  }, [activeDateRange, latestTradeDay, selectedCalendarDay])

  useEffect(() => {
    setTradeFeedPage(1)
  }, [dateFilterPreset, customDateRange?.from, customDateRange?.to, closedTrades.length])

  return (
    <UnifiedPageShell density="compact" widthClassName="max-w-[1720px]">
      <div className="animate-page-enter space-y-4 sm:space-y-5">
        <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.92fr)] xl:gap-5">
          <section className="min-w-0 space-y-3.5 sm:space-y-4">
            <UnifiedSurface
              variant="elevated"
              className="animate-fade-up-smooth overflow-hidden p-5 sm:p-6 lg:p-[1.75rem]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                  <Avatar className="h-20 w-20 shrink-0 rounded-3xl border border-border/40 bg-background/70 sm:h-24 sm:w-24">
                    <AvatarImage src={profileAvatar ?? undefined} alt={`${profileName} avatar`} />
                    <AvatarFallback className="bg-background text-lg font-semibold text-foreground">
                      {profileInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        Trader Profile
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h2 className="truncate text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        {profileName}
                      </h2>

                      <p className="max-w-2xl text-sm text-muted-foreground sm:text-[0.95rem]">
                        Performance board for reviewing consistency, session rhythm, and active
                        account health in one place.
                      </p>
                    </div>
                  </div>
                </div>

                <ProfileVisibilityPanel
                  isOwnProfile={isOwnProfile}
                  showOnLeaderboard={showOnLeaderboard}
                  isTogglingVisibility={isTogglingVisibility}
                  onToggle={handleToggleLeaderboard}
                />
              </div>
            </UnifiedSurface>

            <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d1 p-4 sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)]">
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    {primaryStripMetrics.map((metric) => (
                      <StripMetric
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                        tone={metric.tone}
                        emphasis
                        className="h-full"
                      />
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {secondaryStripMetrics.map((metric) => (
                      <StripMetric
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                        tone={metric.tone}
                        className="h-full"
                      />
                    ))}
                  </div>
                </div>

                <div className={cn(insetPanelClassName, 'p-4 sm:p-4')}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Review controls
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {reviewWindowSummary}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/20 bg-background/45 p-3.5">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Active session
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {selectedDayLabel}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <Select
                        value={dateFilterPreset}
                        onValueChange={(value: DateFilterPreset) => setDateFilterPreset(value)}
                      >
                        <SelectTrigger className="h-10 w-full border-border/35 bg-background/70 text-sm text-foreground">
                          <SelectValue placeholder="Select range" />
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

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 justify-start border-border/35 bg-background/70 text-sm text-foreground hover:bg-background/85"
                          >
                            <CalendarIcon className="h-4 w-4" />
                            {dateFilterLabel ?? 'Custom Range'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="start">
                          <Calendar
                            mode="range"
                            selected={customDateRange}
                            onSelect={setCustomDateRange}
                            numberOfMonths={isMobile ? 1 : 2}
                            className="p-0"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            </UnifiedSurface>

            <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d2 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Active accounts
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Linked accounts contributing to the selected review window.
                  </p>
                </div>
                <Badge variant="secondary">{activeAccountsCount} active</Badge>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.92fr)]">
                <div className={cn(insetPanelClassName, 'p-4 sm:p-5')}>
                  {activeAccountLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeAccountLabels.map((accountLabel) => (
                        <span
                          key={accountLabel}
                          className="rounded-full border border-border/35 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground"
                        >
                          {accountLabel}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className={cn(insetPanelClassName, 'p-4 text-sm text-muted-foreground')}>
                      No linked accounts yet.
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
                  <SignalTile
                    label="Total capital"
                    value={formatCapitalCompact(totalCapitalAllAccounts)}
                    tone={totalCapitalAllAccounts >= 0 ? 'positive' : 'negative'}
                  />
                  <SignalTile
                    label="Total withdraw"
                    value={formatCapitalCompact(totalWithdrawAllAccounts)}
                  />
                  <SignalTile
                    label="Active days"
                    value={String(tradeCalendarDays.length)}
                    tone={tradeCalendarDays.length > 0 ? 'positive' : 'default'}
                  />
                </div>
              </div>
            </UnifiedSurface>

            <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d3 overflow-hidden p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Daily session pattern
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Review day-by-day trading rhythm and the currently selected session result.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                  <StatTile label="Selected day" value={selectedDayLabel} className="p-3" />
                  <StatTile
                    label="Selected PnL"
                    value={formatSigned(selectedPnl)}
                    tone={selectedPnl >= 0 ? 'positive' : 'negative'}
                    className="p-3"
                  />
                </div>
              </div>

              <div
                className={cn(
                  insetPanelClassName,
                  'mt-4 min-h-[30rem] overflow-x-auto p-2 sm:p-3 lg:min-h-[36rem]',
                )}
              >
                <Calendar
                  mode="single"
                  selected={selectedCalendarDay ?? latestTradeDay}
                  onSelect={setSelectedCalendarDay}
                  defaultMonth={selectedCalendarDay ?? latestTradeDay}
                  modifiers={{
                    positive: positivePnlDays,
                    negative: negativePnlDays,
                  }}
                  modifiersClassNames={{
                    positive: 'bg-semantic-success-bg/20 text-semantic-success',
                    negative: 'bg-semantic-error-bg text-semantic-error',
                  }}
                  className="w-full min-w-[19rem] p-0"
                  classNames={{
                    months: 'flex min-h-[26rem] flex-col gap-4 lg:min-h-[31rem]',
                    month: 'space-y-4',
                    weekday:
                      'w-11 text-center text-[0.75rem] font-medium text-muted-foreground sm:w-12',
                    day: 'relative h-11 w-11 overflow-hidden rounded-lg p-0 text-center align-middle sm:h-12 sm:w-12',
                    day_button:
                      'h-11 w-11 rounded-lg p-0 font-normal text-foreground transition-[background-color,border-color,color] hover:bg-background/90 aria-selected:bg-primary/12 aria-selected:text-foreground sm:h-12 sm:w-12',
                  }}
                  components={{
                    DayButton: ({ day, className, ...buttonProps }: DayButtonProps) => {
                      const date = day.date
                      const displayMonth = day.displayMonth

                      if (date.getMonth() !== displayMonth.getMonth()) {
                        return (
                          <button type="button" {...buttonProps} className={className}>
                            <span className="text-[11px] text-muted-foreground">
                              {format(date, 'd')}
                            </span>
                          </button>
                        )
                      }

                      const key = date.toISOString().slice(0, 10)
                      const pnl = tradePnlByDay.get(key) ?? 0
                      const hasTrade = tradePnlByDay.has(key)
                      const tint =
                        pnl > 0
                          ? 'text-semantic-success'
                          : pnl < 0
                            ? 'text-semantic-error'
                            : hasTrade
                              ? 'text-foreground'
                              : 'text-muted-foreground'

                      return (
                        <button type="button" {...buttonProps} className={className}>
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                            <span className="text-[11px] leading-none">{format(date, 'd')}</span>
                            <span className={`text-[10px] font-semibold leading-none ${tint}`}>
                              {hasTrade ? formatPnlCell(pnl) : ''}
                            </span>
                          </div>
                        </button>
                      )
                    },
                  }}
                />

                <div className="mt-4 flex flex-wrap items-center gap-3 px-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-semantic-success-bg/50" />
                    Profit day
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-semantic-error-border" />
                    Loss day
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary/30" />
                    No trades
                  </span>
                </div>
              </div>
            </UnifiedSurface>
          </section>

          <UnifiedPerformanceDashboard
              metrics={metrics}
              benchmark={benchmark}
              totalCapitalAllAccounts={totalCapitalAllAccounts}
              totalWithdrawAllAccounts={totalWithdrawAllAccounts}
              primaryStripMetrics={primaryStripMetrics}
              secondaryStripMetrics={secondaryStripMetrics}
            >
            <UnifiedSurface
              variant="elevated"
              className="animate-fade-up-smooth animate-fade-up-smooth-d1 p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Benchmark
                </p>
                <Badge variant={isBenchmarkLoading ? 'outline' : 'success'}>
                  {isBenchmarkLoading ? 'Refreshing' : 'Live'}
                </Badge>
              </div>

              <div className={cn(insetPanelClassName, 'mt-5 p-3')}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border) / 0.45)" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{
                          fill: 'hsl(var(--muted-foreground))',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      />
                      <Radar
                        dataKey="trader"
                        stroke="hsl(var(--foreground) / 0.85)"
                        fill="hsl(var(--foreground) / 0.2)"
                        fillOpacity={1}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {benchmark?.sampleSize
                  ? `${benchmark.sampleSize} traders in sample`
                  : 'Loading benchmark data...'}
              </p>
            </UnifiedSurface>

            <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d2 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Capital snapshot
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <StatTile
                  label="Total capital"
                  value={formatCapitalCompact(totalCapitalAllAccounts)}
                />
                <StatTile
                  label="Total withdraw"
                  value={formatCapitalCompact(totalWithdrawAllAccounts)}
                />
                <StatTile
                  label="Avg net / trade"
                  value={formatSigned(metrics.avgReturn)}
                  tone={
                    metrics.avgReturn > 0
                      ? 'positive'
                      : metrics.avgReturn < 0
                        ? 'negative'
                        : 'default'
                  }
                />
                <StatTile label="Risk reward" value={formatValue(metrics.riskReward)} />
              </div>

              <div className="mt-4">
                <MeterRow
                  label="Consistency"
                  value={`${formatValue(metrics.consistencyRate)}%`}
                  progress={Math.min(100, Math.max(10, metrics.consistencyRate))}
                  fillClassName="bg-semantic-success/60"
                />
              </div>
            </UnifiedSurface>

            <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d3 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Execution quality
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <StatTile
                  label="Max drawdown"
                  value={formatValue(metrics.drawdown)}
                  tone={metrics.drawdown > 0 ? 'negative' : 'default'}
                />
                <StatTile
                  label="Win rate"
                  value={`${formatValue(metrics.winRate)}%`}
                  tone={metrics.winRate >= 50 ? 'positive' : 'default'}
                />
                <StatTile
                  label="Break-even rate"
                  value={`${formatValue(metrics.breakEvenRate)}%`}
                />
                <StatTile
                  label="Gross wins"
                  value={formatCapitalCompact(metrics.sumGain)}
                  tone={metrics.sumGain > 0 ? 'positive' : 'default'}
                />
              </div>

              <div className="mt-4 space-y-3">
                <MeterRow
                  label="Win rate balance"
                  value={`${formatValue(metrics.winRate)}%`}
                  progress={Math.min(100, Math.max(8, metrics.winRate))}
                />
                <MeterRow
                  label="Trade volume"
                  value={`${metrics.totalTrades} trades`}
                  progress={Math.min(100, Math.max(8, metrics.totalTrades))}
                  fillClassName="bg-primary/45"
                />
                <MeterRow
                  label="Guide cushion"
                  value={`${formatValue(winRateGuidePercent)}%`}
                  progress={winRateGuidePercent}
                  fillClassName="bg-primary/30"
                />
              </div>
            </UnifiedSurface>
            </UnifiedPerformanceDashboard>
        </div>


        {/* ---- Comprehensive Dashboard View ---- */}
        <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d2 p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Performance dashboard
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-4">
            {/* Primary Metrics Row */}
            <div className="lg:col-span-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {primaryStripMetrics.map((metric) => (
                <StripMetric
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  tone={metric.tone}
                  emphasis
                  className="h-full"
                />
              ))}
            </div>

            {/* Capital & Accounts Row */}
            <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatTile
                label="Total capital"
                value={formatCapitalCompact(totalCapitalAllAccounts)}
                tone={totalCapitalAllAccounts >= 0 ? 'positive' : 'negative'}
              />
              <StatTile
                label="Total withdraw"
                value={formatCapitalCompact(totalWithdrawAllAccounts)}
              />
              <StatTile
                label="Avg net / trade"
                value={formatSigned(metrics.avgReturn)}
                tone={
                  metrics.avgReturn > 0
                    ? 'positive'
                    : metrics.avgReturn < 0
                      ? 'negative'
                      : 'default'
                }
              />
              <StatTile label="Risk reward" value={formatValue(metrics.riskReward)} />
            </div>

            {/* Execution Quality Row */}
            <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
              <StatTile
                label="Max drawdown"
                value={formatValue(metrics.drawdown)}
                tone={metrics.drawdown > 0 ? 'negative' : 'default'}
              />
              <StatTile
                label="Win rate"
                value={`${formatValue(metrics.winRate)}%`}
                tone={metrics.winRate >= 50 ? 'positive' : 'default'}
              />
              <StatTile
                label="Break-even rate"
                value={`${formatValue(metrics.breakEvenRate)}%`}
              />
              <StatTile
                label="Gross wins"
                value={formatCapitalCompact(metrics.sumGain)}
                tone={metrics.sumGain > 0 ? 'positive' : 'default'}
              />
            </div>

            {/* Secondary Metrics Row */}
            <div className="lg:col-span-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SignalTile
                label="Active days"
                value={String(tradeCalendarDays.length)}
                tone={tradeCalendarDays.length > 0 ? 'positive' : 'default'}
              />
              <SignalTile
                label="Total trades"
                value={String(metrics.totalTrades)}
              />
              <SignalTile
                label="Current streak"
                value={metrics.winningStreak > 0 ? `${metrics.winningStreak} wins` : 'Reset'}
                tone={metrics.winningStreak > 0 ? 'positive' : 'default'}
              />
              <SignalTile
                label="Active accounts"
                value={String(activeAccountsCount)}
                tone={activeAccountsCount > 0 ? 'positive' : 'default'}
              />
            </div>

            {/* Account Labels */}
            <div className="lg:col-span-4">
              <div className={cn(insetPanelClassName, 'p-4')}>
                {activeAccountLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeAccountLabels.map((accountLabel) => (
                      <span
                        key={accountLabel}
                        className="rounded-full border border-border/30 bg-card/50 px-3 py-1.5 text-xs font-medium tabular-nums text-foreground"
                      >
                        {accountLabel}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No linked accounts yet.
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="lg:col-span-2 grid gap-3">
              <MeterRow
                label="Consistency"
                value={`${formatValue(metrics.consistencyRate)}%`}
                progress={Math.min(100, Math.max(10, metrics.consistencyRate))}
                fillClassName="bg-semantic-success/60"
              />
              <MeterRow
                label="Win rate balance"
                value={`${formatValue(metrics.winRate)}%`}
                progress={Math.min(100, Math.max(8, metrics.winRate))}
              />
            </div>

            <div className="lg:col-span-2 grid gap-3">
              <MeterRow
                label="Trade volume"
                value={`${metrics.totalTrades} trades`}
                progress={Math.min(100, Math.max(8, metrics.totalTrades))}
                fillClassName="bg-primary/45"
              />
              <MeterRow
                label="Guide cushion"
                value={`${formatValue(winRateGuidePercent)}%`}
                progress={winRateGuidePercent}
                fillClassName="bg-primary/30"
              />
            </div>
          </div>
        </UnifiedSurface>

        {/* ---- User Name Divider ---- */}
        <div className="animate-fade-up-smooth animate-fade-up-smooth-d3 flex items-center gap-4">
          <div className="h-px flex-1 bg-border/40" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {profileName}
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>

        {/* ---- Daily Session Pattern ---- */}
        <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d3 overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Daily session pattern
              </p>
              <p className="text-sm text-muted-foreground">
                Review day-by-day trading rhythm and session results.
              </p>
            </div>

            <div className="flex gap-3">
              <div
                className={cn(
                  insetPanelClassName,
                  'rounded-xl px-4 py-3',
                  metrics.netPnl >= 0 ? 'border-semantic-success/30 bg-semantic-success/5' : 'border-semantic-error/30 bg-semantic-error/5',
                )}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  Selected day
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {selectedDayLabel}
                </p>
              </div>

              <div
                className={cn(
                  insetPanelClassName,
                  'rounded-xl px-4 py-3',
                  selectedPnl >= 0 ? 'border-semantic-success/30 bg-semantic-success/5' : 'border-semantic-error/30 bg-semantic-error/5',
                )}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  Selected PnL
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {formatSigned(selectedPnl)}
                </p>
              </div>

              <div
                className={cn(
                  insetPanelClassName,
                  'rounded-xl px-4 py-3',
                  totalWithdrawAllAccounts >= 0 ? 'border-semantic-success/30 bg-semantic-success/5' : 'border-semantic-error/30 bg-semantic-error/5',
                )}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  Session PnL
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {formatSigned(totalWithdrawAllAccounts)}
                </p>
              </div>

              <div className={cn(insetPanelClassName, 'rounded-xl px-3 py-3')}>
                <Select
                  value={dateFilterPreset}
                  onValueChange={(value: DateFilterPreset) => setDateFilterPreset(value)}
                >
                  <SelectTrigger className="h-full w-[140px] border-border/30 bg-card/40 text-xs text-foreground">
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
              </div>
            </div>
          </div>

          <div
            className={cn(
              insetPanelClassName,
              'mt-4 min-h-[30rem] overflow-x-auto p-2 sm:p-3 lg:min-h-[36rem]',
            )}
          >
            <CalendarWidget
              selectedDay={selectedCalendarDay}
              latestTradeDay={latestTradeDay}
              onSelectDay={setSelectedCalendarDay}
              positivePnlDays={positivePnlDays}
              negativePnlDays={negativePnlDays}
              tradePnlByDay={tradePnlByDay}
            />

            <div className="mt-4 flex flex-wrap items-center gap-4 px-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-semantic-success/40" />
                Profit day
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-semantic-error/40" />
                Loss day
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                No trades
              </span>
            </div>
          </div>
        </UnifiedSurface>

        {/* ---- Benchmark Radar ---- */}
        <Suspense
          fallback={
            <UnifiedSurface variant="elevated" className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="h-3 w-20 animate-pulse rounded-lg bg-muted/30" />
                <div className="h-5 w-14 animate-pulse rounded-md bg-muted/30" />
              </div>
              <div className={cn(insetPanelClassName, 'mt-5 p-3')}>
                <div className="h-64 w-full animate-pulse rounded-lg bg-muted/30" />
              </div>
              <div className="mt-3 h-3 w-36 animate-pulse rounded bg-muted/30" />
            </UnifiedSurface>
          }
        >
          <UnifiedSurface
            variant="elevated"
            className="animate-fade-up-smooth animate-fade-up-smooth-d1 p-5 sm:p-6"
          >
            <RadarChartCard
              radarData={radarData}
              isBenchmarkLoading={isBenchmarkLoading}
              benchmarkSampleSize={benchmark?.sampleSize}
            />
          </UnifiedSurface>
        </Suspense>

        {/* ---- Trade History ---- */}
        <Suspense fallback={<TableSkeleton />}>
          <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d5 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Trade history
              </p>
              <Badge variant="secondary">{tradeFeedSummary}</Badge>
            </div>

            {isLoading ? (
              <div className="mt-5 space-y-2">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={cn(
                      insetPanelClassName,
                      'flex items-center justify-between gap-3 px-4 py-3 animate-pulse',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-muted/30" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-24 rounded bg-muted/30" />
                        <div className="h-2.5 w-36 rounded bg-muted/20" />
                      </div>
                    </div>
                    <div className="h-3 w-14 rounded bg-muted/30" />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-5 space-y-2">
              {paginatedClosedTrades.length === 0 ? (
                <div className={cn(insetPanelClassName, 'px-4 py-5 text-sm text-muted-foreground')}>
                  No closed trades in the current range yet.
                </div>
              ) : (
                paginatedClosedTrades.map((trade) => {
                  const pnl = Number(trade.pnl || 0)
                  const closeDate = (trade as { closeDate?: string | Date | null }).closeDate

                  return (
                    <div
                      key={trade.id}
                      className={cn(
                        insetPanelClassName,
                        'flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
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
                          <p className="truncate text-sm font-medium text-foreground">
                            {trade.instrument || 'Unknown instrument'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Closed {formatTradeTimestamp(closeDate ?? trade.entryDate)}
                          </p>
                        </div>
                      </div>

                      <p
                        className={cn(
                          'shrink-0 text-sm font-semibold tabular-nums',
                          pnl >= 0 ? 'text-semantic-success' : 'text-semantic-error',
                        )}
                      >
                        {formatSigned(pnl)}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

            {closedTrades.length > tradesPerPage ? (
              <div className={cn(insetPanelClassName, 'mt-4 px-3 py-2')}>
                <Pagination className="justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          setTradeFeedPage((current) => Math.max(1, current - 1))
                        }}
                        className={tradeFeedPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive size="default" className="min-w-24">
                        {tradeFeedPage} / {tradeFeedTotalPages}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          setTradeFeedPage((current) => Math.min(tradeFeedTotalPages, current + 1))
                        }}
                        className={
                          tradeFeedPage >= tradeFeedTotalPages ? 'pointer-events-none opacity-50' : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : null}
          </UnifiedSurface>
        </Suspense>
      </div>
    </UnifiedPageShell>
  )
}
