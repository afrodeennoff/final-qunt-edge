"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCurrentLocale, useI18n } from "@/locales/client"
import { Card, CardContent } from "@/components/ui/card"

interface EmotionTrendDataPoint {
  date: Date
  value: number
}

interface EmotionTrendChartProps {
  data: EmotionTrendDataPoint[]
  days?: 7 | 30 | 90
  showAverage?: boolean
  height?: number
  className?: string
}

const formatDate = (date: Date, locale: string): string => {
  const d = new Date(date)
  return d.toLocaleDateString(locale, { month: "short", day: "numeric" })
}

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload

  const getEmotionColor = (value: number): string => {
    if (value <= 20) return "hsl(var(--emotion-sad))"
    if (value <= 40) return "hsl(var(--emotion-anxious))"
    if (value <= 60) return "hsl(var(--emotion-neutral))"
    if (value <= 80) return "hsl(var(--emotion-focused))"
    return "hsl(var(--emotion-confident))"
  }

  return (
    <Card className="journal-glass-elevated border-none shadow-lg">
      <CardContent className="p-3">
        <p className="text-sm font-medium text-token-secondary">{data.date}</p>
        <p className="text-lg font-bold" style={{ color: getEmotionColor(data.value) }}>
          {data.value}
        </p>
      </CardContent>
    </Card>
  )
}

export const EmotionTrendChart = React.memo(function EmotionTrendChart({
  data,
  days = 7,
  showAverage = true,
  height = 200,
  className,
}: EmotionTrendChartProps) {
  const t = useI18n()
  const locale = useCurrentLocale()

  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      date: formatDate(point.date, locale),
    }))
  }, [data, locale])

  const average = React.useMemo(() => {
    if (data.length === 0) return 0
    const sum = data.reduce((acc, point) => acc + point.value, 0)
    return Math.round(sum / data.length)
  }, [data])

  const trend = React.useMemo(() => {
    if (data.length < 2) return "neutral"
    const recent = data.slice(-Math.min(5, data.length))
    const avgRecent = recent.reduce((acc, p) => acc + p.value, 0) / recent.length
    const avgEarlier = data.slice(0, Math.max(1, data.length - 5)).reduce((acc, p) => acc + p.value, 0) / Math.max(1, data.length - 5)
    if (avgRecent > avgEarlier + 5) return "up"
    if (avgRecent < avgEarlier - 5) return "down"
    return "neutral"
  }, [data])

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-[hsl(var(--emotion-happy))]" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-[hsl(var(--emotion-sad))]" />
      default:
        return <Minus className="h-4 w-4 text-[hsl(var(--emotion-neutral))]" />
    }
  }

  return (
    <div className={cn("journal-glass-elevated p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-token-primary">
          {(t as any)('mindset.emotion.trendTitle')}
        </h3>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          {showAverage && (
            <span className="text-sm text-token-secondary">
              {(t as any)('mindset.emotion.average')}: {average}
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`emotionTrendGradient-${days}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--emotion-happy))" stopOpacity={0.4} />
              <stop offset="50%" stopColor="hsl(var(--emotion-neutral))" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(var(--emotion-sad))" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--text-tertiary))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="hsl(var(--text-tertiary))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showAverage && <ReferenceLine y={average} stroke="hsl(var(--border) / 0.5)" strokeDasharray="5 5" />}
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--emotion-happy))"
            strokeWidth={2}
            fill={`url(#emotionTrendGradient-${days})`}
            animationBegin={0}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})

EmotionTrendChart.displayName = "EmotionTrendChart"

export default EmotionTrendChart
