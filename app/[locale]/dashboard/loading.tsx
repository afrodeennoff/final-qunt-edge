'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { CardV2 as Card, CardV2Content as CardContent, CardV2Header as CardHeader } from '@/components/ui/v2'

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
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[350px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function WidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full rounded-lg" />
      </CardContent>
    </Card>
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
      <div className="pt-4 border-t border-border/50 space-y-2">
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
      <aside className="hidden lg:block w-64 border-r border-border/50 p-4">
        <SidebarSkeleton />
      </aside>
      
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
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
