'use client'

import { useEffect } from 'react'
import { ButtonV2, CardV2, CardV2Content } from '@/components/ui/v2'

export default function LandingError({
  error,
  reset,
}: {
  error?: Error & { digest?: string }
  reset?: () => void
}) {
  useEffect(() => {
    console.warn(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <CardV2 className="max-w-md border-border/60 bg-card/90">
        <CardV2Content className="flex flex-col items-center gap-4 py-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            An unexpected error has occurred. Please try again.
          </p>
          <ButtonV2 onClick={() => reset?.()} variant="outline">
            Try again
          </ButtonV2>
        </CardV2Content>
      </CardV2>
    </div>
  )
}
