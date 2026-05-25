import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-[40rem] w-full flex-col pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="rounded-xl border border-border/30 bg-card p-4 shadow-sm sm:p-6">
        {/* Header row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        {/* Chart selector tabs */}
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>

        {/* Main chart area */}
        <Skeleton className="mb-4 h-[400px] w-full rounded-lg" />

        {/* Bottom metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
