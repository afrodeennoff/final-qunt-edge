import Hero from './Hero'
import LiveStatsStrip from './LiveStatsStrip'
import FeaturesBento from './FeaturesBento'
import ProblemStatement from './ProblemStatement'
import PropFirmsExplorer from './PropFirmsExplorer'
import FinalCTA from './FinalCTA'
import HowItWorks from './HowItWorks'
import AnalysisDemo from './AnalysisDemo'
import AudienceSegmentation from './AudienceSegmentation'
import AIFeatures from './AIFeatures'
import SocialProof from './SocialProof'
import PricingSection from './PricingSection'
import FAQSection from './FAQSection'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import HomeContentLoading from './HomeContentLoading'

interface HomeContentProps {
  locale: string
}

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center p-4"><div className="text-center">Loading content...</div></div>}>
      <div className="home-borderless relative min-w-0 overflow-x-hidden bg-transparent selection:bg-primary/30 selection:text-foreground">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-48 rounded-b-[2.5rem] border border-border/40 bg-background/40 sm:inset-x-6 lg:inset-x-10" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-5 lg:block" />
      <div className="pointer-events-none absolute inset-x-0 top-[22%] h-px bg-border/50" />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] min-w-0 px-4 sm:px-6 lg:px-8">
        <Hero locale={locale} />
        <LiveStatsStrip />
        <SocialProof />
        <ProblemStatement />
        <FeaturesBento />
        <AIFeatures />
        <HowItWorks />
        <AnalysisDemo />
        <AudienceSegmentation />
        <PropFirmsExplorer locale={locale} />
        <PricingSection locale={locale} />
        <FAQSection />
        <FinalCTA locale={locale} />
      </main>
    </div>
    </ErrorBoundary>
  )
}
