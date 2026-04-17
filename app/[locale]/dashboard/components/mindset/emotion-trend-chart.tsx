"use client"

import { useI18n } from "@/locales/client"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { safeArrayMax, safeArrayMin } from '@/lib/array-utils'

interface EmotionDataPoint {
 date: Date
 value: number
}

interface EmotionTrendChartProps {
 data: EmotionDataPoint[]
 className?: string
}

function getEmotionColor(val: number): string {
 if (val < 20) return"hsl(var(--destructive))"
 if (val < 40) return"hsl(var(--chart-5))"
 if (val < 60) return"hsl(var(--chart-2))"
 if (val < 80) return"hsl(var(--chart-3))"
 return"hsl(var(--primary))"
}

export function EmotionTrendChart({ data, className }: EmotionTrendChartProps) {
 const t = useI18n()

<<<<<<< HEAD
 if (data.length === 0) {
 return (
 <div
 className={cn("journal-glass-elevated mb-4 rounded-xl border border-white/[0.08] bg-white/[0.070] p-4",
 className
 )}
 >
 <p className="text-center text-sm text-muted-foreground">{t("mindset.noData")}</p>
 </div>
 )
 }
=======
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "journal-glass-elevated mb-4 rounded-xl border border-border/28 bg-card/70 p-4 backdrop-blur-md",
          className
        )}
      >
        <p className="text-center text-sm text-muted-foreground">{t("mindset.noData")}</p>
      </div>
    )
  }
>>>>>>> origin/main

 const maxValue = data.length > 0 ? Math.max(safeArrayMax(data.map((d) => d.value)), 100) : 100
 const minValue = data.length > 0 ? Math.min(safeArrayMin(data.map((d) => d.value)), 0) : 0
 const range = maxValue - minValue || 1

 const chartHeight = 120
 const chartWidth = 100
 const getX = (index: number) => {
 if (data.length <= 1) return chartWidth / 2
 return (index / (data.length - 1)) * chartWidth
 }
 const getY = (val: number) => chartHeight - ((val - minValue) / range) * chartHeight

 const areaPath = [
 `M 0 ${chartHeight}`,
 ...data.map((point, index) => `L ${getX(index)} ${getY(point.value)}`),
 `L ${chartWidth} ${chartHeight}`,"Z",
 ].join("")

 const linePath = data
 .map((point, index) => `${index === 0 ?"M" :"L"} ${getX(index)} ${getY(point.value)}`)
 .join("")

<<<<<<< HEAD
 return (
 <div
 className={cn("journal-glass-elevated mb-4 rounded-xl border border-white/[0.08] bg-white/[0.070] p-4",
 className
 )}
 >
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <p className="text-sm font-medium text-foreground/95">{t("mindset.emotion.title")}</p>
 <span className="text-xs text-muted-foreground">Last 7 days</span>
 </div>
=======
  return (
    <div
      className={cn(
        "journal-glass-elevated mb-4 rounded-xl border border-border/28 bg-card/70 p-4 backdrop-blur-md",
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{t("mindset.emotion.title")}</p>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>
>>>>>>> origin/main

 <div className="relative" style={{ height: `${chartHeight}px` }}>
 <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full" preserveAspectRatio="none">
 <defs>
 <linearGradient id="emotionTrendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
 <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
 <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
 </linearGradient>
 </defs>

 <path d={areaPath} fill="url(#emotionTrendGradient)" />

 <path
 d={linePath}
 fill="none"
 stroke="hsl(var(--primary))"
 strokeWidth="0.8"
 strokeLinecap="round"
 strokeLinejoin="round"
 />

 {data.map((point, index) => (
 <circle
 key={`${point.date.toISOString()}-${index}`}
 cx={getX(index)}
 cy={getY(point.value)}
 r="1.7"
 fill={getEmotionColor(point.value)}
 />
 ))}
 </svg>
 </div>

 <div className="flex justify-between text-xs text-muted-foreground">
 {data.length > 0 && (
 <>
 <span>{format(data[0].date,"MMM d")}</span>
 <span>{format(data[data.length - 1].date,"MMM d")}</span>
 </>
 )}
 </div>
 </div>
 </div>
 )
}
