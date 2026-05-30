'use client'

import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { cn } from '@/lib/utils'
import { unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'

type MetricKey = 'accounts' | 'payouts' | 'value' | 'sized'

const metricMeta: Record<MetricKey, { label: string; color: string; format: (v: number) => string }> = {
  accounts: { label: 'Accounts', color: 'var(--chart-1)', format: (v) => v.toLocaleString() },
  payouts: { label: 'Paid Out', color: 'var(--chart-2)', format: (v) => formatCompactCurrency(v) },
  value: { label: 'Account Value', color: 'var(--chart-3)', format: (v) => formatCompactCurrency(v) },
  sized: { label: 'Sized Accounts', color: 'var(--chart-4)', format: (v) => v.toLocaleString() },
}

const chartConfig = {
  accounts: { label: 'Accounts', color: 'var(--chart-1)' },
  payouts: { label: 'Paid Out', color: 'var(--chart-2)' },
  value: { label: 'Account Value', color: 'var(--chart-3)' },
  sized: { label: 'Sized Accounts', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function RegisteredAccountsChart({
  data,
}: {
  data: Array<{ name: string; accounts: number; sized: number; value: number; payouts: number }>
}) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('accounts')

  const sorted = useMemo(() => {
    return [...data]
      .sort((a, b) => (b[activeMetric] as number) - (a[activeMetric] as number))
      .slice(0, 20)
      .map((entry) => ({
        firm: entry.name.length > 14 ? `${entry.name.slice(0, 13)}…` : entry.name,
        value: entry[activeMetric] as number,
      }))
  }, [data, activeMetric])

  const total = useMemo(() => {
    return data.reduce((sum, d) => sum + (d[activeMetric] as number), 0)
  }, [data, activeMetric])

  if (sorted.length === 0) {
    return (
      <div className={cn(unifiedSectionPanelClassName, 'px-6 py-12 text-center')}>
        <p className="text-sm text-muted-foreground">No account registrations available yet.</p>
      </div>
    )
  }

  return (
    <Card className={cn(unifiedSectionPanelClassName, 'overflow-hidden')}>
      <CardHeader className="border-b-0 bg-[linear-gradient(180deg,hsl(var(--card)/0.4)_0%,transparent_100%)] px-6 pb-3 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold leading-tight tracking-tight">
              Registered Accounts by Prop Firm
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {sorted.length} firms • Total: {metricMeta[activeMetric].format(total)}
            </p>
          </div>

          <div className="inline-flex shrink-0 rounded-full border-0 bg-muted/10 p-0.5">
            {(Object.keys(metricMeta) as MetricKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMetric(key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[11px] font-medium transition-all',
                  activeMetric === key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                )}
              >
                {metricMeta[key].label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <ChartContainer
            config={chartConfig}
            className="h-[380px] w-full"
            style={{ minWidth: Math.max(600, sorted.length * 56) + 'px' }}
          >
            <BarChart
              data={sorted}
              margin={{ left: 8, right: 16, top: 12, bottom: 8 }}
              barCategoryGap="20%"
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
              <XAxis
                dataKey="firm"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                angle={-35}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => activeMetric === 'payouts' || activeMetric === 'value' ? formatCompactCurrency(v) : v.toLocaleString()}
                width={64}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => metricMeta[activeMetric].format(value as number)}
                  />
                }
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                {sorted.map((_, i) => (
                  <Cell
                    key={i}
                    fill={metricMeta[activeMetric].color}
                    opacity={1 - i * 0.03}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="border-t-0 px-6 py-3">
          <p className="text-[11px] text-muted-foreground/50">
            Top {sorted.length} firms ranked by {metricMeta[activeMetric].label.toLowerCase()} — scroll horizontally if needed
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
