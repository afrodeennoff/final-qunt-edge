'use client'

import { useState } from 'react'

const PROMO_SRC = '/hyperframes/qunt-edge-promo/index.html'

export default function ProductDemoPlayer() {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-border/10 bg-card/50 p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load product demo.
          </p>
          <button
            onClick={() => setHasError(false)}
            className="mt-3 text-xs font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-background">
      <iframe
        title="Qunt Edge product promo"
        src={PROMO_SRC}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        sandbox="allow-scripts"
        onError={() => setHasError(true)}
      />
    </div>
  )
}
