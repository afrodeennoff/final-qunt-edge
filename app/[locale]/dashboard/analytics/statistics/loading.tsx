import { Skeleton } from '@/components/ui/skeleton'

export default function StatisticsLoading() {
  return (
    <div className="space-y-6 p-4">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}
