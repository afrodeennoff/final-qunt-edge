'use client'

import { useEffect } from 'react'

export default function EmbedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[embed]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p className="text-xs text-muted-foreground">Failed to load embedded chart.</p>
    </div>
  )
}
