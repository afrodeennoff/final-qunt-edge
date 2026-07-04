'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface TeamChartPoint {
  date: string
  dailyPnL: number
  cumulativePnL: number
}

interface EquityChartProps {
  data: TeamChartPoint[]
  formatCurrency: (value: number) => string
  CustomTooltip: React.FC<{ active?: boolean; payload?: Array<{ value: number }>; label?: string }>
}

export default function EquityChart({ data, formatCurrency, CustomTooltip }: EquityChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="transparent" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cumulativePnL"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          fill="hsl(var(--primary) / 0.12)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}