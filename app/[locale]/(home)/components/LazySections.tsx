import dynamic from 'next/dynamic'

const SocialProofLazy = dynamic(() => import('./SocialProof'), {
  ssr: true,
  loading: () => (
    <section className="bg-muted/30 px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto min-w-0 max-w-[1360px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-card/50 p-6">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-4 h-8 w-64 rounded bg-muted" />
            <div className="mt-3 h-4 w-full rounded bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-card/50 p-5">
                <div className="h-10 w-10 rounded-md bg-muted" />
                <div className="mt-4 h-8 w-20 rounded bg-muted" />
                <div className="mt-2 h-3 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  ),
})

const FAQSectionLazy = dynamic(() => import('./FAQSection'), {
  ssr: true,
  loading: () => (
    <section className="px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 h-4 w-32 rounded bg-muted" />
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/30 bg-card/50 p-6">
              <div className="h-10 w-10 rounded-xl bg-muted" />
              <div className="mt-4 h-5 w-32 rounded bg-muted" />
              <div className="mt-2 h-3 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
})

const TrustAndProofLazy = dynamic(() => import('./TrustAndProof'), {
  ssr: true,
  loading: () => (
    <section className="bg-muted/50 px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border/30 bg-card/50 p-6">
              <div className="h-8 w-8 rounded bg-muted" />
              <div className="mt-4 h-5 w-24 rounded bg-muted" />
              <div className="mt-3 h-3 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
})

export { SocialProofLazy, FAQSectionLazy, TrustAndProofLazy }

