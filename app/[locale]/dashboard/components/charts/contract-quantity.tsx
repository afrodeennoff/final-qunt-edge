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
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useDashboardStats } from "@/context/data-provider";
import { Trade } from "@/lib/data-types";
import { safeArrayMax } from '@/lib/array-utils';
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { useI18n } from "@/locales/client";
import { formatInTimeZone } from "date-fns-tz";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
 Tooltip as UITooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContractQuantityChartProps {
 size?: WidgetSize;
}

const chartConfig = {
 totalQuantity: {
 label:"Total Number of Contracts",
 color:"hsl(var(--foreground))",
 },
} satisfies ChartConfig;

export default React.memo(function ContractQuantityChart({
 size ="medium",
}: ContractQuantityChartProps) {
 const { formattedTrades: trades } = useDashboardStats();
 const t = useI18n();

 const chartData = React.useMemo(() => {
 const hourlyData: {
 [hour: string]: { totalQuantity: number; count: number };
 } = {};

 // Initialize hourly data for all 24 hours
 for (let i = 0; i < 24; i++) {
 hourlyData[i.toString()] = { totalQuantity: 0, count: 0 };
 }

 // Sum up quantities for each hour in UTC
 trades.forEach((trade: Trade) => {
 const hour = formatInTimeZone(new Date(trade.entryDate),"UTC","H");
 hourlyData[hour].totalQuantity += Number(trade.quantity);
 hourlyData[hour].count++;
 });

 // Convert to array format for Recharts
 return Object.entries(hourlyData)
 .map(([hour, data]) => ({
 hour: parseInt(hour),
 totalQuantity: data.totalQuantity,
 tradeCount: data.count,
 }))
 .sort((a, b) => a.hour - b.hour);
 }, [trades]);

 const maxTradeCount = safeArrayMax(chartData.map((data) => data.tradeCount));
 const hasData = chartData.some((data) => data.tradeCount > 0);

 const getColor = (count: number) => {
 const intensity = Math.max(0.2, count / maxTradeCount);
 return `hsl(var(--chart-3) / ${intensity})`;
 };

 // Custom tooltip component - using flexible typing for Recharts payload
 interface CustomTooltipProps {
 active?: boolean;
 payload?: Array<{
 payload?: {
 totalQuantity: number;
 tradeCount: number;
 hour: number;
 };
 }>;
 label?: string | number;
 }

 const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
 if (active && payload && payload.length) {
 const data = payload[0]?.payload;
 const totalQuantity = typeof data?.totalQuantity ==="number" ? data.totalQuantity : 0
 const tradeCount = typeof data?.tradeCount ==="number" ? data.tradeCount : 0
 const parsedLabel = typeof label ==="number" ? label : parseInt(label ??"0", 10)
 const hourLabel = Number.isFinite(parsedLabel) ? parsedLabel : 0
 return (
 <div className="bg-card/96 p-3 border border-border/30 rounded-xl shadow-sm min-w-[140px]">
 <div className="flex justify-between items-center mb-2 border-b border-border/40 pb-1">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("contracts.tooltip.time")}</span>
 <span className="font-bold text-foreground text-sm uppercase">{`${hourLabel}:00 - ${(hourLabel + 1) % 24}:00`}</span>
 </div>
 <div className="space-y-1.5">
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("contracts.tooltip.totalContracts")}</span>
 <span className="font-bold text-foreground text-sm tabular-nums">{totalQuantity}</span>
 </div>
 <div className="flex justify-between items-center pt-1.5 border-t border-border/40">
 <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{t("contracts.tooltip.numberOfTrades")}</span>
 <span className="font-bold text-foreground text-sm tabular-nums">
 {tradeCount}
 </span>
 </div>
 </div>
 </div>
 );
 }
 return null;
 };

 return (
 <ChartSurface>
 <div
 className={cn("gap-0 border-b flex flex-col items-stretch border-border/55 shrink-0",
 size ==="small" ?"p-2 h-10 justify-center" :"p-3 sm:p-3.5 h-12 justify-center",
 )}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1.5">
 <CardTitle
 className={cn("line-clamp-1 font-bold tracking-tight text-foreground uppercase tracking-widest",
 size ==="small" ?"text-sm" :"text-base",
 )}
 >
 {t("contracts.title")}
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
 <p className="text-xs">{t("contracts.description")}</p>
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
 stroke="hsl(var(--chart-grid))"
 strokeOpacity={0.3}
 vertical={false}
 />
 <XAxis
 dataKey="hour"
 tickLine={false}
 axisLine={false}
 height={size ==="small" ? 20 : 24}
 tickMargin={size ==="small" ? 4 : 8}
 hide
 tick={{
 fontSize: size ==="small" ? 9 : 10,
 fill:"hsl(var(--text-secondary))",
 }}
 tickFormatter={(value: number) => `${value}h`}
 ticks={
 size ==="small"
 ? [0, 6, 12, 18]
 : [0, 3, 6, 9, 12, 15, 18, 21]
 }
 />
 <YAxis
 tickLine={false}
 axisLine={false}
 width={30}
 tickMargin={4}
 hide
 tick={{
 fontSize: size ==="small" ? 9 : 10,
 fill:"hsl(var(--text-secondary))",
 }}
 tickFormatter={(value: number) => value.toFixed(0)}
 />
 <Tooltip
 content={({ active, payload, label }) => (
 <CustomTooltip
 active={active}
 payload={payload}
 label={label}
 />
 )}
 cursor={{ fill: 'hsl(var(--chart-grid) / 0.55)' }}
 />
 <Bar
 dataKey="totalQuantity"
 radius={[2, 2, 2, 2]}
 maxBarSize={size ==="small" ? 25 : 40}
 className="transition-[opacity,background-color,border-color] duration-300 ease-in-out"
 >
 {chartData.map((entry, index) => (
 <Cell
 key={`cell-${index}`}
 fill="hsl(var(--chart-3))"
 fillOpacity={entry.tradeCount > 0 ? 0.92 : 0.5}
 stroke="hsl(var(--chart-axis))"
 strokeOpacity={0.55}
 strokeWidth={1}
 className="hover:fill-opacity-100 transition-[opacity,background-color,border-color] duration-300"
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
