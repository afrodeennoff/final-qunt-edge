'use client'

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { useI18n } from '@/locales/client'

type ChartPoint = {
  time: string
  price: number
  ema: number
  volume: number
}

interface AnalysisDemoChartProps {
  data: ChartPoint[]
}

type TooltipEntry = {
  dataKey?: string | number
  name?: string | number
  value?: ValueType
}

function formatTooltipValue(value: ValueType): string {
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}

function AnalysisChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: NameType
}) {
  const t = useI18n()

  if (!active || !payload?.length) return null

  const tooltipLabels: Record<string, string> = {
    price: String(t('landing.home.analysis.chartPrice')),
    ema: String(t('landing.home.analysis.chartEma')),
    volume: String(t('landing.home.analysis.chartVolume')),
  }

  const byKey = new Map<string, TooltipEntry>()
  for (const entry of payload) {
    const key = String(entry.dataKey ?? entry.name ?? '')
    if (!key) continue
    byKey.set(key, entry)
  }

  const orderedEntries = ['price', 'ema', 'volume']
    .map((key) => byKey.get(key))
    .filter((entry): entry is TooltipEntry => Boolean(entry))

  return (
    <div className="min-w-[148px] rounded-md border border-border/60 bg-background/95 px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 border-b border-border/50 pb-1 text-[11px] font-semibold">
        {String(label ?? '')}
      </div>
      <div className="space-y-1">
        {orderedEntries.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? '')
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{tooltipLabels[key] ?? key}</span>
              <span className="font-semibold text-foreground">
                {formatTooltipValue(entry.value ?? '')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AnalysisDemoChart({ data }: AnalysisDemoChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.6)" vertical={false} />
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          fontSize={11}
          stroke="hsl(var(--foreground)/0.72)"
        />
        <YAxis
          yAxisId="price"
          axisLine={false}
          tickLine={false}
          fontSize={11}
          stroke="hsl(var(--foreground)/0.72)"
        />
        <YAxis yAxisId="volume" hide />
        <Tooltip cursor={{ stroke: 'hsl(var(--border))' }} content={<AnalysisChartTooltip />} />
        <Bar
          yAxisId="volume"
          dataKey="volume"
          fill="hsl(var(--accent))"
          opacity={0.28}
          barSize={8}
        />
        <Area
          yAxisId="price"
          dataKey="price"
          stroke="none"
          fill="url(#equityGradient)"
          tooltipType="none"
        />
        <Line
          yAxisId="price"
          dataKey="price"
          dot={false}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
        />
        <Line
          yAxisId="price"
          dataKey="ema"
          dot={false}
          stroke="hsl(var(--foreground)/0.62)"
          strokeDasharray="6 4"
          strokeWidth={1.5}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
