'use client'

import dynamic from 'next/dynamic'
import Hero from './Hero'
import LiveStatsStrip from './LiveStatsStrip'
import FeaturesBento from './FeaturesBento'
import ProblemStatement from './ProblemStatement'
import PropFirmsExplorer from './PropFirmsExplorer'
import FinalCTA from './FinalCTA'

const SectionSkeleton = () => (
  <div className="min-h-24 w-full animate-pulse rounded-lg bg-muted/20" />
)

const LazyHowItWorks = dynamic(() => import('./HowItWorks'), {
  loading: SectionSkeleton,
})
const LazyAnalysisDemo = dynamic(() => import('./AnalysisDemo'), {
  loading: SectionSkeleton,
})
const LazyAudienceSegmentation = dynamic(() => import('./AudienceSegmentation'), {
  loading: SectionSkeleton,
})
const LazyAIFeatures = dynamic(() => import('./AIFeatures'), {
  loading: SectionSkeleton,
})
const LazySocialProof = dynamic(() => import('./SocialProof'), {
  loading: SectionSkeleton,
})
const LazyPricingSection = dynamic(() => import('./PricingSection'), {
  loading: SectionSkeleton,
})
const LazyFAQSection = dynamic(() => import('./FAQSection'), {
  loading: SectionSkeleton,
})

interface HomeContentProps {
  locale: string
}

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <div className="home-borderless relative overflow-x-hidden bg-transparent selection:bg-primary/30 selection:text-foreground/95">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-5 lg:block" />
      <div className="pointer-events-none absolute inset-x-0 top-[22%] h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <main className="relative z-10 mx-auto w-full max-w-[1360px]">
        <Hero locale={locale} />
        <LiveStatsStrip />
        <LazySocialProof />
        <ProblemStatement />
        <FeaturesBento />
        <LazyAIFeatures />
        <LazyHowItWorks />
        <LazyAnalysisDemo />
        <LazyAudienceSegmentation />
        <PropFirmsExplorer locale={locale} />
        <LazyPricingSection locale={locale} />
        <LazyFAQSection />
        <FinalCTA locale={locale} />
      </main>
    </div>
  )
}
