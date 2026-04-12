export default function AuthenticationLoading() {
 return (
 <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground/95">
 <div className="flex flex-col items-center gap-4 text-center">
 <div className="h-12 w-12 rounded-xl border border-white/[0.06] bg-white/[0.070] animate-pulse" />
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
