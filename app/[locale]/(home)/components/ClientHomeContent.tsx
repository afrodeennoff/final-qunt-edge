"use client"

import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('./Hero'), {
  ssr: false,
  loading: () => (
    <section className="relative min-h-[90vh] overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-36 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex justify-center">
          <div className="h-10 w-64 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="h-20 w-full rounded-lg bg-muted animate-pulse" />
          <div className="mt-4 h-20 w-4/5 mx-auto rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    </section>
  ),
})

const ProofStrip = dynamic(() => import('./ProofStrip'), {
  ssr: false,
  loading: () => <div className="h-24 animate-pulse bg-muted/20" />,
})

interface ClientHomeContentProps {
  locale: string
}

export default function ClientHomeContent({ locale }: ClientHomeContentProps) {
  return (
    <>
      <Hero locale={locale} />
      <ProofStrip />
    </>
  )
}
