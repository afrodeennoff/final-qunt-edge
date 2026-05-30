"use client";

import * as React from "react";
import {
 Bar,
 BarChart,
 CartesianGrid,
 XAxis,
 YAxis,
 Tooltip,
 Cell,
 ResponsiveContainer,
 ReferenceLine,
} from "recharts";
import type { TooltipProps } from "recharts";
import { CardTitle } from "@/components/ui/card";
import { safeArrayMax, safeArrayMin } from '@/lib/array-utils';
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
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { useI18n } from "@/locales/client";

interface PnLPerContractChartProps {
 size?: WidgetSize;
}

type InstrumentSummary = {
 trades: Array<{
 pnl?: number | string | null;
 commission?: number | string | null;
 quantity?: number | string | null;
 }>;
 totalPnl: number;
 totalContracts: number;
 winCount: number;
}

type ChartDatum = {
 instrument: string;
 averagePnl: number;
 totalPnl: number;
 tradeCount: number;
 winCount: number;
 totalContracts: number;
}

const formatCurrency = (value: number) =>
 value.toLocaleString("en-US", { style:"currency", currency:"USD" });

const formatWinRate = (wins: number, total: number) => {
 if (!Number.isFinite(wins) || !Number.isFinite(total) || total <= 0) return"0.0"
 return ((wins / total) * 100).toFixed(1)
}

export default React.memo(function PnLPerContractChart({
 size ="medium",
}: PnLPerContractChartProps) {
 const { formattedTrades: trades } = useDashboardStats();
 const t = useI18n();

 const chartData = React.useMemo(() => {
 // Group trades by instrument
 const instrumentGroups = trades.reduce(
 (acc, trade) => {
 const instrument = trade.instrument ||"Unknown";
 const netPnl = Number(trade.pnl) - Number(trade.commission || 0); // Calculate net PnL (gross PnL - commission)

 if (!acc[instrument]) {
 acc[instrument] = {
 trades: [],
 totalPnl: 0,
 totalContracts: 0,
 winCount: 0,
 };
 }
 acc[instrument].trades.push(trade);
 acc[instrument].totalPnl += netPnl;
 acc[instrument].totalContracts += Number(trade.quantity);
 if (netPnl > 0) {
 acc[instrument].winCount++;
 }
 return acc;
 },
 {} as Record<string, InstrumentSummary>,
 );

 // Convert to chart data format
 return Object.entries(instrumentGroups)
 .map(([instrument, data]) => ({
 instrument,
 averagePnl:
 data.totalContracts > 0 ? data.totalPnl / data.totalContracts : 0,
 totalPnl: data.totalPnl,
 tradeCount: data.trades.length,
 winCount: data.winCount,
 totalContracts: data.totalContracts,
 }))
 .sort((a, b) => b.averagePnl - a.averagePnl); // Sort by average PnL descending
 }, [trades]);

 const maxPnL = safeArrayMax(chartData.map((d) => d.averagePnl));
 const minPnL = safeArrayMin(chartData.map((d) => d.averagePnl));
 const hasData = chartData.some((d) => d.tradeCount > 0);
 const renderTooltip = React.useCallback(({ active, payload }: TooltipProps<number, string>) => {
 if (active && payload && payload.length) {
 const data = payload[0]?.payload as ChartDatum | undefined;
 if (!data) return null;
 return (
 <div className="bg-card/96 p-3 border-0 rounded-xl shadow-sm min-w-[140px]">
 <div className="flex justify-between items-center mb-2 border-b-0 pb-1">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Instrument</span>
 <span className="font-bold text-foreground text-sm uppercase">{data.instrument}</span>
 </div>
 <div className="space-y-1.5">
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("pnlPerContract.tooltip.averagePnl")}</span>
 <span className={cn("font-bold text-sm tabular-nums",
 data.averagePnl >= 0 ?"metric-positive" :"metric-negative"
 )}>{formatCurrency(data.averagePnl)}</span>
 </div>
 <div className="flex justify-between items-center pt-1.5 border-t-0">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("pnlPerContract.tooltip.totalPnl")}</span>
 <span className="font-bold text-foreground text-sm tabular-nums">
 {formatCurrency(data.totalPnl)}
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("pnlPerContract.tooltip.trades")}</span>
 <span className="font-bold text-foreground text-sm tabular-nums">
 {data.tradeCount} ({formatWinRate(data.winCount, data.tradeCount)}% WR)
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("pnlPerContract.tooltip.totalContracts")}</span>
 <span className="font-bold text-foreground text-sm tabular-nums">
 {data.totalContracts}
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
 <div className="flex items-center gap-1.5">
 <CardTitle
 className={cn("line-clamp-1 font-bold tracking-tight text-foreground",
 size ==="small" ?"text-sm" :"text-base",
 )}
 >
 {t("pnlPerContract.title")}
 </CardTitle>
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
 <p className="text-xs">{t("pnlPerContract.description")}</p>
 </TooltipContent>
 </UITooltip>
 </TooltipProvider>
 </div>
 </div>
 </div>
 <div
 className={cn("flex-1 min-h-0",
 size ==="small" ?"p-1" :"p-2 sm:p-3",
 )}
 >
 <div className={cn("w-full h-full")}>
 {hasData ? (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={chartData}
 margin={
 size ==="small"
 ? { left: 0, right: 0, top: 4, bottom: 20 }
 : { left: 0, right: 0, top: 8, bottom: 24 }
 }
 >
 <CartesianGrid
 strokeDasharray="3 3"
 stroke="var(--chart-grid)"
 strokeOpacity={0.3}
 vertical={false}
 />
 <XAxis
 dataKey="instrument"
 tickLine={false}
 axisLine={false}
 height={size ==="small" ? 20 : 24}
 tickMargin={size ==="small" ? 4 : 8}
 hide
 tick={{
 fontSize: size ==="small" ? 9 : 10,
 fill:"var(--text-secondary)",
 }}
 angle={size ==="small" ? -45 : -45}
 textAnchor="end"
 />
 <YAxis
 tickLine={false}
 axisLine={false}
 width={60}
 tickMargin={4}
 hide
 tick={{
 fontSize: size ==="small" ? 9 : 10,
 fill:"var(--text-secondary)",
 }}
 tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
 domain={[Math.min(minPnL * 1.1, 0), Math.max(maxPnL * 1.1, 0)]}
 />
 <ReferenceLine y={0} stroke="var(--chart-axis)" />
 <Tooltip
 content={renderTooltip}
 cursor={{ fill: 'var(--chart-grid-cursor)' }}
 />
 <Bar
 dataKey="averagePnl"
 radius={[2, 2, 2, 2]}
 maxBarSize={size ==="small" ? 25 : 40}
 className="transition-[opacity,background-color,border-color] duration-300 ease-in-out"
 >
 {chartData.map((entry, index) => (
 <Cell
 key={`cell-${index}`}
  fill={entry.averagePnl >= 0 ?"var(--primary)" :"var(--chart-4)"}
 fillOpacity={entry.averagePnl >= 0 ? 0.94 : 0.84}
 stroke="var(--chart-axis)"
 strokeOpacity={0.55}
 strokeWidth={1}
 className={cn("hover:fill-opacity-100 transition-[opacity,background-color,border-color] duration-300",
 entry.averagePnl >= 0 ?"chart-positive-emphasis" :"chart-negative-muted"
 )}
 />
 ))}
 </Bar>
 </BarChart>
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
