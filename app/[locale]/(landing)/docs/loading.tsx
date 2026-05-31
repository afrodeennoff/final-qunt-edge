import { Skeleton } from '@/components/ui/skeleton'

export default function DocsLoading() {
  return (
    <div className="flex gap-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="rounded-xl bg-background/30 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
    </div>
  )
}
