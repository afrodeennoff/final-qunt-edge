"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { WidgetSize, WidgetType } from "../types/dashboard"
import { cn } from "@/lib/utils"

type WidgetPriority ="immediate" |"near" |"deferred"

type LazyWidgetRendererProps = {
 type: WidgetType
 size: WidgetSize
 priority?: WidgetPriority
 className?: string
}

type WidgetComponentProps = {
 size?: WidgetSize
}

const loadingShell = (
 <div
 className="h-full w-full animate-pulse rounded-xl border-0 bg-[radial-gradient(circle_at_12%_0%,hsl(var(--foreground)/0.12),hsl(var(--background)/0.85)_58%)]"
 aria-hidden="true"
 />
)

const widgetLoaders: Record<WidgetType, () => Promise<{ default: React.ComponentType<WidgetComponentProps> }>> = {
 weekdayPnlChart: () => import("./charts/client/weekday-pnl"),
 pnlChart: () => import("./charts/client/pnl-bar-chart"),
 timeOfDayChart: () => import("./charts/client/pnl-time-bar-chart"),
 timeInPositionChart: () => import("./charts/client/time-in-position"),
 equityChart: () => import("./charts/client/equity-chart"),
 pnlBySideChart: () => import("./charts/client/pnl-by-side"),
 pnlPerContractChart: () => import("./charts/client/pnl-per-contract"),
 pnlPerContractDailyChart: () => import("./charts/client/pnl-per-contract-daily"),
 tickDistribution: () => import("./charts/client/tick-distribution"),
 dailyTickTarget: () => import("./charts/client/daily-tick-target"),
 commissionsPnl: () => import("./charts/client/commissions-pnl"),
 calendarWidget: () => import("../components/calendar/calendar-widget"),
 averagePositionTime: () => import("../components/statistics/average-position-time-card"),
 cumulativePnl: () => import("../components/statistics/cumulative-pnl-card"),
 longShortPerformance: () => import("../components/statistics/long-short-card"),
 tradePerformance: () => import("../components/statistics/trade-performance-card"),
 winningStreak: () => import("../components/statistics/winning-streak-card"),
 profitFactor: () => import("../components/statistics/profit-factor-card"),
 statisticsWidget: () => import("../components/statistics/statistics-widget"),
 tradeTableReview: () =>
 import("../components/tables/trade-table-review").then((module) => ({
 default: module.TradeTableReview as React.ComponentType<WidgetComponentProps>,
 })),
 chatWidget: () => import("../components/chat/chat"),
 tradeDistribution: () => import("./charts/client/trade-distribution"),
 propFirm: () =>
 import("../components/accounts/accounts-overview").then((module) => ({
 default: module.AccountsOverview as React.ComponentType<WidgetComponentProps>,
 })),
 timeRangePerformance: () => import("./charts/client/time-range-performance"),
 tagWidget: () =>
 import("../components/filters/tag-widget").then((module) => ({
 default: module.TagWidget as React.ComponentType<WidgetComponentProps>,
 })),
 riskRewardRatio: () => import("../components/statistics/risk-reward-ratio-card"),
 mindsetWidget: () =>
 import("../components/mindset/mindset-widget").then((module) => ({
 default: module.MindsetWidget as React.ComponentType<WidgetComponentProps>,
 })),
 tradingScore: () => import("../components/widgets/trading-score-widget"),
 expectancy: () => import("../components/widgets/expectancy-widget"),
 riskMetrics: () => import("../components/widgets/risk-metrics-widget"),
 propFirmCatalogue: () => import("../components/widgets/propfirm-catalogue-widget"),
 smartInsights: () => import("../components/widgets/smart-insights-widget").then((module) => ({
 default: module.SmartInsightsWidget as React.ComponentType<WidgetComponentProps>,
 })),
 contractQuantity: () => import("./charts/client/contract-quantity"),
}

const dynamicWidgets = Object.entries(widgetLoaders).reduce((acc, [type, loader]) => {
 acc[type as WidgetType] = dynamic(loader, {
 ssr: false,
 loading: () => loadingShell,
 })
 return acc
}, {} as Record<WidgetType, React.ComponentType<WidgetComponentProps>>)

export function LazyWidgetRenderer({ type, size, priority ="immediate", className }: LazyWidgetRendererProps) {
 const [shouldLoad, setShouldLoad] = useState(priority ==="immediate")
 const hostRef = useRef<HTMLDivElement>(null)

 useEffect(() => {
 if (shouldLoad || priority ==="immediate") {
 return
 }

 const element = hostRef.current
 if (!element) {
 return
 }

 const observer = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting) {
 setShouldLoad(true)
 observer.disconnect()
 }
 },
 {
 rootMargin: priority ==="near" ?"300px" :"120px",
 threshold: 0.01,
 }
 )

 observer.observe(element)
 return () => observer.disconnect()
 }, [priority, shouldLoad])

 useEffect(() => {
 if (priority !=="deferred" || shouldLoad) {
 return
 }

 const schedule = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
 .requestIdleCallback

 if (schedule) {
 const idleId = schedule(() => setShouldLoad(true), { timeout: 2200 })
 return () => {
 window.cancelIdleCallback?.(idleId)
 }
 }

 const timeoutId = window.setTimeout(() => setShouldLoad(true), 2200)
 return () => window.clearTimeout(timeoutId)
 }, [priority, shouldLoad])

 const DynamicWidget = useMemo(() => dynamicWidgets[type], [type])

 return (
 <div ref={hostRef} className={cn("h-full w-full", className)}>
 {shouldLoad ? <DynamicWidget size={size} /> : loadingShell}
 </div>
 )
}
