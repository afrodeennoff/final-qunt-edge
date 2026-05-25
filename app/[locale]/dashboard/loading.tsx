import { Skeleton } from '@/components/ui/skeleton'
import {
  unifiedInsetPanelClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  )
}

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={cn(unifiedInsetPanelClassName, 'p-4')}>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-16 mt-2" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className={cn(unifiedSectionPanelClassName, 'p-4 sm:p-5 lg:col-span-4')}>
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-[350px] w-full rounded-lg" />
    </div>
  )
}

function WidgetSkeleton() {
  return (
    <div className={cn(unifiedInsetPanelClassName, 'p-5')}>
      <Skeleton className="h-5 w-24 mb-4" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
        <div className="pt-4 border-t border-border space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="flex h-full">
      <aside className="hidden lg:block w-64 border-r border-border bg-muted/40 p-4">
        <SidebarSkeleton />
      </aside>

      <main className="flex-1 p-4 lg:p-6 overflow-auto max-w-[2400px] mx-auto">
        <DashboardHeaderSkeleton />
        <StatsGridSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChartSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WidgetSkeleton />
              <WidgetSkeleton />
            </div>
          </div>

          <div className="space-y-6">
            <WidgetSkeleton />
            <WidgetSkeleton />
            <WidgetSkeleton />
          </div>
        </div>
      </main>
    </div>
  )
}
