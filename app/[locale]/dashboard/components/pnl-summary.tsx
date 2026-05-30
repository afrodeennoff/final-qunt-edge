'use client'

import { useDashboardStats } from '@/context/data-provider'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon, TrendingDown, TrendingUp, Target, Zap, Download } from 'lucide-react'
import { startOfDay, isWithinInterval, endOfDay, parseISO, format } from 'date-fns'

function downloadPnLSummaryCSV(data: { daily: { pnl: number; wins: number; total: number }; winRate: number }, longTermWinRate: number | null) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const rows = [
    ['Metric', 'Value'],
    ["Today's PnL", data.daily.pnl.toFixed(2)],
    ['Trades Today', data.daily.total.toString()],
    ['Wins Today', data.daily.wins.toString()],
    ['Win Rate Today', `${data.winRate}%`],
    ['Long-term Win Rate', longTermWinRate !== null ? `${longTermWinRate}%` : '—'],
    ['Generated', new Date().toISOString()],
  ]

  const csvContent = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = `pnl-summary-${today}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
})

type PnLSummaryProps = {
  className?: string
}

export function PnLSummary({ className }: PnLSummaryProps) {
  const { calendarData, statistics } = useDashboardStats()

  const stats = useMemo(() => {
    const now = new Date()
    const daily = { pnl: 0, wins: 0, total: 0 }
    const startDay = startOfDay(now)
    const endDay = endOfDay(now)

    Object.entries(calendarData ?? {}).forEach(([dateStr, data]) => {
      const dayData = data as { pnl?: number; trades?: Array<{ pnl?: number }> }
      const date = parseISO(dateStr)
      if (!isWithinInterval(date, { start: startDay, end: endDay })) return

      const safeDayPnl = Number(dayData.pnl ?? 0)
      daily.pnl += Number.isFinite(safeDayPnl) ? safeDayPnl : 0
      for (const trade of dayData.trades ?? []) {
        daily.total += 1
        const safeTradePnl = Number(trade.pnl ?? 0)
        if (Number.isFinite(safeTradePnl) && safeTradePnl > 0) {
          daily.wins += 1
        }
      }
    })

    if (!Number.isFinite(daily.pnl)) {
      daily.pnl = 0
    }

    const winRate = daily.total > 0 ? Math.round((daily.wins / daily.total) * 100) : 0
    return { daily, winRate }
  }, [calendarData])

  const isPositive = stats.daily.pnl >= 0
  const longTermWinRate =
    typeof statistics?.winRate === 'number' && Number.isFinite(statistics.winRate)
      ? Math.round(statistics.winRate)
      : null

  const summaryItems: Array<{
    label: string
    value: string
    icon: LucideIcon
    accent?: string
  }> = [
    {
      label: "Today's PnL",
      value: currencyFormatter.format(stats.daily.pnl),
      icon: isPositive ? TrendingUp : TrendingDown,
      accent: isPositive ? 'metric-positive' : 'metric-negative',
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate}%`,
      icon: Target,
    },
    {
      label: 'Trades',
      value: stats.daily.total.toString(),
      icon: Zap,
    },
    {
      label: 'Avg. Daily',
      value: longTermWinRate !== null ? `${longTermWinRate}%` : '—',
      icon: TrendingUp,
    },
  ]

  return (
    <div
      aria-live="polite"
      aria-label="Daily PnL quick summary"
      className={cn(
        'flex items-center gap-1 divide-x divide-border/35 overflow-x-auto rounded-xl border-0 bg-background/55 px-2 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 shadow-sm',
        className,
      )}
    >
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center px-4 gap-0.5 min-w-[110px] group"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item.label}
          </span>
          <div className="flex items-center gap-2">
            <item.icon
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-[opacity,background-color,border-color] group-hover:scale-110',
                item.accent ?? 'text-muted-foreground/60',
              )}
            />
            <span
              className={cn(
                'text-[15px] font-semibold tracking-tight tabular-nums',
                item.accent === 'metric-positive' && 'text-semantic-success',
                item.accent === 'metric-negative' && 'text-semantic-error',
                !item.accent && 'text-foreground',
              )}
            >
              {item.value}
            </span>
          </div>
        </div>
      ))}
      <button
        onClick={() => downloadPnLSummaryCSV({ daily: stats.daily, winRate: stats.winRate }, longTermWinRate)}
        className="ml-2 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition hover:bg-muted/30 hover:text-foreground"
        aria-label="Download PnL Summary as CSV"
        title="Download CSV"
      >
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
