'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
      <Card className="max-w-md border-border/24 bg-card/90">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            An unexpected error has occurred. Please try again.
          </p>
          <Button onClick={() => reset?.()} variant="outline">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
