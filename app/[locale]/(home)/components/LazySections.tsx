import dynamic from 'next/dynamic'

export function SectionSkeleton() {
  return (
    <div className="animate-pulse px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="mx-auto h-4 w-32 rounded bg-muted" />
        <div className="mx-auto h-8 w-80 rounded bg-muted" />
        <div className="mx-auto h-4 w-96 rounded bg-muted" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-card" />
          ))}
        </div>
      </div>
    </div>
  )
}

const SocialProofLazy = dynamic(() => import('./SocialProof'), {
  ssr: true,
  loading: SectionSkeleton,
})

const FAQSectionLazy = dynamic(() => import('./FAQSection'), {
  ssr: true,
  loading: SectionSkeleton,
})

const TrustAndProofLazy = dynamic(() => import('./TrustAndProof'), {
  ssr: true,
  loading: SectionSkeleton,
})

export { SocialProofLazy, FAQSectionLazy, TrustAndProofLazy }
