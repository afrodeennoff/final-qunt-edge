'use client'

import { useMemo, useState } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { cn } from '@/lib/utils'
import { unifiedInsetPanelClassName, unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'

type MetricKey = 'accounts' | 'payouts' | 'pending' | 'refused'

const registeredAccountsChartConfig = {
  accounts: {
    label: "Num Accounts",
    color: "var(--chart-1)",
  },
  payouts: {
    label: "Paid",
    color: "var(--chart-2)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-3)",
  },
  refused: {
    label: "Refused",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function RegisteredAccountsChart({
  data,
}: {
  data: Array<{ name: string; accounts: number; sized: number; value: number; payouts: number }>
}) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('accounts')

  const metricTabs: { key: MetricKey; label: string }[] = [
    { key: 'accounts', label: 'Accounts' },
    { key: 'payouts', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'refused', label: 'Refused' },
  ]

  const chartData = useMemo(
    () =>
      [...data].map((entry) => ({
        firm: entry.name,
        shortFirm: entry.name.length > 10 ? `${entry.name.slice(0, 10)}...` : entry.name,
        accounts: entry.accounts,
        payouts: entry.payouts,
        pending: entry.value,     // mapping value → Pending for now
        refused: entry.sized,     // mapping sized → Refused for now
      })),
    [data],
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
          <Card>
            <CardHeader>
              <CardTitle>Registered Accounts by Prop Firm</CardTitle>
              <CardDescription>Num Accounts • Paid • Pending • Refused across all firms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <ChartContainer
                  config={registeredAccountsChartConfig}
                  className="h-[340px] w-full"
                  style={{
                    minWidth: Math.max(1200, chartData.length * 80) + 'px',
                  }}
                >
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 20,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="shortFirm"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      angle={-40}
                      textAnchor="end"
                      height={75}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                    <Line
                      dataKey="accounts"
                      type="natural"
                      stroke="var(--color-accounts)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      dataKey="payouts"
                      type="natural"
                      stroke="var(--color-payouts)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      dataKey="pending"
                      type="natural"
                      stroke="var(--color-pending)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      dataKey="refused"
                      type="natural"
                      stroke="var(--color-refused)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    All firms visible — scroll horizontally if needed
                  </div>
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Showing Num Accounts, Paid, Pending, and Refused per prop firm
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            No account registrations available yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
