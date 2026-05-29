'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { cn } from '@/lib/utils'
import { unifiedInsetPanelClassName, unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'

type MetricKey = 'payouts' | 'value' | 'accounts' | 'sized'

const registeredAccountsChartConfig = {
  accounts: {
    label: 'Registered Accounts',
    color: 'hsl(var(--chart-1))',
  },
  value: {
    label: 'Account Value',
    color: 'hsl(var(--chart-2))',
  },
  payouts: {
    label: 'Payouts',
    color: 'hsl(var(--chart-3))',
  },
  sized: {
    label: 'Sized Accounts',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

export function RegisteredAccountsChart({
  data,
}: {
  data: Array<{ name: string; accounts: number; sized: number; value: number; payouts: number }>
}) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('accounts')
  const metricTabs: Array<{ key: MetricKey; label: string }> = [
    { key: 'payouts', label: 'Payouts' },
    { key: 'value', label: 'Value' },
    { key: 'accounts', label: 'Reg' },
    { key: 'sized', label: 'Sized' },
  ]

  const formatMetricValue = (value: number, key: MetricKey) => {
    if (key === 'value' || key === 'payouts') return formatCompactCurrency(value)
    return value.toLocaleString()
  }

  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => b[activeMetric] - a[activeMetric])
        .map((entry) => ({
          firm: entry.name,
          shortFirm: entry.name.length > 9 ? `${entry.name.slice(0, 9)}...` : entry.name,
          metricValue: entry[activeMetric],
        })),
    [activeMetric, data],
  )

  return (
    <Card className={cn(unifiedSectionPanelClassName, 'overflow-hidden')}>
      <CardHeader className="border-b border-border bg-[linear-gradient(180deg,hsl(var(--card)/0.58)_0%,transparent_100%)] px-6 pb-3 pt-4">
        <div className="flex flex-col gap-2">
          <div className="min-w-0">
            <CardTitle className="text-[clamp(1.2rem,2.4vw,1.55rem)] leading-tight tracking-tight">
              Registered Accounts by Prop Firm
            </CardTitle>
          </div>
          <div className="flex w-full items-center justify-between gap-3 overflow-x-auto">
            <span className="shrink-0 text-xs text-muted-foreground">
              {registeredAccountsChartConfig[activeMetric].label}
            </span>
            <div className="inline-flex shrink-0 rounded-full border border-border bg-muted/10 p-1">
              {metricTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveMetric(tab.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeMetric === tab.key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {chartData.length > 0 ? (
          <div className={cn(unifiedInsetPanelClassName, 'overflow-hidden p-4')}>
            <div className="space-y-3">
              {chartData.slice(0, 12).map((item, index) => {
                const maxValue = Math.max(...chartData.map(d => d.metricValue), 1)
                const percentage = maxValue > 0 ? (item.metricValue / maxValue) * 100 : 0

                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-24 shrink-0 text-xs text-muted-foreground truncate" title={item.firm}>
                      {item.firm}
                    </div>
                    <div className="flex-1 bg-muted/30 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(percentage, item.metricValue > 0 ? 4 : 0)}%`,
                          backgroundColor: `hsl(var(--primary))`,
                        }}
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-medium tabular-nums">
                      {formatMetricValue(item.metricValue, activeMetric)}
                    </div>
                  </div>
                )
              })}
            </div>
            {chartData.length > 12 && (
              <div className="text-center text-[10px] text-muted-foreground mt-3">
                +{chartData.length - 12} more firms
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            No account registrations available yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
