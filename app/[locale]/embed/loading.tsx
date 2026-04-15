export default function EmbedLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary" />
    </div>
  )
}
