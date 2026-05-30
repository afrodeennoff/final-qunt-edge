'use client'

import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
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

  const renderBottomLabel = (props: {
    x?: string | number
    y?: string | number
    width?: string | number
    height?: string | number
    value?: string | number
  }) => {
    const { x, y, width, height, value } = props
    const numericX = typeof x === 'number' ? x : Number(x)
    const numericY = typeof y === 'number' ? y : Number(y)
    const numericWidth = typeof width === 'number' ? width : Number(width)
    const numericHeight = typeof height === 'number' ? height : Number(height)

    if (
      !Number.isFinite(numericX) ||
      !Number.isFinite(numericY) ||
      !Number.isFinite(numericWidth) ||
      !Number.isFinite(numericHeight)
    ) {
      return null
    }

    const label = String(value ?? '')
    return (
      <text
        x={numericX + numericWidth / 2}
        y={numericY + numericHeight + 14}
        textAnchor="middle"
        dominantBaseline="hanging"
        className="fill-muted-foreground text-[10px]"
      >
        {label}
      </text>
    )
  }

  return (
    <Card className={cn(unifiedSectionPanelClassName, 'overflow-hidden')}>
      <CardHeader className="border-b border-border/35 bg-[linear-gradient(180deg,hsl(var(--card)/0.58)_0%,transparent_100%)] px-6 pb-3 pt-4">
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
            <div className="inline-flex shrink-0 rounded-full border-0 bg-card/55 p-1">
              {metricTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveMetric(tab.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeMetric === tab.key
                      ? 'bg-primary text-primary-foreground shadow-[0_12px_20px_-14px_hsl(var(--primary)/0.75)]'
                      : 'text-muted-foreground hover:bg-card/75 hover:text-foreground'
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
          <div className={cn(unifiedInsetPanelClassName, 'overflow-hidden p-3')}>
            <ChartContainer
              config={registeredAccountsChartConfig}
              className="h-[360px] w-full overflow-hidden"
            >
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 28, right: 10, left: 10, bottom: 52 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="shortFirm" tick={false} tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _name, item) => {
                        const firmName =
                          (item?.payload as { firm?: string } | undefined)?.firm ?? 'Firm'
                        return [formatMetricValue(Number(value), activeMetric), String(firmName)]
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="metricValue"
                  fill={`var(--color-${activeMetric})`}
                  radius={10}
                  maxBarSize={60}
                >
                  <LabelList
                    dataKey="metricValue"
                    position="top"
                    offset={10}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => formatMetricValue(value, activeMetric)}
                  />
                  <LabelList dataKey="shortFirm" position="bottom" content={renderBottomLabel} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="rounded-xl border-0/30 bg-background/60 px-4 py-6 text-sm text-muted-foreground">
            No account registrations available yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
