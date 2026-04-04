import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <Skeleton className="h-8 w-1/4 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded" />
          <Skeleton className="h-32 rounded" />
          <Skeleton className="h-32 rounded" />
        </div>
        <Skeleton className="h-80 rounded" />
      </div>
    </div>
  )
}
