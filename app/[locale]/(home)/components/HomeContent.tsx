import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Hero from './Hero'
import LiveStatsStrip from './LiveStatsStrip'
import SocialProof from './SocialProof'
import ErrorBoundary from '@/components/ui/error-boundary'
import type { ReactNode } from 'react'
import { getUnifiedFirms } from '@/server/deals'

function SafeSection({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={null}>
      {children}
    </ErrorBoundary>
  )
}

function SectionSkeleton() {
  return (
    <div className="py-10 sm:py-12">
      <div className="animate-pulse rounded-lg border border-border bg-card p-6">
        <div className="mx-auto max-w-md space-y-3">
          <div className="h-3 w-20 rounded bg-muted/60" />
          <div className="h-7 w-full rounded bg-muted/50" />
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

async function PropFirmsExplorerSection({ locale }: { locale: string }) {
  const firms = await getUnifiedFirms().catch(() => [])
  return <PropFirmsExplorer locale={locale} firms={firms} />
}

interface HomeContentProps {
  locale: string
}

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <div className="relative min-w-0 overflow-x-hidden bg-transparent selection:bg-primary/30 selection:text-foreground">
      <main className="relative z-10 mx-auto w-full max-w-[1280px] min-w-0 px-4 sm:px-6 lg:px-8">
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
          <Suspense fallback={<SectionSkeleton />}>
            <PropFirmsExplorerSection locale={locale} />
          </Suspense>
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
