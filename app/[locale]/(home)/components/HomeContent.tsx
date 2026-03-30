import dynamic from 'next/dynamic'
import Hero from './Hero'
import LiveStatsStrip from './LiveStatsStrip'
import ProblemStatement from './ProblemStatement'
import FeaturesBento from './FeaturesBento'
import HowItWorks from './HowItWorks'
import AudienceSegmentation from './AudienceSegmentation'
import AIFeatures from './AIFeatures'
import SocialProof from './SocialProof'
import ComparisonSection from './ComparisonSection'
import PricingSection from './PricingSection'
import FAQSection from './FAQSection'
import FinalCTA from './FinalCTA'
import RollingAdBanner from './RollingAdBanner'

const SectionSkeleton = () => <div className="min-h-24 w-full" />

const LazyHowItWorks = dynamic(() => import('./HowItWorks'), { loading: SectionSkeleton })
const LazyAnalysisDemo = dynamic(() => import('./AnalysisDemo'), { loading: SectionSkeleton })
const LazyAudienceSegmentation = dynamic(() => import('./AudienceSegmentation'), { loading: SectionSkeleton })
const LazyAIFeatures = dynamic(() => import('./AIFeatures'), { loading: SectionSkeleton })
const LazySocialProof = dynamic(() => import('./SocialProof'), { loading: SectionSkeleton })
const LazyComparisonSection = dynamic(() => import('./ComparisonSection'), { loading: SectionSkeleton })
const LazyPricingSection = dynamic(() => import('./PricingSection'), { loading: SectionSkeleton })
const LazyFAQSection = dynamic(() => import('./FAQSection'), { loading: SectionSkeleton })

interface HomeContentProps {
  locale: string
}

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <div className="relative overflow-x-hidden bg-background selection:bg-primary/30 selection:text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_480px_at_50%_-10%,hsl(var(--foreground)/0.04),transparent_68%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card)/0.2)_36%,hsl(var(--background))_100%)]" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-[0.12] sm:block" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_340px_at_10%_20%,hsl(var(--foreground)/0.03),transparent_70%),radial-gradient(700px_320px_at_92%_6%,hsl(var(--foreground)/0.02),transparent_70%)]" />

      <main className="relative z-10 mx-auto w-full max-w-[1360px]">
        <Hero locale={locale} />
        <LiveStatsStrip />

        <ProblemStatement />
        <FeaturesBento />
        <LazyHowItWorks />
        <LazyAnalysisDemo />
        <LazyAudienceSegmentation />
        <LazyAIFeatures />
        <LazySocialProof />
        <LazyComparisonSection />

        <RollingAdBanner />

        <LazyPricingSection />
        <LazyFAQSection />
        <FinalCTA locale={locale} />
      </main>
    </div>
  )
}
