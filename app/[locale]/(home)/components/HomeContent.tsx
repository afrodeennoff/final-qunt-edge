import dynamic from 'next/dynamic'
import Hero from './Hero'
import LiveStatsStrip from './LiveStatsStrip'
import FeaturesBento from './FeaturesBento'
import ProblemStatement from './ProblemStatement'
import DashboardPreview from './DashboardPreview'
import ComparisonSection from './ComparisonSection'
import RollingAdBanner from './RollingAdBanner'
import PropFirmsExplorer from './PropFirmsExplorer'
import FinalCTA from './FinalCTA'

const SectionSkeleton = () => (
 <div className="min-h-24 w-full animate-pulse rounded-xl bg-muted/20" />
)

const LazyHowItWorks = dynamic(() => import('./HowItWorks'), {
 loading: SectionSkeleton,
})
const LazyAnalysisDemo = dynamic(() => import('./AnalysisDemo'), {
 loading: SectionSkeleton,
})
const LazyAudienceSegmentation = dynamic(
 () => import('./AudienceSegmentation'),
 { loading: SectionSkeleton }
)
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
 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_480px_at_50%_-10%,rgba(255,255,255,0.035),transparent_68%),linear-gradient(180deg,rgba(255,255,255,0.01)_0%,transparent_36%,rgba(255,255,255,0.01)_100%)]" />
 <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-[0.08] sm:block" />
 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_340px_at_10%_20%,rgba(255,255,255,0.02),transparent_70%),radial-gradient(700px_320px_at_92%_6%,rgba(255,255,255,0.015),transparent_70%)]" />
 <div
 className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
 style={{
 backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
 }}
 />

 <main className="relative z-10 mx-auto w-full max-w-[1320px]">
 <Hero locale={locale} />
 <LiveStatsStrip />
 <FeaturesBento />
 <ProblemStatement />
 <DashboardPreview />
 <LazyHowItWorks />
 <LazyAnalysisDemo />
 <LazyAudienceSegmentation />
 <LazyAIFeatures />
 <LazySocialProof />
 <ComparisonSection />
 <RollingAdBanner />
 <PropFirmsExplorer locale={locale} />
 <LazyPricingSection />
 <LazyFAQSection />
 <FinalCTA locale={locale} />
 </main>
 </div>
 )
}
