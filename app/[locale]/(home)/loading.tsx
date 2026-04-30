export default function HomeLoading() {
  return (
    <div className="relative flex min-h-[80vh] flex-1 flex-col items-center justify-center gap-6 overflow-hidden bg-background px-4">
      {/* Subtle top glow accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/[0.03] to-transparent" />

      {/* Branded spinner */}
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-[2.5px] border-[oklch(0.65_0.22_260_/_0.1)] border-t-primary" />
      </div>

      {/* Skeleton content preview */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-3 pt-2">
        <div className="h-2.5 w-24 rounded-full bg-[oklch(0.65_0.22_260_/_0.08)]" />
        <div className="h-3 w-48 rounded-full bg-[oklch(0.65_0.22_260_/_0.06)]" />
        <div className="mx-auto h-2 w-36 rounded-full bg-[oklch(0.65_0.22_260_/_0.05)]" />
      </div>
    </div>
  )
}
