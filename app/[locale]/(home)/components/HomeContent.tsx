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
        <Hero locale={locale} />
        <TrustBar />
        <Problem />
        <Features />
        <LiveInAction />
        <HowItWorks />
        <FinalCTA />
      </main>
    </div>
  )
}
