import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="w-full space-y-5 p-6">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="flex gap-2"><Skeleton className="h-9 w-24 rounded-lg" /><Skeleton className="h-9 w-24 rounded-lg" /><Skeleton className="h-9 w-24 rounded-lg" /><Skeleton className="h-9 w-24 rounded-lg" /></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  )
}
