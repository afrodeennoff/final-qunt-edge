export default function AuthenticationLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-2xl border border-border/24 bg-card/70 animate-pulse" />
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Loading authentication
          </p>
          <p className="text-sm text-muted-foreground">
            Preparing secure access.
          </p>
        </div>
      </div>
    </main>
  )
}
