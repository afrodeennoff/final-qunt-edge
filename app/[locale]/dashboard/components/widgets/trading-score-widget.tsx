"use client"

import React from "react"
import { useDashboardStats } from "@/context/data-provider"
import { calculateTradingScore, deriveScoreMetricsFromTrades, getScoreLabel } from "@/lib/score-calculator"
import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { WidgetShell } from "@/components/ui/widget-shell"

export default function TradingScoreWidget({ size }: { size?: string }) {
    const { formattedTrades: trades } = useDashboardStats()
    const t = useI18n()

    const metrics = React.useMemo(() => {
        return deriveScoreMetricsFromTrades(trades as Array<{ pnl?: number | string | null; commission?: number | string | null }>)
    }, [trades])

    const score = calculateTradingScore(metrics)
    const label = getScoreLabel(score)

    const normalizedLabel = label.toLowerCase()
    const hasData = metrics.totalTrades > 0

    return (
        <WidgetShell
            title={t('widgets.tradingScore.title')}
            icon={<Trophy className="h-4 w-4" />}
            info={<p className="text-xs">{t('widgets.tradingScore.tooltip')}</p>}
            state={hasData ? "ready" : "empty"}
            emptyMessage={t("widgets.emptyState") ?? "No trades yet."}
        >
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="relative flex items-center justify-center">
                    <div className="text-4xl font-semibold tracking-tight tabular-nums mb-1">
                        <span className={score >= 80 ? "metric-positive" : "metric-negative font-normal"}>
                            {score}
                        </span>
                        <span className="text-base text-muted-foreground ml-1">/ 100</span>
                    </div>
                </div>
                <div className={cn(
                    "px-2.5 py-1 rounded-full border border-border/55 bg-secondary/22 text-[11px] font-medium tracking-tight text-foreground"
                )}>
                    {normalizedLabel}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 w-full text-center">
                    <div className="flex flex-col p-2.5 bg-secondary/22 rounded-xl border border-border/55">
                        <span className="text-[10px] font-medium tracking-tight text-muted-foreground">Win Rate</span>
                        <span className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{metrics.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col p-2.5 bg-secondary/22 rounded-xl border border-border/55">
                        <span className="text-[10px] font-medium tracking-tight text-muted-foreground">P. Factor</span>
                        <span className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{metrics.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col p-2.5 bg-secondary/22 rounded-xl border border-border/55">
                        <span className="text-[10px] font-medium tracking-tight text-muted-foreground">Trades</span>
                        <span className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{metrics.totalTrades}</span>
                    </div>
                </div>
            </div>
        </WidgetShell>
    )
}
