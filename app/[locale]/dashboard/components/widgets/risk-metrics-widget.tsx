"use client"

import React from "react"

import { useDashboardStats } from "@/context/data-provider"
import { calculateAdvancedMetrics } from "@/lib/advanced-metrics"
import { ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { useI18n, useCurrentLocale } from "@/locales/client"
import { WidgetShell } from "@/components/ui/widget-shell"

export default function RiskMetricsWidget({ size = 'medium' }: { size?: 'tiny' | 'small' | 'medium' | 'large' | 'small-long' | 'extra-large' }) {
 const { formattedTrades: trades } = useDashboardStats()
 const t = useI18n()
 const locale = useCurrentLocale()

 const { kellyHalf, kellyFull, sharpeRatio, sortinoRatio, calmarRatio, maxDrawdown } = React.useMemo(
 () => calculateAdvancedMetrics(trades),
 [trades],
 )
 const translate = t as (key: string) => string
 const hasData = (trades?.length ?? 0) > 0
 const safeNumber = (value: number) => (Number.isFinite(value) ? value : 0)
 const safeKellyHalf = safeNumber(kellyHalf)
 const safeKellyFull = safeNumber(kellyFull)
 const safeSharpeRatio = safeNumber(sharpeRatio)
 const safeSortinoRatio = safeNumber(sortinoRatio)
 const safeCalmarRatio = safeNumber(calmarRatio)
 const safeMaxDrawdown = safeNumber(maxDrawdown)

 // Format currency helper
 const formatCurrency = (value: number) => {
 const formatted = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(value)
 return formatted
 }

 return (
 <WidgetShell
 title={translate('widgets.riskMetrics.title')}
 icon={<ShieldAlert className="h-4 w-4" />}
 info={<p className="text-xs">{translate('widgets.riskMetrics.tooltip')}</p>}
 state={hasData ?"ready" :"empty"}
 emptyMessage={translate("widgets.emptyState") ??"No trades yet."}
 contentClassName="p-0"
 >
 <div className="flex-1 p-0 overflow-hidden">
 <div className="grid h-full grid-cols-2">
 {/* Return Risk Ratios */}
 <div className={cn("flex flex-col border-r border-b-0",
 size === 'tiny' ?"p-1.5" :"p-4"
 )}>
 <h3 className="text-[11px] font-black uppercase tracking-[0.12em] mb-3 text-muted-foreground">Ratios</h3>
 <div className="flex-1 flex flex-col justify-center gap-2.5">
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-xs">Sharpe</span>
 <span className={cn("text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full border", safeSharpeRatio > 1 ?"bg-semantic-success-bg text-semantic-success border-semantic-success/30" :"bg-background/30 text-foreground/70 border-transparent")}>
 {safeSharpeRatio.toFixed(2)}
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-xs">Sortino</span>
 <span className={cn("text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full border", safeSortinoRatio > 1.5 ?"bg-semantic-success-bg text-semantic-success border-semantic-success/30" :"bg-background/30 text-foreground/70 border-transparent")}>
 {safeSortinoRatio.toFixed(2)}
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-xs">Calmar</span>
 <span className={cn("text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full border", safeCalmarRatio > 1 ?"bg-semantic-success-bg text-semantic-success border-semantic-success/30" :"bg-background/30 text-foreground/70 border-transparent")}>
 {safeCalmarRatio.toFixed(2)}
 </span>
 </div>
 </div>
 </div>

 {/* Position Sizing */}
 <div className={cn("flex flex-col border-b-0",
 size === 'tiny' ?"p-1.5" :"p-4"
 )}>
 <h3 className="text-[11px] font-black uppercase tracking-[0.12em] mb-3 text-muted-foreground">Position sizing</h3>
 <div className="flex-1 flex flex-col justify-center gap-2.5">
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-xs text-balance">Kelly Half</span>
 <span className={cn("text-[15px] font-semibold tracking-tight tabular-nums", safeKellyHalf > 0 ?"text-semantic-success" :"text-semantic-error")}>
 {(safeKellyHalf * 100).toFixed(1)}%
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-xs">Optimal</span>
 <span className={cn("text-[15px] font-semibold tracking-tight tabular-nums", safeKellyFull > 0 ?"text-semantic-success" :"text-semantic-error")}>
 {(safeKellyFull * 100).toFixed(1)}%
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-xs">Conservative</span>
 <span className={cn("text-[15px] font-semibold tracking-tight tabular-nums", safeKellyHalf > 0 ?"text-semantic-success" :"text-semantic-error")}>
 {((safeKellyHalf / 2) * 100).toFixed(1)}%
 </span>
 </div>
 </div>
 </div>

 {/* Drawdown Section */}
 <div className={cn("flex flex-col col-span-2",
 size === 'tiny' ?"p-1.5" :"p-4"
 )}>
 <div className="flex justify-between items-end mb-2">
 <div className="flex flex-col">
 <span className="text-[28px] font-[250] tracking-tight text-foreground tabular-nums">
 {formatCurrency(safeMaxDrawdown)}
 </span>
 </div>
 </div>
 <Progress value={100} className="h-1" indicatorClassName="bg-foreground/40" />
 </div>
 </div>
 </div>
 </WidgetShell>
 )
}
