import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Download,
  FileText,
  LineChart,
  NotebookTabs,
  Play,
  Shield,
  Target,
  Users,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/v2'
import {
  MarketingFeatureCard,
  MarketingHyperframe,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatBlock,
  MarketingStepCard,
  marketingBodyClassName,
  marketingHeroTitleClassName,
  marketingSectionTitleClassName,
} from '@/components/layout/marketing-sections'
import { MarketingPricingSection } from '@/components/layout/marketing-pricing-section'
import { getI18n } from '@/locales/server'
import { cn } from '@/lib/utils'
import ProductDemoPlayer from './ProductDemoPlayer'
import { SocialProofLazy, FAQSectionLazy, TrustAndProofLazy } from './LazySections'

interface HomeContentProps {
  locale: string
}

export default function HomeContent({ locale }: HomeContentProps) {
  return (
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
  )
}
