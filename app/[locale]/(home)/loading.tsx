export default function HomeLoading() {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  )
}
