export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.92fr)]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="h-56 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
            <div className="h-56 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          </div>
          <div className="h-24 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          <div className="h-52 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          <div className="h-[28rem] animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
        </div>
        <div className="space-y-4">
          <div className="h-80 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          <div className="h-72 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
          <div className="h-72 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
        </div>
      </div>
      <div className="h-96 animate-pulse rounded-[calc(var(--radius)+0.45rem)] border border-border/45 bg-card/55" />
    </div>
  )
}
