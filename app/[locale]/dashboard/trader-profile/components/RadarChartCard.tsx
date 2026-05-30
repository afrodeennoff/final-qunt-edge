'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const insetPanelClassName =
  'rounded-xl bg-muted/30 border-0 shadow-none'

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
              <PolarGrid stroke="transparent" strokeOpacity={0} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: 'var(--muted-foreground)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <Radar
                dataKey="trader"
                stroke="color-mix(in srgb, var(--foreground) 85%, transparent)"
                fill="color-mix(in srgb, var(--foreground) 20%, transparent)"
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
