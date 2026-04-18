export default function Loading() {
  return (
    <div className="animate-page-enter mx-auto flex w-full max-w-[1720px] flex-col gap-3.5 px-4 py-6 sm:gap-4 sm:px-6 lg:px-8">
      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.92fr)] xl:gap-5">
        <div className="space-y-3.5 sm:space-y-4">
          <div className="h-48 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          <div className="h-64 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          <div className="h-52 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          <div className="h-[38rem] animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
        </div>
        <div className="space-y-3.5 sm:space-y-4">
          <div className="h-80 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          <div className="h-72 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          <div className="h-72 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
        </div>
      </div>
      <div className="h-96 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
    </div>
  )
}
