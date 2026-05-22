export default function Loading() {
  return (
      <div className="animate-page-enter mx-auto flex w-full max-w-[2400px] flex-col gap-4 px-4 py-6 sm:gap-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.92fr)] xl:gap-6">
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
      <div className="h-96 animate-pulse rounded-2xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.052_0.009_260_/_0.72)]" />
    </div>
  )
}
