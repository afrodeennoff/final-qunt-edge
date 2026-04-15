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

interface HomeContentProps {
  locale: string
}

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <div className="home-borderless relative min-w-0 overflow-x-hidden bg-transparent selection:bg-primary/30 selection:text-foreground/95">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-5 lg:block" />
      <div className="pointer-events-none absolute inset-x-0 top-[22%] h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <main className="relative z-10 mx-auto w-full max-w-[1360px] min-w-0">
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
  )
}
