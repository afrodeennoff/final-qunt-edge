export default function JournalLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Search bar skeleton */}
      <div className="h-8 animate-pulse rounded-lg bg-card/30" />

      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-card/30" />
        ))}
      </div>

      {/* Card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-card/30" />
        ))}
      </div>
    </div>
  )
}
