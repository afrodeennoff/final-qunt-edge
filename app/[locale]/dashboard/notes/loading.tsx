export default function JournalLoading() {
  return (
    <div className="flex h-full overflow-hidden rounded-xl border-0 bg-card/30">
      {/* Sidebar skeleton */}
      <div className="flex w-[320px] shrink-0 flex-col border-r-0 bg-background/20">
        {/* Search skeleton */}
        <div className="border-b-0 p-3">
          <div className="h-8 animate-pulse rounded-lg bg-muted/20" />
        </div>
        {/* Trade list skeleton */}
        <div className="flex-1 space-y-2 p-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/20" />
          ))}
        </div>
      </div>

      {/* Main panel skeleton */}
      <div className="flex-1 p-6">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-32 animate-pulse rounded bg-muted/20" />
            <div className="h-5 w-12 animate-pulse rounded bg-muted/20" />
            <div className="ml-auto h-7 w-24 animate-pulse rounded bg-muted/20" />
          </div>
          <div className="h-px bg-border/15" />
          {/* Fields skeleton */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-muted/20" />
              <div className="h-20 animate-pulse rounded-lg bg-muted/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
