import { Skeleton } from '@/components/ui/skeleton'

export default function NotesLoading() {
  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-[32rem]">
      {/* Notes sidebar */}
      <div className="hidden w-72 shrink-0 flex-col border-r border-border/30 bg-card p-4 sm:flex">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="mb-3 h-9 w-full" />
        <div className="mb-3 flex gap-2">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-14" />
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/30 p-3">
              <Skeleton className="mb-1.5 h-4 w-3/4" />
              <Skeleton className="mb-1 h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 sm:hidden" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="mb-4 h-8 w-2/3" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  )
}
