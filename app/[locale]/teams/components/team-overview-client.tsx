'use client'

import { useEffect, useState } from 'react'
import { useI18n } from "@/locales/client"
import { DashboardStatCard } from "@/components/ui/dashboard-stat-card"
import { TeamEquityGridClient } from './user-equity/team-equity-grid-client'
import { getTeamAnalyticsDataAction } from '../actions/analytics'
import { unifiedInsetPanelClassName, unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, TrendingUp, BarChart3, Activity, Lightbulb, Target, AlertTriangle, Award, TrendingDown, DollarSign } from 'lucide-react'

interface TeamOverviewClientProps {
  teamId: string
}

function formatCurrency(value: number): string {
  return `${value >= 0 ? '+' : '-'}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (value !== null && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber?: unknown }).toNumber === 'function') {
    return ((value as { toNumber: () => number }).toNumber?.() ?? 0)
  }
  return 0
}

export function TeamOverviewClient({ teamId }: TeamOverviewClientProps) {
  const t = useI18n()
  const [aggregate, setAggregate] = useState<{
    totalPnL: number
    winRate: number
    totalTrades: number
    profitFactor: number
    memberCount: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function fetchOverview() {
      setLoading(true)
      try {
        const result = await getTeamAnalyticsDataAction(teamId)
        if (!mounted) return
        if (result.success && result.data) {
          const d = result.data
          setAggregate({
            totalPnL: toNumber(d.analytics?.totalPnl ?? 0),
            winRate: toNumber(d.analytics?.winRate ?? 0),
            totalTrades: toNumber(d.analytics?.totalTrades ?? 0),
            profitFactor: toNumber(d.analytics?.profitFactor ?? 0),
            memberCount: d.membersPerformance?.length ?? 0,
          })
        }
      } catch (err) {
        console.error('Failed to load team overview', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchOverview()
    return () => { mounted = false }
  }, [teamId])

  const activeMembers = aggregate?.memberCount ?? 0
  const totalPnL = aggregate?.totalPnL ?? 0
  const winRate = aggregate?.winRate ?? 0
  const totalTrades = aggregate?.totalTrades ?? 0
  const profitFactor = aggregate?.profitFactor ?? 0

  const needsReview = totalTrades > 0 && winRate < 35
  const onFire = winRate > 60 && totalTrades > 20
  const profitable = totalPnL > 0
  const strongPF = profitFactor > 1.5
  const weakPF = profitFactor > 0 && profitFactor < 1

  return (
    <div className="space-y-6">
      {/* Aggregate Stats */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : aggregate ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardStatCard
              label="Total Team PnL"
              value={formatCurrency(totalPnL)}
              valueClassName={totalPnL >= 0 ? 'text-primary' : 'text-destructive'}
              icon={DollarSign}
              size="md"
            />
            <DashboardStatCard
              label="Active Traders"
              value={activeMembers}
              icon={Users}
              size="md"
            />
            <DashboardStatCard
              label="Win Rate"
              value={`${winRate.toFixed(1)}%`}
              icon={BarChart3}
              size="md"
              valueClassName={winRate >= 50 ? 'text-primary' : winRate > 0 ? 'text-warning' : undefined}
            />
            <DashboardStatCard
              label="Profit Factor"
              value={profitFactor.toFixed(2)}
              icon={Activity}
              size="md"
              valueClassName={profitFactor >= 1.5 ? 'text-primary' : profitFactor > 0 ? 'text-warning' : undefined}
            />
          </div>

          {/* Mentor Insight Panel */}
          <div className={cn(unifiedInsetPanelClassName, 'p-4 sm:p-5 space-y-3')}>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Mentor Insight</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              {activeMembers === 0 ? (
                <>No trader activity yet. Invite traders to your team to start seeing aggregate performance and behavioral patterns below.</>
              ) : !profitable && weakPF ? (
                <><AlertTriangle className="h-3.5 w-3.5 inline text-destructive mr-1" />Team is underwater with a profit factor of {profitFactor.toFixed(2)}. Review trade plans and risk management rules. Filter by negative PnL on the equity grid to identify who needs support.</>
              ) : needsReview ? (
                <><Target className="h-3.5 w-3.5 inline text-warning mr-1" />Win rate is below 35% — review execution quality and rule adherence. High frequency with low win rate often signals process drift before a drawdown event.</>
              ) : onFire && strongPF ? (
                <><Award className="h-3.5 w-3.5 inline text-warning mr-1" />Team is performing well — {winRate.toFixed(0)}% win rate with {profitFactor.toFixed(2)} profit factor. Identify and replicate winning patterns across the roster.</>
              ) : (
                <>{activeMembers} active trader{activeMembers !== 1 ? 's' : ''} across {totalTrades} trade{totalTrades !== 1 ? 's' : ''}. Keep monitoring consistency scores and drawdown levels to maintain discipline.</>
              )}
            </p>
          </div>
        </>
      ) : null}

      {/* Equity Grid */}
      <TeamEquityGridClient teamId={teamId} />
    </div>
  )
}
