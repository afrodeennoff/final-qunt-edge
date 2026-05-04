'use client'

export default function HomeLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero Section */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        {/* Hero Title Skeleton */}
        <div className="mb-6 space-y-4">
          <div className="h-16 w-3/4 rounded-lg bg-muted" />
          <div className="h-8 w-1/2 rounded-lg bg-muted" />
        </div>

        {/* Hero Description Skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
        </div>

        {/* CTA Buttons */}
        <div className="mb-16 flex gap-4">
          <div className="h-10 w-32 rounded-lg bg-muted" />
          <div className="h-10 w-32 rounded-lg bg-muted" />
        </div>

        {/* Hero Image Skeleton */}
        <div className="mb-20 aspect-video rounded-xl bg-muted" />
      </div>

      {/* Features Section */}
      <div className="bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          {/* Section Title */}
          <div className="mb-12 space-y-3 text-center">
            <div className="mx-auto h-10 w-1/2 rounded-lg bg-muted" />
            <div className="mx-auto h-4 w-2/3 rounded bg-muted" />
          </div>

          {/* Feature Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4 rounded-lg bg-background p-6">
                <div className="h-10 w-10 rounded bg-muted" />
                <div className="h-6 w-3/4 rounded bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-5/6 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-10 w-1/2 rounded-lg bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 h-10 w-full rounded-lg bg-muted" />
          <div className="mb-8 space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
          </div>
          <div className="h-10 w-40 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}
