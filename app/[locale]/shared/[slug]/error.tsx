'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function SharedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[shared-view]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm text-muted-foreground">
        This shared link may have expired or been removed by the owner.
      </p>
      <Button variant="outline" onClick={reset} className="rounded-full">
        Try again
      </Button>
    </div>
  )
}
