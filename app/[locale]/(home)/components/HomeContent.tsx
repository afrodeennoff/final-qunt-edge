import dynamic from 'next/dynamic'
import Hero from './Hero'
import LiveStatsStrip from './LiveStatsStrip'
import SocialProof from './SocialProof'
import ErrorBoundary from '@/components/ui/error-boundary'
import type { ReactNode } from 'react'
import type { UnifiedFirm } from '@/server/deals'

function SafeSection({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={null}>
      {children}
    </ErrorBoundary>
  )
}

function SectionSkeleton() {
  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="animate-pulse rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-8">
        <div className="mx-auto max-w-md space-y-4">
          <div className="h-4 w-24 rounded bg-muted/60" />
          <div className="h-8 w-full rounded bg-muted/60" />
          <div className="h-4 w-3/4 rounded bg-muted/40" />
        </div>
      </div>
    </div>
  )
}

const ProblemStatement = dynamic(() => import('./ProblemStatement'), {
  loading: () => <SectionSkeleton />,
})
const FeaturesBento = dynamic(() => import('./FeaturesBento'), {
  loading: () => <SectionSkeleton />,
})
const AIFeatures = dynamic(() => import('./AIFeatures'), {
  loading: () => <SectionSkeleton />,
})
const HowItWorks = dynamic(() => import('./HowItWorks'), {
  loading: () => <SectionSkeleton />,
})
const AnalysisDemo = dynamic(() => import('./AnalysisDemo'), {
  loading: () => <SectionSkeleton />,
})
const AudienceSegmentation = dynamic(() => import('./AudienceSegmentation'), {
  loading: () => <SectionSkeleton />,
})
const PropFirmsExplorer = dynamic(() => import('./PropFirmsExplorer'), {
  loading: () => <SectionSkeleton />,
})
const PricingSection = dynamic(() => import('./PricingSection'), {
  loading: () => <SectionSkeleton />,
})
const FAQSection = dynamic(() => import('./FAQSection'), {
  loading: () => <SectionSkeleton />,
})
const FinalCTA = dynamic(() => import('./FinalCTA'), {
  loading: () => <SectionSkeleton />,
})

interface HomeContentProps {
  locale: string
  firms?: UnifiedFirm[]
}

export default function HomeContent({ locale, firms }: HomeContentProps) {
  return (
    <div className="relative min-w-0 overflow-x-clip bg-transparent selection:bg-primary/30 selection:text-foreground">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-48 rounded-b-[2.5rem] bg-[oklch(0.65_0.22_260/0.02)] sm:inset-x-6 lg:inset-x-10" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-5 lg:block" />
      <div className="pointer-events-none absolute inset-x-0 top-[22%] h-px bg-[oklch(0.65_0.22_260/0.08)]" />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] min-w-0 px-4 sm:px-6 lg:px-8">
        {/* Above the fold - critical, always render */}
        <Hero locale={locale} />
        <LiveStatsStrip />
        <SocialProof />

        {/* Each section wrapped independently so one failure never kills siblings or the hero */}
        <SafeSection>
          <ProblemStatement />
        </SafeSection>
        <SafeSection>
          <FeaturesBento />
        </SafeSection>
        <SafeSection>
          <AIFeatures />
        </SafeSection>
        <SafeSection>
          <HowItWorks />
        </SafeSection>
        <SafeSection>
          <AnalysisDemo />
        </SafeSection>
        <SafeSection>
          <AudienceSegmentation />
        </SafeSection>
        <SafeSection>
          <PropFirmsExplorer locale={locale} firms={firms} />
        </SafeSection>
        <SafeSection>
          <PricingSection locale={locale} />
        </SafeSection>
        <SafeSection>
          <FAQSection />
        </SafeSection>
        <SafeSection>
          <FinalCTA locale={locale} />
        </SafeSection>
      </main>
    </div>
  )
}
