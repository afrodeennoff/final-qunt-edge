'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

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

const TOOLTIP_LABELS: Record<string, string> = {
  price: 'Price',
  ema: 'EMA',
  volume: 'Volume',
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
  if (!active || !payload?.length) return null

  // Dedupe by dataKey so price isn't shown twice (Area + Line share `price`).
  const byKey = new Map<string, TooltipEntry>()
  for (const entry of payload) {
    const key = String(entry.dataKey ?? entry.name ?? '')
    if (!key) continue
    byKey.set(key, entry)
  }

  const orderedKeys = ['price', 'ema', 'volume']
  const orderedEntries = orderedKeys
    .map((key) => byKey.get(key))
    .filter((entry): entry is TooltipEntry => Boolean(entry))

  return (
    <div
      className="min-w-[148px] rounded-md border px-3 py-2 text-xs shadow-xl"
      style={{
        background: 'hsl(var(--mk-surface)/0.96)',
        borderColor: 'hsl(var(--mk-border)/0.72)',
        color: 'hsl(var(--mk-text))',
      }}
    >
      <div className="mb-1 border-b pb-1 text-[11px] font-semibold" style={{ borderColor: 'hsl(var(--mk-border)/0.45)' }}>
        {String(label ?? '')}
      </div>
      <div className="space-y-1">
        {orderedEntries.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? '')
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span style={{ color: 'hsl(var(--mk-text-muted))' }}>{TOOLTIP_LABELS[key] ?? key}</span>
              <span className="font-semibold">{formatTooltipValue(entry.value ?? '')}</span>
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
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--brand-primary))" stopOpacity={0.28} />
            <stop offset="95%" stopColor="hsl(var(--brand-primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(var(--mk-border)/0.42)" strokeDasharray="3 3" />
        <XAxis dataKey="time" axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--mk-text-muted)/0.95)" />
        <YAxis yAxisId="price" axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--mk-text-muted)/0.95)" />
        <YAxis yAxisId="volume" hide />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--mk-border)/0.78)' }}
          content={<AnalysisChartTooltip />}
        />
        <Bar yAxisId="volume" dataKey="volume" fill="hsl(var(--brand-secondary))" opacity={0.34} barSize={8} />
        <Area yAxisId="price" dataKey="price" stroke="none" fill="url(#chartArea)" tooltipType="none" />
        <Line yAxisId="price" dataKey="price" dot={false} stroke="hsl(var(--brand-primary))" strokeWidth={2} />
        <Line yAxisId="price" dataKey="ema" dot={false} stroke="hsl(var(--mk-text-muted)/0.92)" strokeDasharray="6 4" strokeWidth={1.5} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
