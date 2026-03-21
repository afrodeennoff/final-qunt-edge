"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface AccountsBarChartProps {
  data: Array<{
    propfirmName: string
    accountsCount: number
    sizedAccountsCount: number
    totalAccountValue: number
    paidAmount: number
    paidCount: number
    pendingAmount: number
    pendingCount: number
    refusedAmount: number
    refusedCount: number
    sizeBreakdown: string
  }>
  chartTitle: string
  legendLabels: {
    registeredAccounts: string
    sizedAccounts: string
    totalAccountValue: string
    paid: string
    pending: string
    refused: string
  }
}

const chartConfig = {
  accountsCount: {
    label: "Registered Accounts",
    color: "var(--color-chart-1)",
  },
  paidCount: {
    label: "Paid Payouts",
    color: "var(--color-chart-2)",
  },
  sizedAccountsCount: {
    label: "Sized Accounts",
    color: "var(--color-chart-3)",
  },
  pendingCount: {
    label: "Pending Payouts",
    color: "var(--color-chart-4)",
  },
  refusedCount: {
    label: "Refused Payouts",
    color: "var(--color-chart-5)",
  },
} satisfies ChartConfig

export function AccountsBarChart({
  data,
  chartTitle,
  legendLabels,
}: AccountsBarChartProps) {
  const [showZeroFirms, setShowZeroFirms] = React.useState(false)
  const [showRegistered, setShowRegistered] = React.useState(true)
  const [showPaid, setShowPaid] = React.useState(true)
  const [showSized, setShowSized] = React.useState(false)
  const [showPending, setShowPending] = React.useState(false)
  const [showRefused, setShowRefused] = React.useState(false)

  const sortedData = React.useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          (b.accountsCount + b.paidCount) - (a.accountsCount + a.paidCount) ||
          b.sizedAccountsCount - a.sizedAccountsCount
      ),
    [data]
  )

  const visibleData = React.useMemo(() => {
    const nonZero = sortedData.filter((row) => {
      const anyCounts =
        row.accountsCount > 0 ||
        row.sizedAccountsCount > 0 ||
        row.paidCount > 0 ||
        row.pendingCount > 0 ||
        row.refusedCount > 0
      return anyCounts
    })

    const base = showZeroFirms || nonZero.length === 0 ? sortedData : nonZero
    return base.slice(0, 14)
  }, [showZeroFirms, sortedData])

  return (
    <Card data-chart-surface="modern" className="border-border/70 bg-card/90">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{chartTitle}</CardTitle>
          <p className="text-xs text-muted-foreground">Vertical bars by firm. Default view compares account count and paid payout count.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleButton active={showRegistered} onClick={() => setShowRegistered((v) => !v)}>
            Accounts
          </ToggleButton>
          <ToggleButton active={showPaid} onClick={() => setShowPaid((v) => !v)}>
            Paid
          </ToggleButton>
          <ToggleButton active={showSized} onClick={() => setShowSized((v) => !v)}>
            Sized
          </ToggleButton>
          <ToggleButton active={showPending} onClick={() => setShowPending((v) => !v)}>
            Pending
          </ToggleButton>
          <ToggleButton active={showRefused} onClick={() => setShowRefused((v) => !v)}>
            Refused
          </ToggleButton>
          <ToggleButton active={showZeroFirms} onClick={() => setShowZeroFirms((v) => !v)}>
            {showZeroFirms ? "Zeros: On" : "Zeros: Off"}
          </ToggleButton>
        </div>
      </CardHeader>
      <CardContent className="border-t border-border/70 pt-4">
        <ChartContainer config={chartConfig} className="h-[420px] w-full">
          <BarChart data={visibleData} margin={{ left: 0, right: 8, top: 12, bottom: 52 }}>
            <CartesianGrid vertical={false} strokeDasharray="2 10" stroke="hsl(var(--chart-grid) / 0.78)" />
            <XAxis
              dataKey="propfirmName"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              angle={-32}
              textAnchor="end"
              height={88}
              interval={0}
              tickFormatter={(value: string) => (value.length > 14 ? `${value.slice(0, 14)}…` : value)}
              tick={{ fontSize: 11, fill: "hsl(var(--foreground) / 0.9)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={46}
              allowDecimals={false}
              domain={[0, (dataMax: number) => (Number.isFinite(dataMax) && dataMax > 0 ? Math.ceil(dataMax + 1) : 1)]}
              tick={{ fontSize: 11, fill: "hsl(var(--foreground) / 0.9)" }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--card) / 0.34)" }}
              content={
                <ChartTooltipContent
                  className="border-[hsl(var(--chart-tooltip-border))] bg-[hsl(var(--chart-tooltip)/0.96)] text-foreground"
                  labelFormatter={(label) => <span className="font-semibold text-foreground">{String(label)}</span>}
                  formatter={(value, name, item) => {
                    const key = String(name)
                    if (key === "accountsCount") {
                      return [Number(value).toLocaleString(), legendLabels.registeredAccounts]
                    }
                    if (key === "sizedAccountsCount") {
                      const breakdown = item?.payload?.sizeBreakdown
                      return [`${Number(value).toLocaleString()}${breakdown ? ` • ${breakdown}` : ""}`, legendLabels.sizedAccounts]
                    }
                    if (key === "paidCount") {
                      return [Number(value).toLocaleString(), `${legendLabels.paid} Count`]
                    }
                    if (key === "pendingCount") {
                      return [Number(value).toLocaleString(), `${legendLabels.pending} Count`]
                    }
                    if (key === "refusedCount") {
                      return [Number(value).toLocaleString(), `${legendLabels.refused} Count`]
                    }
                    return [String(value), key]
                  }}
                />
              }
            />

            {showRegistered ? (
              <Bar dataKey="accountsCount" fill="var(--color-accountsCount)" radius={[6, 6, 0, 0]} maxBarSize={44} />
            ) : null}
            {showPaid ? (
              <Bar dataKey="paidCount" fill="var(--color-paidCount)" fillOpacity={0.88} radius={[6, 6, 0, 0]} maxBarSize={44} />
            ) : null}
            {showSized ? (
              <Bar dataKey="sizedAccountsCount" fill="var(--color-sizedAccountsCount)" fillOpacity={0.82} radius={[6, 6, 0, 0]} maxBarSize={44} />
            ) : null}
            {showPending ? (
              <Bar dataKey="pendingCount" fill="var(--color-pendingCount)" fillOpacity={0.82} radius={[6, 6, 0, 0]} maxBarSize={44} />
            ) : null}
            {showRefused ? (
              <Bar dataKey="refusedCount" fill="var(--color-refusedCount)" fillOpacity={0.82} radius={[6, 6, 0, 0]} maxBarSize={44} />
            ) : null}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="mono"
      size="sm"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-7 px-2 border-border/70 text-[11px] tracking-wide",
        active
          ? "border-primary/60 bg-primary/20 text-foreground"
          : "text-foreground/80 hover:bg-card/80 hover:text-foreground"
      )}
    >
      {children}
    </Button>
  )
}
