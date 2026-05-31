"use client";

import * as React from "react";
import {
 Pie,
 PieChart,
 Tooltip,
 Cell,
 ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import { ChartSurface } from "@/components/ui/chart-surface";
import { useDashboardStats } from "@/context/data-provider";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
 Tooltip as UITooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { useI18n } from "@/locales/client";

interface PnLBySideChartProps {
 size?: WidgetSize;
}

type ChartDatum = {
 side: string;
 pnl: number;
 tradeCount: number;
 winCount: number;
 isAverage: boolean;
 value: number;
 color: string;
}

const formatCurrency = (value: number) =>
 value.toLocaleString("en-US", { style:"currency", currency:"USD" });

const formatWinRate = (wins: number, total: number) => {
 if (!Number.isFinite(wins) || !Number.isFinite(total) || total <= 0) return"0.0"
 return ((wins / total) * 100).toFixed(1)
}

export default React.memo(function PnLBySideChart({
 size ="medium",
}: PnLBySideChartProps) {
 const { formattedTrades: trades } = useDashboardStats();
 const [showAverage, setShowAverage] = React.useState(true);
 const t = useI18n();

 const chartData = React.useMemo(() => {
 const longTrades = trades.filter(
 (trade) => trade.side?.toLowerCase() ==="long",
 );
 const shortTrades = trades.filter(
 (trade) => trade.side?.toLowerCase() ==="short",
 );

 const longPnL = longTrades.reduce((sum, trade) => sum + Number(trade.pnl), 0);
 const shortPnL = shortTrades.reduce((sum, trade) => sum + Number(trade.pnl), 0);

 const longWins = longTrades.filter((trade) => Number(trade.pnl) > 0).length;
 const shortWins = shortTrades.filter((trade) => Number(trade.pnl) > 0).length;

 const points = [
 {
 side:"Long",
 pnl: showAverage
 ? longTrades.length > 0
 ? longPnL / longTrades.length
 : 0
 : longPnL,
 tradeCount: longTrades.length,
 winCount: longWins,
 isAverage: showAverage,
 value: 0,
  color:"var(--primary)",
 },
 {
 side:"Short",
 pnl: showAverage
 ? shortTrades.length > 0
 ? shortPnL / shortTrades.length
 : 0
 : shortPnL,
 tradeCount: shortTrades.length,
 winCount: shortWins,
 isAverage: showAverage,
 value: 0,
  color:"var(--destructive)",
 },
 ];

 return points.map((point) => ({
 ...point,
 value: Math.abs(point.pnl),
 }));
 }, [trades, showAverage]);

 const hasData = chartData.some((d) => d.tradeCount > 0);
 const dominantSide = React.useMemo(() => {
 const [longPoint, shortPoint] = chartData
 if (!longPoint && !shortPoint) return { label:"—", trades: 0 }
 if ((longPoint?.tradeCount ?? 0) === 0 && (shortPoint?.tradeCount ?? 0) === 0) {
 return { label:"—", trades: 0 }
 }
 const winner = (longPoint?.tradeCount ?? 0) >= (shortPoint?.tradeCount ?? 0) ? longPoint : shortPoint
 return { label: (winner?.side ??"—").toUpperCase(), trades: winner?.tradeCount ?? 0 }
 }, [chartData])
 const renderTooltip = React.useCallback(({ active, payload }: TooltipProps<number, string>) => {
 if (active && payload && payload.length) {
 const data = payload[0]?.payload as ChartDatum | undefined;
 if (!data) return null;
 return (
 <div className="bg-card/96 p-3 border-0 rounded-xl shadow-sm min-w-[140px]">
 <div className="flex justify-between items-center mb-2 border-b-0 pb-1">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("pnlBySide.tooltip.side")}</span>
 <span className="font-bold text-foreground text-sm uppercase">{data.side}</span>
 </div>
 <div className="space-y-1.5">
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
 {data.isAverage ? t("pnlBySide.tooltip.averageTotal") :"Total"} P/L
 </span>
 <span className={cn("font-bold text-sm tabular-nums",
 data.pnl >= 0 ?"metric-positive" :"metric-negative"
 )}>{formatCurrency(data.pnl)}</span>
 </div>
 <div className="flex justify-between items-center pt-1.5 border-t-0">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("pnlBySide.tooltip.winRate")}</span>
 <span className="font-bold text-foreground text-sm tabular-nums">
 {formatWinRate(data.winCount, data.tradeCount)}%
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("pnlBySide.tooltip.trades")}</span>
 <span className="font-bold text-foreground text-sm tabular-nums">
 {data.tradeCount}
 </span>
 </div>
 </div>
 </div>
 );
 }
 return null;
 }, [t]);

 return (
 <ChartSurface>
 <div
 className={cn("gap-0 border-b flex flex-col items-stretch border-transparent shrink-0",
 size ==="small" ?"p-2 h-10 justify-center" :"p-3 sm:p-3.5 h-12 justify-center",
 )}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span
 className={cn("line-clamp-1 font-bold tracking-tight text-foreground",
 size ==="small" ?"text-sm" :"text-base",
 )}
 >
 {t("pnlBySide.title")}
 </span>
 <TooltipProvider>
 <UITooltip>
 <TooltipTrigger asChild>
 <Info
 className={cn("text-muted-foreground hover:text-foreground transition-colors cursor-help",
 size ==="small" ?"h-3.5 w-3.5" :"h-4 w-4",
 )}
 />
 </TooltipTrigger>
 <TooltipContent side="top">
 <p className="text-xs">{t("pnlBySide.description")}</p>
 </TooltipContent>
 </UITooltip>
 </TooltipProvider>
 </div>
 <div className="flex items-center gap-2">
 <span
 className={cn("text-[10px] uppercase font-bold tracking-wider text-muted-foreground",
 )}
 >
 {t("pnlBySide.toggle.showAverage")}
 </span>
 <Switch
 checked={showAverage}
 onCheckedChange={setShowAverage}
 className="data-[state=checked]:bg-primary/[0.03]"
 />
 </div>
 </div>
 </div>
 <div
 className={cn("flex-1 min-h-0",
 size ==="small" ?"p-1" :"p-2 sm:p-3",
 )}
 >
 <div className={cn("w-full h-full min-h-0")}>
 {hasData ? (
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={chartData}
 cx="50%"
 cy="50%"
 innerRadius={size ==="small" ?"54%" :"62%"}
 outerRadius={size ==="small" ?"78%" :"90%"}
 paddingAngle={2}
 dataKey="value"
 startAngle={90}
 endAngle={-270}
 stroke="transparent"
 >
 {chartData.map((entry, index) => (
 <Cell
 key={`cell-${index}`}
 fill={entry.color}
 fillOpacity={entry.side ==="Long" ? 0.94 : 0.84}
 className="transition-[opacity,background-color,border-color] duration-300 ease-in-out hover:fill-opacity-100"
 />
 ))}
 <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
 <tspan x="50%" dy="-0.1em" className="fill-foreground font-black text-2xl">
 {dominantSide.label}
 </tspan>
 <tspan x="50%" dy="1.35em" className="fill-foreground text-[10px] uppercase font-black tracking-[0.16em]">
 {dominantSide.trades} TRADES
 </tspan>
 </text>
 </Pie>
 <Tooltip content={renderTooltip} cursor={{ fill:"transparent" }} />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
 {t("widgets.emptyState") ??"No trades yet."}
 </div>
 )}
 </div>
 </div>
 </ChartSurface>
 );
})
