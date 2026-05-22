'use client'

import { UnifiedSurface } from '@/components/layout/unified-page-shell'
import { cn } from '@/lib/utils'

const insetPanelClassName =
  'rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] shadow-none'

export function MetricsSkeleton() {
  return (
    <aside className="space-y-4">
      {/* Benchmark skeleton */}
      <UnifiedSurface variant="elevated" className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="h-3 w-20 animate-pulse rounded-lg bg-muted/30" />
          <div className="h-5 w-14 animate-pulse rounded-md bg-muted/30" />
        </div>
        <div className={cn(insetPanelClassName, 'mt-5 p-3')}>
          <div className="h-64 w-full animate-pulse rounded-lg bg-muted/30" />
        </div>
        <div className="mt-3 h-3 w-36 animate-pulse rounded bg-muted/30" />
      </UnifiedSurface>

      {/* Capital snapshot skeleton */}
      <UnifiedSurface className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded bg-muted/30" />
          <div className="h-3 w-28 animate-pulse rounded bg-muted/30" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(insetPanelClassName, 'p-4')}>
              <div className="h-2.5 w-16 animate-pulse rounded bg-muted/30" />
              <div className="mt-2 h-6 w-20 animate-pulse rounded bg-muted/30" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className={cn(insetPanelClassName, 'p-4')}>
            <div className="flex items-center justify-between gap-3">
              <div className="h-3 w-20 animate-pulse rounded bg-muted/30" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted/30" />
            </div>
            <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-muted/30" />
          </div>
        </div>
      </UnifiedSurface>

      {/* Execution quality skeleton */}
      <UnifiedSurface className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded bg-muted/30" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted/30" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(insetPanelClassName, 'p-4')}>
              <div className="h-2.5 w-20 animate-pulse rounded bg-muted/30" />
              <div className="mt-2 h-6 w-16 animate-pulse rounded bg-muted/30" />
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn(insetPanelClassName, 'p-4')}>
              <div className="flex items-center justify-between gap-3">
                <div className="h-3 w-20 animate-pulse rounded bg-muted/30" />
                <div className="h-4 w-14 animate-pulse rounded bg-muted/30" />
              </div>
              <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-muted/30" />
            </div>
          ))}
        </div>
      </UnifiedSurface>
    </aside>
  )
}

export function TableSkeleton() {
  return (
    <UnifiedSurface className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="h-3 w-24 animate-pulse rounded-lg bg-muted/30" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-muted/30" />
      </div>
      <div className="mt-5 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              insetPanelClassName,
              'flex items-center justify-between gap-3 p-4 animate-pulse',
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-3.5 w-3.5 rounded-full bg-muted/30" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-muted/30" />
                <div className="h-2.5 w-36 rounded bg-muted/30" />
              </div>
            </div>
            <div className="h-3 w-14 rounded bg-muted/30" />
          </div>
        ))}
      </div>
    </UnifiedSurface>
  )
}

export function CalendarSkeleton() {
  return (
    <div
      className={cn(
        insetPanelClassName,
        'min-h-[30rem] overflow-x-auto p-2 sm:p-3 lg:min-h-[36rem] 2xl:min-h-[42rem] animate-pulse',
      )}
    >
        <div className="flex min-h-[26rem] flex-col gap-4 lg:min-h-[31rem] 2xl:min-h-[38rem]">
        {/* Month header skeleton */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="h-4 w-28 rounded bg-muted/30" />
        </div>
        {/* Weekday headers skeleton */}
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-4 w-11 sm:w-12 rounded bg-muted/30" />
          ))}
        </div>
        {/* Day grid skeleton */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-11 w-11 rounded-lg bg-muted/20 sm:h-12 sm:w-12" />
          ))}
        </div>
      </div>
    </div>
  )
}
