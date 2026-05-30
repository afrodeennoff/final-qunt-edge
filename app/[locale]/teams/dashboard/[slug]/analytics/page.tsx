'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, BarChart3, RefreshCw, Target, TrendingUp, Zap } from 'lucide-react'
import {
  unifiedInsetPanelClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStatCard } from '@/components/ui/dashboard-stat-card'
import { cn } from '@/lib/utils'
import { getTeamAnalyticsDataAction } from '../../../actions/analytics'
import { Skeleton } from '@/components/ui/skeleton'

type TeamMemberPerformance = {
  userId: string
  email: string
  totalPnL: number
  winRate: number
  totalTrades: number
}

type TeamChartPoint = {
  date: string
  dailyPnL: number
  cumulativePnL: number
}

type TeamAnalytics = {
  winRate?: number
  totalTrades?: number
  profitFactor?: number
  totalPnL?: number
}

type AnalyticsData = {
  analytics: TeamAnalytics
  membersPerformance: TeamMemberPerformance[]
  chartData: TeamChartPoint[]
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    'toNumber' in value &&
    typeof (value as { toNumber?: unknown }).toNumber === 'function'
  ) {
    return ((value as { toNumber: () => number }).toNumber?.() ?? 0)
  }
  return 0
}

function normalizeAnalyticsData(raw: unknown): AnalyticsData {
  const data = (raw as {
    analytics?: {
      winRate?: unknown
      totalTrades?: unknown
      profitFactor?: unknown
      totalPnl?: unknown
    }
    membersPerformance?: Array<{
      userId: string
      email: string
      totalPnL: unknown
      winRate: unknown
      totalTrades: unknown
    }>
    chartData?: Array<{
      date: string
      dailyPnL: unknown
      cumulativePnL: unknown
    }>
  }) ?? {}

  return {
    analytics: {
      winRate: toNumber(data.analytics?.winRate),
      totalTrades: toNumber(data.analytics?.totalTrades),
      profitFactor: toNumber(data.analytics?.profitFactor),
      totalPnL: toNumber(data.analytics?.totalPnl),
    },
    membersPerformance: (data.membersPerformance ?? []).map((member) => ({
      userId: member.userId,
      email: member.email,
      totalPnL: toNumber(member.totalPnL),
      winRate: toNumber(member.winRate),
      totalTrades: toNumber(member.totalTrades),
    })),
    chartData: (data.chartData ?? []).map((point) => ({
      date: point.date,
      dailyPnL: toNumber(point.dailyPnL),
      cumulativePnL: toNumber(point.cumulativePnL),
    })),
  }
}

function formatCurrency(value: number): string {
  return `${value >= 0 ? '+' : '-'}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length || !label) {
    return null
  }

  const value = payload[0]?.value ?? 0

  return (
    <div className={cn(unifiedInsetPanelClassName, 'p-3')}>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
        {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <p className={cn('mt-1 text-sm font-black', value >= 0 ? 'text-primary' : 'text-destructive')}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}

export default function TeamAnalyticsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      if (!slug) {
        return
      }

      setLoading(true)
      setError(null)
      try {
        const result = await getTeamAnalyticsDataAction(slug)
        if (!isMounted) return
        if (result.success && result.data) {
          setData(normalizeAnalyticsData(result.data))
        } else if ('error' in result && result.error) {
          setError(result.error as string)
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [slug, retryKey])

  const summary = useMemo(() => {
    return {
      totalPnL: data?.analytics?.totalPnL ?? data?.chartData?.at(-1)?.cumulativePnL ?? 0,
      winRate: data?.analytics?.winRate ?? 0,
      trades: data?.analytics?.totalTrades ?? 0,
      profitFactor: data?.analytics?.profitFactor ?? 0,
    }
  }, [data])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <header className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.12em]">Team Intelligence</p>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Analytics</h1>
        </header>

        <Card className="bg-card border-0">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load analytics</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => setRetryKey((k) => k + 1)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!data || data.chartData.length === 0) {
    return (
      <section className="space-y-6">
        <header className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.12em]">Team Intelligence</p>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Monitor collective performance and individual consistency to improve team execution quality.
          </p>
        </header>

        <Card className="bg-card border-0">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Team analytics will appear here once team members have recorded trades.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <BarChart3 className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.12em]">Team Intelligence</p>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Monitor collective performance and individual consistency to improve team execution quality.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Total PnL"
          value={formatCurrency(summary.totalPnL)}
          valueClassName={cn(summary.totalPnL >= 0 ? 'text-primary' : 'text-destructive')}
          size="md"
        />

        <DashboardStatCard
          label="Win Rate"
          value={`${summary.winRate.toFixed(1)}%`}
          size="md"
        />

        <DashboardStatCard
          label="Total Trades"
          value={summary.trades}
          size="md"
        />

        <DashboardStatCard
          label="Profit Factor"
          value={summary.profitFactor.toFixed(2)}
          size="md"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card data-chart-surface="modern" className="bg-card border-0 xl:col-span-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Cumulative Equity</CardTitle>
            <CardDescription className="text-[13px] leading-[1.55]">Rolling team performance over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] sm:h-[380px]">
            {data?.chartData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumulativePnL"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="hsl(var(--primary) / 0.12)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No equity data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-0 xl:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Member Breakdown</CardTitle>
            <CardDescription className="text-[13px] leading-[1.55]">Per-trader contribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.membersPerformance?.length ? (
              data.membersPerformance.slice(0, 8).map((member) => (
                <div key={member.userId} className={cn(unifiedInsetPanelClassName, 'p-3')}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{member.email.split('@')[0]}</p>
                    <p className={cn('text-sm font-black', member.totalPnL >= 0 ? 'text-primary' : 'text-destructive')}>
                      {formatCurrency(member.totalPnL)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {member.winRate.toFixed(1)}%
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {member.totalTrades} trades
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No member activity data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-0">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Review traders with low win-rate but high trade frequency first. This usually reveals process drift before it becomes a drawdown event.
        </CardContent>
      </Card>
    </section>
  )
}
