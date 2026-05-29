'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const insetPanelClassName =
  'rounded-xl border border-border/20 bg-gradient-to-br from-muted/50 to-muted/20 ring-1 ring-inset ring-white/[0.02] shadow-none'

interface RadarChartDataPoint {
  metric: string
  trader: number
}

interface RadarChartCardProps {
  radarData: RadarChartDataPoint[]
  isBenchmarkLoading: boolean
  benchmarkSampleSize?: number
}

function RadarChartSkeleton() {
  return (
    <div className={cn(insetPanelClassName, 'p-3')}>
      <Skeleton className="h-64 w-full rounded-lg 2xl:h-80" />
    </div>
  )
}

export default function RadarChartCard({
  radarData,
  isBenchmarkLoading,
  benchmarkSampleSize,
}: RadarChartCardProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Benchmark</p>
        <Badge variant={isBenchmarkLoading ? 'outline' : 'success'}>
          {isBenchmarkLoading ? 'Refreshing' : 'Live'}
        </Badge>
      </div>

      <div className={cn(insetPanelClassName, 'mt-5 p-3')}>
        <div className="h-64 2xl:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <Radar
                dataKey="trader"
                stroke="hsl(var(--foreground) / 0.85)"
                fill="hsl(var(--foreground) / 0.2)"
                fillOpacity={1}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {benchmarkSampleSize
          ? `${benchmarkSampleSize} traders in sample`
          : 'Loading benchmark data...'}
      </p>
    </>
  )
}

export { RadarChartSkeleton }
