'use client'

import { useState, useEffect, useRef } from 'react'

const PROMO_SRC = '/hyperframes/qunt-edge-promo/index.html'

export default function ProductDemoPlayer() {
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
        }
      },
      { rootMargin: '200px' } // Start loading when 200px away from viewport
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load product demo.
          </p>
          <button
            onClick={() => { setShouldLoad(false); setHasError(false); setTimeout(() => setShouldLoad(true), 100) }}
            className="mt-3 text-xs font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full items-center justify-center bg-background min-h-[400px]"
    >
      {shouldLoad ? (
        <iframe
          title="Qunt Edge product promo"
          src={PROMO_SRC}
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-muted mb-4" />
          <p className="text-sm text-muted-foreground">
            Product demo will load when you scroll near
          </p>
        </div>
      )}
    </div>
  )
}