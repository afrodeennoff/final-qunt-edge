'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const SocialProofLazy = dynamic(() => import('./SocialProof'), {
  loading: () => <SocialProofSkeleton />,
})

const FAQSectionLazy = dynamic(() => import('./FAQSection'), {
  loading: () => <SectionSkeleton />,
})

const TrustAndProofLazy = dynamic(() => import('./TrustAndProof'), {
  loading: () => <SectionSkeleton />,
})

function SocialProofSkeleton() {
  return (
    <section className="bg-muted/30 px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto min-w-0 max-w-[1360px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-pulse rounded-lg bg-card/50 p-6">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-4 h-8 w-64 rounded bg-muted" />
            <div className="mt-3 h-4 w-full rounded bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg bg-card/50 p-5">
                <div className="h-10 w-10 rounded-md bg-muted" />
                <div className="mt-4 h-8 w-20 rounded bg-muted" />
                <div className="mt-2 h-3 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionSkeleton() {
  return (
    <section className="px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl animate-pulse">
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
  )
}

export { SocialProofLazy, FAQSectionLazy, TrustAndProofLazy }
