'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  Globe,
  Lock,
  Sparkles,
  Zap,
  Building2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CalendarGrid } from './calendar-grid'
import { TradeActivityFeed } from './trade-activity-feed'
import {
  unifiedChipClassName,
  unifiedGhostActionClassName,
  unifiedStatePanelClassName,
} from '@/components/layout/unified-page-recipes'
import RadarChartCard from '../../../dashboard/trader-profile/components/RadarChartCard'
import type { PublicTraderSnapshot, PublicTraderMetrics } from '@/server/public-trader'

const insetPanelClassName = 'rounded-xl border-0 bg-card/95 shadow-sm'

type StatTone = 'default' | 'positive' | 'negative'

function fv(v: number, d = 2) {
  return Number.isFinite(v) ? v.toFixed(d) : '0.00'
}
function fs(v: number, d = 2) {
  return Number.isFinite(v) ? `${v >= 0 ? '+' : ''}${v.toFixed(d)}` : '0.00'
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
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
      <div className="mt-2 h-1.5 rounded-full bg-transparent/20">
        <div
          className="h-full rounded-full bg-primary/50 transition-[width] duration-300"
          style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
        />
      </div>
    </div>
  )
}

function computeRadarData(metrics: PublicTraderMetrics) {
  const { totalTrades, riskReward, winRate } = metrics
  return [
    { metric: 'TOTAL TRADES', trader: Math.min(100, (totalTrades / 3)) },
    { metric: 'RISK REWARD', trader: Math.min(100, (riskReward / 3) * 100) },
    { metric: 'WIN RATE', trader: Math.min(100, (winRate / 60) * 100) },
  ]
}

interface TraderProfileClientProps {
  initialSnapshot: PublicTraderSnapshot | null
  locale: string
  slug: string
}

export default function TraderProfileClient({
  initialSnapshot,
  locale,
  slug,
}: TraderProfileClientProps) {
  const [snapshot, setSnapshot] = useState<PublicTraderSnapshot | null>(initialSnapshot)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    try {
      const { getPublicTraderSnapshot } = await import('@/server/public-trader')
      const data = await getPublicTraderSnapshot(slug)
      if (data) setSnapshot(data)
    } catch {
    }
  }, [slug])

  useEffect(() => {
    intervalRef.current = setInterval(refresh, 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refresh])

  const radarData = useMemo(
    () => (snapshot ? computeRadarData(snapshot.metrics) : []),
    [snapshot],
  )

  if (!snapshot) {
    return (
      <div className={cn(unifiedStatePanelClassName, 'p-8 text-center')}>
        <div className={unifiedChipClassName}>
          <Lock className="h-3.5 w-3.5" />
          Profile unavailable
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">{slug}</h1>
        <p className="mt-3 mx-auto max-w-md text-sm text-muted-foreground">
          This trader profile is not public yet or no data available.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={`/${locale}/leaderboard`} className={unifiedGhostActionClassName}>
            <ArrowLeft className="h-3.5 w-3.5" /> Leaderboard
          </a>
          <a
            href={`/${locale}/dashboard/trader-profile`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Globe className="h-3.5 w-3.5" /> Create profile
          </a>
        </div>
      </div>
    )
  }

  const { username, avatarUrl, allTrades, dayPnl, accountCount, propFirms, metrics } = snapshot
  const profileInitials = username.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-[1200px] animate-fade-up-smooth px-4 pt-28 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        {/* Profile Header */}
        <div className="mb-6 overflow-hidden rounded-3xl bg-white/90 shadow-lg dark:bg-zinc-900/90">
          <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="h-20 w-20 shrink-0 rounded-2xl sm:h-24 sm:w-24">
                <AvatarImage src={avatarUrl ?? undefined} alt={username} />
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                  {profileInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Public Trader
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3.5 w-3.5" /> Live Profile
                  </Badge>
                </div>
                <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">
                  {username}
                </h1>
                {propFirms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-muted-foreground/50" />
                    {propFirms.map((firm) => (
                      <span
                        key={firm}
                        className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground/80 dark:bg-zinc-800/30"
                      >
                        {firm}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Verified performance from Qunt Edge. Real closed trades, real execution rhythm,
                  real results.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/${locale}/leaderboard`}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/90 active:scale-[0.97] dark:bg-zinc-800/80 dark:hover:bg-zinc-800/90"
              >
                <ArrowLeft className="h-4 w-4" /> Leaderboard
              </a>
              <a
                href={`/${locale}/dashboard/trader-profile`}
                className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-all duration-200 hover:bg-foreground/90 active:scale-[0.97]"
              >
                <Globe className="h-4 w-4" /> Manage Profile
              </a>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <StatTile
            label="Net PnL"
            value={fs(metrics.netPnl, 0)}
            tone={metrics.netPnl > 0 ? 'positive' : metrics.netPnl < 0 ? 'negative' : 'default'}
          />
          <StatTile
            label="Avg net / trade"
            value={fs(metrics.avgReturn, 0)}
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
        <div className="mb-10 grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatTile label="Win Rate" value={`${fv(metrics.winRate)}%`} />
          <StatTile label="Total Trades" value={String(metrics.totalTrades)} />
          <StatTile
            label="Current Streak"
            value={metrics.winningStreak > 0 ? `${metrics.winningStreak} wins` : 'Reset'}
          />
          <StatTile
            label="Active Accounts"
            value={String(accountCount)}
          />
        </div>

        {/* Calendar + Radar grid */}
        <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-2xl bg-white/90 shadow-lg dark:bg-zinc-900/90">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 dark:bg-zinc-800/80">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                    Rhythm
                  </div>
                  <div className="text-base font-semibold tracking-tight text-foreground">
                    Trading Calendar
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="overflow-x-auto">
                <div className="min-w-[340px]">
                  <CalendarGrid
                    dayPnl={
                      new Map(
                        Object.entries(dayPnl).map(([k, v]) => [k, v]),
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 p-5 shadow-lg dark:bg-zinc-900/90 sm:p-6">
            <RadarChartCard
              radarData={radarData}
              isBenchmarkLoading={false}
              benchmarkSampleSize={undefined}
            />
            <div className="mt-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Execution Quality
              </p>
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  label="Max DD"
                  value={fv(metrics.drawdown, 0)}
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
          </div>
        </div>

        {/* Activity */}
        <TradeActivityFeed
          trades={allTrades.map((t) => ({
            id: t.id,
            symbol: t.instrument || 'Unknown',
            pnl: t.pnl,
            closeTime: t.closeDate,
          }))}
        />
      </div>
    </div>
  )
}
