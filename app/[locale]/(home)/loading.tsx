export default function HomeLoading() {
  return (
    <div className="home-borderless relative min-w-0 overflow-x-clip bg-transparent">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-48 rounded-b-[2.5rem] border border-border/40 bg-background/40 sm:inset-x-6 lg:inset-x-10" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-5 lg:block" />
      <div className="pointer-events-none absolute inset-x-0 top-[22%] h-px bg-border/50" />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="h-16 w-96 animate-pulse bg-muted/30 rounded mx-auto" />
            <div className="h-4 w-64 animate-pulse bg-muted/20 rounded mx-auto" />
          </div>
        </div>
      </main>
    </div>
  )
}
