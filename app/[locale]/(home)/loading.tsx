import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className="relative min-w-0 overflow-x-clip bg-transparent">
      <main className="relative z-10 mx-auto w-full max-w-[1400px] min-w-0 px-4 sm:px-6 lg:px-8">
        {/* Hero section skeleton */}
        <div className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <Skeleton className="mx-auto h-12 w-80 sm:h-16 sm:w-96" />
            <Skeleton className="mx-auto h-4 w-64" />
            <Skeleton className="mx-auto h-4 w-48" />
            <div className="flex items-center justify-center gap-3 pt-2">
              <Skeleton className="h-11 w-36 rounded-full" />
              <Skeleton className="h-11 w-36 rounded-full" />
            </div>
          </div>
        </div>

        {/* Feature grid skeleton */}
        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </main>
    </div>
  )
}
