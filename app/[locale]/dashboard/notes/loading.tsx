export default function JournalLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Stats bar skeleton */}
      <div className="shrink-0 px-5 pb-4 pt-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-lg bg-muted/10 px-3 py-2.5">
              <div className="h-4 w-4 animate-pulse rounded bg-muted/20" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-14 animate-pulse rounded bg-muted/20" />
                <div className="h-3.5 w-10 animate-pulse rounded bg-muted/20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main split skeleton */}
      <div className="flex flex-1 overflow-hidden rounded-xl bg-card/30">
        {/* Sidebar skeleton */}
        <div className="flex w-[340px] shrink-0 flex-col bg-background/20">
          <div className="space-y-2.5 p-3">
            <div className="h-8 animate-pulse rounded-lg bg-muted/15" />
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-5 w-14 animate-pulse rounded-full bg-muted/15" />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-1 px-2 py-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-xl bg-muted/10" />
            ))}
          </div>
        </div>

        {/* Main panel skeleton */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-28 animate-pulse rounded bg-muted/15" />
              <div className="h-5 w-12 animate-pulse rounded-md bg-muted/15" />
              <div className="ml-auto h-6 w-20 animate-pulse rounded bg-muted/15" />
            </div>
            <div className="flex gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-16 animate-pulse rounded bg-muted/10" />
              ))}
            </div>
            <div className="h-px bg-muted/10" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded bg-muted/15" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted/15" />
                </div>
                <div className="h-20 animate-pulse rounded-lg bg-muted/8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
