import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className="relative min-w-0 overflow-x-clip bg-transparent">
      <main className="relative z-10 mx-auto w-full max-w-[1280px] min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="pt-28 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <Skeleton className="mx-auto h-12 w-32 rounded-full" />
            <Skeleton className="mx-auto h-16 w-[min(100%,36rem)] rounded-xl" />
            <Skeleton className="mx-auto h-4 w-72" />
            <div className="flex items-center justify-center gap-3 pt-2">
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </main>
    </div>
  )
}
