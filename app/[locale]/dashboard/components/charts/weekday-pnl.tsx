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
import type { TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { safeArrayMax, safeArrayMin } from '@/lib/array-utils';
import { ChartConfig } from "@/components/ui/chart";
import { useDashboardFilters, useDashboardStats } from "@/context/data-provider";
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
import { translateWeekdayPnL } from "@/lib/translation-utils";
import { Button } from "@/components/ui/button";

const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday = 0, Saturday = 6

interface WeekdayPNLChartProps {
 size?: WidgetSize;
}

const formatCurrency = (value: number) =>
 value.toLocaleString("en-US", { style:"currency", currency:"USD" });

const chartConfig = {
 pnl: {
 label:"PnL",
 color:"hsl(var(--chart-1))",
 },
} satisfies ChartConfig;

export default React.memo(function WeekdayPNLChart({
 size ="medium",
}: WeekdayPNLChartProps) {
 const { calendarData } = useDashboardStats();
 const { weekdayFilter, setWeekdayFilter } = useDashboardFilters();
 const [darkMode, setDarkMode] = React.useState(false);
 const [activeDay, setActiveDay] = React.useState<number | null>(null);
 const t = useI18n();

 React.useEffect(() => {
 const isDarkMode = document.documentElement.classList.contains("dark");
 setDarkMode(isDarkMode);

 const observer = new MutationObserver((mutations) => {
 mutations.forEach((mutation) => {
 if (mutation.attributeName ==="class") {
 setDarkMode(document.documentElement.classList.contains("dark"));
 }
 });
 });

 observer.observe(document.documentElement, { attributes: true });
 return () => observer.disconnect();
 }, []);

 const weekdayData = React.useMemo(() => {
 const weekdayTotals = daysOfWeek.reduce(
 (acc, day) => ({
 ...acc,
 [day]: { total: 0, count: 0 },
 }),
 {} as Record<number, { total: number; count: number }>,
 );

 Object.entries(calendarData).forEach(([date, entry]) => {
 const dayOfWeek = new Date(date).getUTCDay();
 weekdayTotals[dayOfWeek].total += entry.pnl;
 weekdayTotals[dayOfWeek].count += 1;
 });

 return daysOfWeek.map((day) => ({
 day,
 pnl:
 weekdayTotals[day].count > 0
 ? weekdayTotals[day].total / weekdayTotals[day].count
 : 0,
 tradeCount: weekdayTotals[day].count,
 }));
 }, [calendarData]);

 const maxPnL = safeArrayMax(weekdayData.map((d) => d.pnl));
 const minPnL = safeArrayMin(weekdayData.map((d) => d.pnl));
 const hasData = weekdayData.some((d) => d.tradeCount > 0);

 const getColor = (value: number) => {
 const range = Math.max(1, maxPnL - minPnL);
 const ratio = Math.abs((value - minPnL) / range);
 const baseColorVar = value >= 0 ?"--chart-1" :"--chart-4";
 const intensity = darkMode
 ? Math.max(0.72, 0.72 + ratio * 0.22)
 : Math.max(0.62, 0.62 + ratio * 0.22);
 return `hsl(var(${baseColorVar}) / ${Math.min(intensity, 1)})`;
 };

 const handleClick = React.useCallback(() => {
 if (activeDay === null) return;
 const currentDays = weekdayFilter.days || [];
 if (currentDays.includes(activeDay)) {
 // Remove day from filter
 setWeekdayFilter({ days: currentDays.filter(d => d !== activeDay) });
 } else {
 // Add day to filter
 setWeekdayFilter({ days: [...currentDays, activeDay] });
 }
 }, [activeDay, weekdayFilter.days, setWeekdayFilter]);

 const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
 React.useEffect(() => {
 if (active && payload && payload.length) {
 setActiveDay(payload[0].payload.day);
 } else {
 setActiveDay(null);
 }
 }, [active, payload]);

 if (active && payload && payload.length) {
 const data = payload[0].payload;
 return (
 <div className="bg-v2-bg-surface/96 p-3 border border-v2-border/50 rounded-xl shadow-xl min-w-[140px]">
 <div className="flex flex-col mb-2">
 <span className="text-[10px] uppercase text-v2-text-secondary font-semibold tracking-wider">
 {t("weekdayPnl.tooltip.day")}
 </span>
 <span className="font-semibold text-v2-text-primary text-sm">
 {translateWeekdayPnL(t, data.day)}
 </span>
 </div>
 <div className="flex flex-col mb-2">
 <span className="text-[10px] uppercase text-v2-text-secondary font-semibold tracking-wider">
 {t("weekdayPnl.tooltip.averagePnl")}
 </span>
 <span className={cn("font-bold text-sm tabular-nums",
 data.pnl >= 0 ?"metric-positive" :"metric-negative"
 )}>{formatCurrency(data.pnl)}</span>
 </div>
 <div className="flex flex-col pt-2 border-t border-v2-border/40">
 <span className="text-[10px] uppercase text-v2-text-secondary font-semibold tracking-wider">
 {t("weekdayPnl.tooltip.trades")}
 </span>
 <span className={cn("font-bold text-sm", data.tradeCount > 0 ?"metric-positive" :"metric-negative")}>
 {data.tradeCount}{""}
 {data.tradeCount !== 1
 ? t("weekdayPnl.tooltip.trades_plural")
 : t("weekdayPnl.tooltip.trade")}
 </span>
 </div>
 </div>
 );
 }
 return null;
 };

 return (
 <ChartSurface>
 <div
 className={cn("flex flex-col items-stretch gap-0 border-b border-border/55 shrink-0",
 size ==="small" ?"p-2 h-10 justify-center" :"p-3 sm:p-3.5 h-12 justify-center",
 )}
 >
 <div className="flex items-center justify-between w-full">
 <div className="flex items-center gap-2">
 <span
 className={cn("line-clamp-1 font-bold tracking-tight text-foreground/95",
 size ==="small" ?"text-sm" :"text-base",
 )}
 >
 {t("weekdayPnl.title")}
 </span>
 <TooltipProvider>
 <UITooltip>
 <TooltipTrigger asChild>
 <Info
 className={cn("text-muted-foreground hover:text-foreground/95 transition-colors cursor-help",
 size ==="small" ?"h-3.5 w-3.5" :"h-4 w-4",
 )}
 />
 </TooltipTrigger>
 <TooltipContent side="top">
 <p className="text-xs">{t("weekdayPnl.description")}</p>
 </TooltipContent>
 </UITooltip>
 </TooltipProvider>
 </div>
 {weekdayFilter.days && weekdayFilter.days.length > 0 && (
 <Button 
 variant="ghost"
 size="sm"
 className="h-6 px-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground/95 hover:bg-secondary/30"
 onClick={() => setWeekdayFilter({ days: [] })}
 >
 {t("weekdayPnl.clearFilter")}
 </Button>
 )}
 </div>
 </div>
 <div
 className={cn("flex-1 min-h-0",
 size ==="small" ?"p-1" :"p-2 sm:p-3",
 )}
 >
 <button
 type="button"
 className="w-full h-full cursor-pointer text-left"
 onClick={handleClick}
 aria-label={t("weekdayPnl.title")}
 >
 {hasData ? (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={weekdayData}
 margin={
 size ==="small"
 ? { left: 0, right: 0, top: 4, bottom: 0 }
 : { left: 0, right: 0, top: 8, bottom: 0 }
 }
 >
 <CartesianGrid
 strokeDasharray="3 3"
 stroke="hsl(var(--chart-grid))"
 strokeOpacity={0.3}
 vertical={false}
 />
 <XAxis
 dataKey="day"
 tickLine={false}
 axisLine={false}
 height={size ==="small" ? 20 : 24}
 tickMargin={size ==="small" ? 4 : 8}
 hide
 tick={{
 fontSize: size ==="small" ? 9 : 10,
 fill:"hsl(var(--text-secondary))",
 }}
 tickFormatter={(value) => {
 const dayName = translateWeekdayPnL(t, value);
 return size ==="small" ? dayName.slice(0, 3) : dayName;
 }}
 />
 <YAxis
 tickLine={false}
 axisLine={false}
 width={45}
 tickMargin={4}
 hide
 tick={{
 fontSize: size ==="small" ? 9 : 10,
 fill:"hsl(var(--text-secondary))",
 }}
 tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
 />
 <Tooltip
 content={<CustomTooltip />}
 cursor={{ fill: 'hsl(var(--chart-grid) / 0.55)' }}
 />
 <Bar
 dataKey="pnl"
 radius={[2, 2, 2, 2]}
 maxBarSize={size ==="small" ? 25 : 40}
 className="transition-all duration-300 ease-in-out"
 >
 {weekdayData.map((entry) => (
 <Cell
 key={`cell-${entry.day}`}
 fill={entry.pnl >= 0 ?"hsl(var(--chart-1))" :"hsl(var(--chart-4))"}
 fillOpacity={
 weekdayFilter.days && weekdayFilter.days.length > 0 && !weekdayFilter.days.includes(entry.day)
 ? 0.45
 : (entry.pnl >= 0 ? 0.94 : 0.84)
 }
 stroke="hsl(var(--chart-axis))"
 strokeOpacity={
 weekdayFilter.days && weekdayFilter.days.length > 0 && !weekdayFilter.days.includes(entry.day)
 ? 0.45
 : 0.35
 }
 className={cn("hover:opacity-100",
 entry.pnl >= 0 ?"chart-positive-emphasis" :"chart-negative-muted"
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
 </button>
 </div>
 </ChartSurface>
 );
})
