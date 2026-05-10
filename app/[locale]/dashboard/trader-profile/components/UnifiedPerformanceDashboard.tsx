'use client'

import type { ReactNode } from 'react'

import { UnifiedSurface } from '@/components/layout/unified-page-shell'
import { StatTile, StripMetric } from '../page-client'
import { cn } from '@/lib/utils'

interface UnifiedPerformanceDashboardProps {
  metrics: any
  benchmark?: any
  totalCapitalAllAccounts: number
  totalWithdrawAllAccounts: number
  primaryStripMetrics: Array<{ label: string; value: string; tone?: string }>
  secondaryStripMetrics: Array<{ label: string; value: string; tone?: string }>
  children?: ReactNode
}

export function UnifiedPerformanceDashboard({
  metrics,
  benchmark,
  totalCapitalAllAccounts,
  totalWithdrawAllAccounts,
  primaryStripMetrics,
  secondaryStripMetrics,
  children,
}: UnifiedPerformanceDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Primary Performance Overview */}
      <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d1 p-4 sm:p-5">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Performance overview
            </p>
            <h3 className="mt-1 text-sm font-semibold">Trading Performance</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {primaryStripMetrics.map((metric) => (
              <StripMetric
                key={metric.label}
                label={metric.label}
                value={metric.value}
                tone={metric.tone as any}
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
                tone={metric.tone as any}
                className="h-full"
              />
            ))}
          </div>
        </div>
      </UnifiedSurface>

      {/* Capital & Accounts */}
      <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d2 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-muted rounded" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Capital & Accounts
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Total capital"
            value={typeof totalCapitalAllAccounts === 'number' ? totalCapitalAllAccounts.toString() : totalCapitalAllAccounts}
            tone={(totalCapitalAllAccounts as number) > 0 ? 'positive' : 'default'}
          />
          <StatTile
            label="Total withdraw"
            value={typeof totalWithdrawAllAccounts === 'number' ? totalWithdrawAllAccounts.toString() : totalWithdrawAllAccounts}
          />
          <StatTile
            label="Avg net / trade"
            value={metrics.avgReturn ? metrics.avgReturn.toString() : '0'}
            tone={metrics.avgReturn > 0 ? 'positive' : metrics.avgReturn < 0 ? 'negative' : 'default'}
          />
          <StatTile
            label="Risk reward"
            value={metrics.riskReward ? metrics.riskReward.toString() : '0'}
          />
        </div>
      </UnifiedSurface>

      {/* Execution Quality & Risk */}
      <UnifiedSurface className="animate-fade-up-smooth animate-fade-up-smooth-d3 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-muted rounded" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Execution Quality & Risk
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Max drawdown"
            value={metrics.drawdown ? metrics.drawdown.toString() : '0'}
            tone={metrics.drawdown > 0 ? 'negative' : 'default'}
          />
          <StatTile
            label="Win rate"
            value={`${metrics.winRate ? metrics.winRate : 0}%`}
            tone={metrics.winRate >= 50 ? 'positive' : 'default'}
          />
          <StatTile
            label="Break-even rate"
            value={`${metrics.breakEvenRate ? metrics.breakEvenRate : 0}%`}
          />
          <StatTile
            label="Consistency rate"
            value={`${metrics.consistencyRate ? metrics.consistencyRate : 0}%`}
            tone={metrics.consistencyRate >= 75 ? 'positive' : 'default'}
          />
        </div>

        {/* Benchmark Comparison */}
        {benchmark && (
          <div className="mt-4 rounded-lg border border-border/30 bg-muted/30 p-4">
            <p className="text-sm font-medium mb-2">Benchmark Comparison</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Your Win Rate</span>
                <span className="font-medium">{metrics.winRate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Benchmark Win Rate</span>
                <span className="font-medium">{benchmark.winRate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Your Drawdown</span>
                <span className="font-medium">{metrics.drawdown || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Benchmark Drawdown</span>
                <span className="font-medium">{benchmark.drawdown || 0}%</span>
              </div>
            </div>
          </div>
        )}
      </UnifiedSurface>

      {children}
    </div>
  )
}