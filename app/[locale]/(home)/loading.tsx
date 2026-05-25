export default function HomeLoading() {
  return (
    <div className="relative min-w-0 overflow-x-clip bg-transparent">

      <main className="relative z-10 mx-auto w-full max-w-[1400px] min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="h-16 w-96 animate-pulse bg-muted/30 rounded mx-auto" />
            <div className="h-4 w-64 animate-pulse bg-muted/40 rounded mx-auto" />
          </div>
        </div>
      </main>
    </div>
  )
}
