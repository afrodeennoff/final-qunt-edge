import Hero from './Hero'
import LiveStatsStrip from './LiveStatsStrip'
import FeaturesBento from './FeaturesBento'
import HowItWorks from './HowItWorks'
import AnalysisDemo from './AnalysisDemo'
import SocialProof from './SocialProof'
import ComparisonSection from './ComparisonSection'
import RollingAdBanner from './RollingAdBanner'
import PricingSection from './PricingSection'
import FAQSection from './FAQSection'
import FinalCTA from './FinalCTA'

interface HomeContentProps {
  locale: string
}

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <div className="home-borderless relative overflow-x-hidden bg-background selection:bg-primary/30 selection:text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_480px_at_50%_-10%,hsl(var(--foreground)/0.04),transparent_68%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card)/0.2)_36%,hsl(var(--background))_100%)]" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-[0.12] sm:block" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_340px_at_10%_20%,hsl(var(--foreground)/0.03),transparent_70%),radial-gradient(700px_320px_at_92%_6%,hsl(var(--foreground)/0.02),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-mesh-animated opacity-20" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
          zIndex: 9999,
        }}
      />

      <main className="relative z-10 mx-auto w-full max-w-[1360px]">
        <Hero locale={locale} />
        <LiveStatsStrip />
        <FeaturesBento />
        <HowItWorks />
        <AnalysisDemo />
        <SocialProof />
        <ComparisonSection />
        <RollingAdBanner />
        <PricingSection />
        <FAQSection />
        <FinalCTA locale={locale} />
      </main>
    </div>
  )
}
