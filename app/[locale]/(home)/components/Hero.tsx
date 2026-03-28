import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BadgeV2 } from "@/components/ui/v2"
import { ButtonV2 } from '@/components/ui/v2'
import DashboardPreview from './DashboardPreview'

export default function Hero({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-[68px] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:72px_72px] opacity-80" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <BadgeV2
          variant="outline"
          className="mb-8 border-border/60 bg-card/50 backdrop-blur-sm rounded-full px-4 py-1.5 animate-fade-in"
        >
          <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-2" />
          <span className="text-[0.8rem] tracking-wide">Live Decision Telemetry</span>
        </BadgeV2>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.035em] leading-[1.08] mb-7 text-foreground animate-fade-in-delayed">
          Build repeatable edge.
          <br />
          <span className="text-gradient-primary">Eliminate emotional drift.</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-delayed-2">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline
          in one review surface. Every session gets a precise diagnosis.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 animate-fade-in-delayed-3">
          <ButtonV2
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 btn-primary-glow rounded-xl px-7 h-12 text-[0.95rem] font-medium w-full sm:w-auto"
          >
            <Link href={`/${locale}/authentication?next=dashboard`}>
              Start Free Audit
            </Link>
          </ButtonV2>
          <ButtonV2
            asChild
            size="lg"
            variant="outline"
            className="border-border/60 text-foreground hover:bg-card/80 rounded-xl px-7 h-12 text-[0.95rem] w-full sm:w-auto group transition-all duration-200"
          >
            <Link href={`/${locale}/#demo`}>
              Watch Demo
              <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </ButtonV2>
        </div>

        <p className="text-[0.8rem] text-muted-foreground/70 tracking-wide animate-fade-in-delayed-3">
          No credit card required · First audit in minutes
        </p>
      </div>
      
      <div className="relative z-10 w-full mt-14 pb-10">
        <DashboardPreview />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 py-7 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground/70">
          {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'NinjaTrader'].map((broker) => (
            <span
              key={broker}
              className={broker === 'NinjaTrader'
                ? 'text-primary font-medium'
                : 'hover:text-foreground transition-colors duration-200'}
            >
              {broker}
            </span>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
    </section>
  )
}
