"use client"

import React from "react"

import { useDashboardStats } from "@/context/data-provider"
import { calculateAdvancedMetrics } from "@/lib/advanced-metrics"
import type { RiskTradeLike } from "@/lib/analytics/metrics-v1"
import { Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { WidgetShell } from "@/components/ui/widget-shell"

export default function ExpectancyWidget({ size }: { size?: string }) {
 const { formattedTrades: trades } = useDashboardStats()
 const t = useI18n()

 const { expectancy } = React.useMemo(() => calculateAdvancedMetrics(trades as RiskTradeLike[]), [trades])
 const hasData = (trades?.length ?? 0) > 0

 const formattedExpectancy = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectancy)

 return (
 <WidgetShell
 title={t('widgets.expectancy.title')}
 icon={<Target className="h-4 w-4" />}
 info={<p className="text-xs">{t('widgets.expectancy.tooltip')}</p>}
 state={hasData ?"ready" :"empty"}
 emptyMessage={t("widgets.emptyState") ??"No trades yet."}
 >
 <div className="flex-1 flex flex-col items-center justify-center p-4">
 <div className="flex flex-col items-center justify-center">
 <span className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/35">Value per trade</span>
 <div className={cn("text-[28px] font-[250] tracking-[-0.04em] text-foreground/95 tabular-nums",
 expectancy > 0 ?"text-[oklch(0.82_0.185_155)]" : expectancy < 0 ?"text-[oklch(0.74_0.255_22)]" :"text-foreground/95"
 )}>
 {expectancy > 0 ? '+' : ''}{formattedExpectancy}
 </div>
 <div className="mt-5 flex flex-col items-center gap-1">
 <div className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border",
 expectancy > 0
 ?"bg-[oklch(0.82_0.185_155/0.10)] text-[oklch(0.82_0.185_155)] border-[oklch(0.82_0.185_155/0.20)]"
 : expectancy < 0
 ?"bg-[oklch(0.64_0.255_22/0.10)] text-[oklch(0.74_0.255_22)] border-[oklch(0.64_0.255_22/0.20)]"
 :"bg-[oklch(0.65_0.22_260/0.06)] text-foreground/70 border-white/[0.08]"
 )}>
 {expectancy > 0 ?"Positive edge" : expectancy < 0 ?"Negative edge" :"Neutral"}
 </div>
 </div>
 </div>
 </div>
 </WidgetShell>
 )
}
