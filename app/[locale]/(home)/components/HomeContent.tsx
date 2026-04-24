import dynamic from 'next/dynamic'
import Hero from './Hero'
import FeaturesBento from './FeaturesBento'
import HowItWorks from './HowItWorks'
import FinalCTA from './FinalCTA'

const ProductDemo = dynamic(() => import('./ProductDemo'))

const LiveStatsStrip = dynamic(() => import('./LiveStatsStrip'), {
  loading: () => (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 text-center">
              <div className="mx-auto h-10 w-24 animate-pulse rounded bg-muted/30" />
              <div className="mx-auto h-4 w-16 animate-pulse rounded bg-muted/30" />
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
})

const PricingSection = dynamic(() => import('./PricingSection'), {
  loading: () => (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-border/35 bg-muted/20" />
          ))}
        </div>
      </div>
    </section>
  ),
})

interface HomeContentProps {
  locale: string
}

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <div className="home-borderless relative flex min-w-0 flex-1 flex-col overflow-x-hidden bg-transparent selection:bg-primary/30 selection:text-foreground">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-48 rounded-b-[2.5rem] border border-border/40 bg-background/40 sm:inset-x-6 lg:inset-x-10" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-5 lg:block" />
      <div className="pointer-events-none absolute inset-x-0 top-[22%] h-px bg-border/50" />

      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col px-4 sm:px-6 lg:px-8">
        <Hero locale={locale} />
        <FeaturesBento />
        <ProductDemo />
        <LiveStatsStrip />
        <HowItWorks />
        <PricingSection locale={locale} />
        <FinalCTA locale={locale} />
      </main>
    </div>
  )
}
