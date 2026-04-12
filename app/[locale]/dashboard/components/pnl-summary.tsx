"use client"

import { useDashboardStats } from "@/context/data-provider"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingDown, TrendingUp, Target, Zap } from "lucide-react"
import { startOfDay, isWithinInterval, endOfDay, parseISO } from "date-fns"

const currencyFormatter = new Intl.NumberFormat("en-US", {
 style:"currency",
 currency:"USD",
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 signDisplay:"exceptZero",
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
 typeof statistics?.winRate ==="number" && Number.isFinite(statistics.winRate)
 ? Math.round(statistics.winRate)
 : null

 const summaryItems: Array<{
 label: string
 value: string
 icon: LucideIcon
 accent?: string
 }> = [
 {
 label:"Today's PnL",
 value: currencyFormatter.format(stats.daily.pnl),
 icon: isPositive ? TrendingUp : TrendingDown,
 accent: isPositive ?"metric-positive" :"metric-negative",
 },
 {
 label:"Win Rate",
 value: `${stats.winRate}%`,
 icon: Target,
 },
 {
 label:"Trades",
 value: stats.daily.total.toString(),
 icon: Zap,
 },
 {
 label:"Avg. Daily",
 value: longTermWinRate !== null ? `${longTermWinRate}%` :"—",
 icon: TrendingUp,
 },
 ]

 return (
 <div
 aria-live="polite"
 aria-label="Daily PnL quick summary"
 className={cn("flex items-center gap-1 divide-x divide-white/[0.06] overflow-x-auto rounded-xl border border-white/[0.06] bg-black/30 px-2 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60",
 className
 )}
 >
 {summaryItems.map((item) => (
 <div key={item.label} className="flex flex-col items-center px-4 gap-0.5 min-w-[110px] group">
 <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/35">
 {item.label}
 </span>
 <div className="flex items-center gap-2">
 <item.icon
 className={cn("h-4 w-4 flex-shrink-0 transition-all group-hover:scale-110", item.accent ??"text-muted-foreground/60")}
 />
 <span
 className={cn("text-[15px] font-semibold tracking-[-0.03em] tabular-nums",
 item.accent ==="metric-positive" &&"text-[oklch(0.82_0.185_155)]",
 item.accent ==="metric-negative" &&"text-[oklch(0.74_0.255_22)]",
 !item.accent &&"text-foreground/95"
 )}
 >
 {item.value}
 </span>
 </div>
 </div>
 ))}
 </div>
 )
}
