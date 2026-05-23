import Hero from './Hero'
import { TrustBar } from './TrustBar'
import { Problem } from './Problem'
import { Features } from './Features'
import { LiveInAction } from './LiveInAction'
import { HowItWorks } from './HowItWorks'
import { FinalCTA } from './FinalCTA'

export default function HomeContent({ locale }: { locale: string }) {
  return (
    <div className="relative min-w-0 overflow-x-hidden bg-transparent selection:bg-primary/30 selection:text-foreground">
      <main className="relative z-10 mx-auto w-full max-w-[1280px] min-w-0 px-4 sm:px-6 lg:px-8">
        {/* 1. Hero - Locked (Ultra-Modern SaaS) */}
        <Hero locale={locale} />

        {/* 2. Trust Bar (T1 - Metrics + Logos) */}
        <TrustBar />

        {/* 3. Problem */}
        <Problem />

        {/* 4. Features (new modern version) */}
        <Features />

        {/* 5. Live in Action (L2 — Video first, cinematic) */}
        <LiveInAction />

        {/* 6. How It Works (3 steps, modern) */}
        <HowItWorks />

        {/* 7. Final CTA (strong, premium close) */}
        <FinalCTA />
      </main>
    </div>
  )
}

