import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
      <div className="animate-page-enter mx-auto flex w-full max-w-[2400px] flex-col gap-4 px-4 py-6 sm:gap-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.92fr)] xl:gap-6">
        <div className="space-y-3.5 sm:space-y-4">
          <Skeleton className="h-48 w-full rounded-[calc(var(--radius)+0.45rem)]" />
          <Skeleton className="h-64 w-full rounded-[calc(var(--radius)+0.45rem)]" />
          <Skeleton className="h-52 w-full rounded-[calc(var(--radius)+0.45rem)]" />
          <Skeleton className="h-[38rem] w-full rounded-[calc(var(--radius)+0.45rem)]" />
        </div>
        <div className="space-y-3.5 sm:space-y-4">
          <Skeleton className="h-80 w-full rounded-[calc(var(--radius)+0.45rem)]" />
          <Skeleton className="h-72 w-full rounded-[calc(var(--radius)+0.45rem)]" />
          <Skeleton className="h-72 w-full rounded-[calc(var(--radius)+0.45rem)]" />
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  )
}
