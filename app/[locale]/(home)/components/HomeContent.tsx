import Hero from './Hero'
import FeaturesBento from './FeaturesBento'
import HowItWorks from './HowItWorks'
import FinalCTA from './FinalCTA'
import LiveStatsStrip from './LiveStatsStrip'
import PricingSection from './PricingSection'
import ProductDemo from './ProductDemo'

interface HomeContentProps {
  locale: string
}

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <div className="home-borderless relative flex min-w-0 flex-1 flex-col overflow-x-hidden bg-black selection:bg-primary/30 selection:text-foreground">
      <main className="relative z-10 flex w-full min-w-0 flex-1 flex-col">
        <Hero locale={locale} />
        <ProductDemo />
        <FeaturesBento />
        <LiveStatsStrip />
        <HowItWorks />
        <PricingSection locale={locale} />
        <FinalCTA locale={locale} />
      </main>
    </div>
  )
}
