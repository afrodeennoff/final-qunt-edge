'use client'

import { UnifiedSurface } from '@/components/layout/unified-page-shell'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const insetPanelClassName =
  'rounded-xl bg-muted/30 border border-border/10 shadow-none'

export function MetricsSkeleton() {
  return (
    <aside className="space-y-4">
      {/* Benchmark skeleton */}
      <UnifiedSurface variant="elevated" className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-3 w-20 rounded-lg" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
        <div className={cn(insetPanelClassName, 'mt-5 p-3')}>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <Skeleton className="mt-3 h-3 w-36 rounded" />
      </UnifiedSurface>

      {/* Capital snapshot skeleton */}
      <UnifiedSurface className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(insetPanelClassName, 'p-4')}>
              <Skeleton className="h-2.5 w-16 rounded" />
              <Skeleton className="mt-2 h-6 w-20 rounded" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className={cn(insetPanelClassName, 'p-4')}>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <Skeleton className="mt-3 h-2 w-full rounded-full" />
          </div>
        </div>
      </UnifiedSurface>

      {/* Execution quality skeleton */}
      <UnifiedSurface className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(insetPanelClassName, 'p-4')}>
              <Skeleton className="h-2.5 w-20 rounded" />
              <Skeleton className="mt-2 h-6 w-16 rounded" />
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn(insetPanelClassName, 'p-4')}>
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-4 w-14 rounded" />
              </div>
              <Skeleton className="mt-3 h-2 w-full rounded-full" />
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
        <Skeleton className="h-3 w-24 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="mt-5 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              insetPanelClassName,
              'flex items-center justify-between gap-3 p-4',
            )}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-2.5 w-36 rounded" />
              </div>
            </div>
            <Skeleton className="h-3 w-14 rounded" />
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
        'min-h-[30rem] overflow-x-auto p-2 sm:p-3 lg:min-h-[36rem] 2xl:min-h-[42rem]',
      )}
    >
        <div className="flex min-h-[26rem] flex-col gap-4 lg:min-h-[31rem] 2xl:min-h-[38rem]">
        {/* Month header skeleton */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        {/* Weekday headers skeleton */}
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-4 w-11 sm:w-12 rounded" />
          ))}
        </div>
        {/* Day grid skeleton */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-11 rounded-lg sm:h-12 sm:w-12" />
          ))}
        </div>
      </div>
    </div>
  )
}
