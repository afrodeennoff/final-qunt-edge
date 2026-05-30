'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

interface DataPoint {
  time: string
  price: number
  ema: number
  volume: number
}

interface AnalysisDemoChartProps {
  data: DataPoint[]
}

export default function AnalysisDemoChart({ data }: AnalysisDemoChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          domain={['dataMin - 10', 'dataMax + 10']}
          hide
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid transparent',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#priceGradient)"
        />
        <Area
          type="monotone"
          dataKey="ema"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          strokeDasharray="4 4"
          fill="none"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
