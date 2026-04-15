'use client'

import { useEffect } from 'react'

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[home-error]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        Something went wrong loading this page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-white/[0.06] bg-card/70 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card"
      >
        Try again
      </button>
    </div>
  )
}
