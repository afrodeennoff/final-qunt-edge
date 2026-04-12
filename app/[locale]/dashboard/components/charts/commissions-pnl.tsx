"use client";

import * as React from "react";
import {
 PieChart,
 Pie,
 Cell,
 ResponsiveContainer,
 Tooltip,
} from "recharts";
import { CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { ChartConfig } from "@/components/ui/chart";
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

interface CommissionsPnLChartProps {
 size?: WidgetSize;
}

function CommissionsTooltip({
 active,
 payload,
}: {
 active?: boolean;
 payload?: Array<{ payload: { name: string; value: number; raw: number } }>;
}) {
 const t = useI18n();
 if (active && payload && payload.length) {
 const data = payload[0].payload;
 return (
 <div className="bg-v2-bg-surface/96 p-3 border border-v2-border/50 rounded-xl shadow-xl min-w-[140px]">
 <div className="flex flex-col mb-2 border-b border-v2-border/40 pb-1">
 <span className="text-v2-text-secondary text-[10px] font-semibold uppercase tracking-wider">
 {t("commissions.tooltip.type")}
 </span>
 <span className="font-bold text-v2-text-primary text-sm uppercase">
 {data.name}
 </span>
 </div>
 <div className="flex flex-col mb-2">
 <span className="text-v2-text-secondary text-[10px] font-semibold uppercase tracking-wider">
 {t("commissions.tooltip.amount")}
 </span>
 <span className={cn("font-bold text-sm tabular-nums",
 data.raw >= 0 ?"metric-positive" :"metric-negative"
 )}>{formatCurrency(data.raw)}</span>
 </div>
 <div className="flex flex-col pt-2 border-t border-v2-border/40">
 <span className="text-v2-text-secondary text-[10px] font-semibold uppercase tracking-wider">
 {t("commissions.tooltip.percentage")}
 </span>
 <span className="font-bold text-v2-text-primary text-sm tabular-nums">
 {data.value.toFixed(2)}%</span>
 </div>
 </div>
 );
 }
 return null;
}


const chartConfig = {
 pnl: {
 label:"Net P/L",
 color:"hsl(var(--chart-1))",
 },
 commissions: {
 label:"Commissions",
 color:"hsl(var(--chart-4))",
 },
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
 value.toLocaleString("en-US", { style:"currency", currency:"USD" });

const formatCenterCurrency = (value: number) => {
 if (!Number.isFinite(value)) return"$0"
 return value.toLocaleString("en-US", {
 style:"currency",
 currency:"USD",
 maximumFractionDigits: 0,
 })
}

export default React.memo(function CommissionsPnLChart({
 size ="medium",
}: CommissionsPnLChartProps) {
 const { formattedTrades: trades } = useDashboardStats();
 const t = useI18n();


 const chartData = React.useMemo(() => {
 const totalPnL = trades.reduce((sum, trade) => sum + Number(trade.pnl), 0);
 const totalCommissions = trades.reduce(
 (sum, trade) => sum + Number(trade.commission),
 0,
 );
 const total = Math.abs(totalPnL) + Math.abs(totalCommissions);
 const pnlPercent = total > 0 ? Number(((Math.abs(totalPnL) / total) * 100).toFixed(2)) : 0;
 const commPercent = total > 0 ? Number(((Math.abs(totalCommissions) / total) * 100).toFixed(2)) : 0;
 return [
 {
 name:"NET P/L",
 value: pnlPercent,
 color: chartConfig.pnl.color,
 raw: totalPnL,
 },
 {
 name:"COMMISSIONS",
 value: commPercent,
 color: chartConfig.commissions.color,
 raw: totalCommissions,
 },
 ];
 }, [trades]);
 const hasData = chartData.some((item) => item.value > 0);


 // Keep donut visually centered and larger to avoid dead space.
 const pieLayout = React.useMemo(() => {
 if (size ==="small") {
 return { innerRadius:"56%", outerRadius:"92%", cy:"50%" };
 }
 if (size ==="large" || size ==="extra-large") {
 return { innerRadius:"64%", outerRadius:"96%", cy:"50%" };
 }
 return { innerRadius:"62%", outerRadius:"95%", cy:"50%" };
 }, [size]);

 return (
 <ChartSurface>
 <div
 className={cn("flex flex-col items-stretch gap-0 border-b border-border/55 shrink-0",
 size === 'small' ?"p-2 h-10 justify-center" :"p-3 sm:p-3.5 h-12 justify-center"
 )}
 >
 <div className="flex items-center justify-between w-full">
 <div className="flex items-center gap-1.5">
 <CardTitle
 className={cn("line-clamp-1 font-bold tracking-tight text-foreground/95",
 size === 'small' ?"text-sm" :"text-base"
 )}
 >
 {t("commissions.title")}
 </CardTitle>
 <TooltipProvider>
 <UITooltip>
 <TooltipTrigger asChild>
 <Info className={cn("text-muted-foreground hover:text-foreground/95 transition-colors cursor-help",
 size === 'small' ?"h-3.5 w-3.5" :"h-4 w-4"
 )} />
 </TooltipTrigger>
 <TooltipContent side="top">
 <p className="text-xs">{t("commissions.tooltip.description")}</p>
 </TooltipContent>
 </UITooltip>
 </TooltipProvider>
 </div>
 </div>
 </div>
 <div
 className={cn("flex-1 min-h-0",
 size === 'small' ?"p-0.5" :"p-1"
 )}
 >
 <div className="w-full h-full min-h-0">
 {hasData ? (
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={chartData}
 cx="50%"
 cy={pieLayout.cy}
 innerRadius={pieLayout.innerRadius}
 outerRadius={pieLayout.outerRadius}
 paddingAngle={2}
 dataKey="value"
 nameKey="name"
 startAngle={90}
 endAngle={-270}
 stroke="transparent"
 strokeWidth={1}
 >
 {chartData.map((entry, index) => (
 <Cell
 key={`cell-${index}`}
 fill={entry.name ==="NET P/L" ?"hsl(var(--chart-1))" :"hsl(var(--chart-4))"}
 fillOpacity={entry.name ==="NET P/L" ? 0.94 : 0.84}
 className={cn("transition-all duration-300 ease-in-out hover:fill-opacity-100",
 entry.name ==="NET P/L" ?"chart-positive-emphasis" :"chart-negative-muted"
 )}
 />
 ))}
 <text x="50%" y={pieLayout.cy} textAnchor="middle" dominantBaseline="central">
 <tspan x="50%" dy="-0.1em" className="fill-foreground font-black text-2xl">
 {formatCenterCurrency(chartData[0]?.raw ?? 0)}
 </tspan>
 <tspan x="50%" dy="1.35em" className="fill-foreground text-[10px] uppercase font-black tracking-[0.16em]">
 NET P/L
 </tspan>
 </text>
 </Pie>
 <Tooltip
 content={<CommissionsTooltip />}
 cursor={{ fill: 'hsl(var(--chart-grid) / 0.55)' }}
 />
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
