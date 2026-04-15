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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-background/0 to-background/0" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-[0.05] md:block" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      {/* Atmospheric glow orbs for depth */}
      <div className="pointer-events-none absolute left-[15%] top-[40%] h-[560px] w-[560px] rounded-full bg-primary/[0.03] blur-[120px]" />
      <div className="pointer-events-none absolute right-[10%] top-[65%] h-[480px] w-[480px] rounded-full bg-accent/[0.03] blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-[85%] h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.02] blur-[120px]" />
      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent via-transparent to-background/80" />

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
