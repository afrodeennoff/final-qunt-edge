'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BadgeV2 } from "@/components/ui/v2"
import DashboardPreview from './DashboardPreview'

export default function Hero({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <BadgeV2
          variant="outline"
          className="mb-6 border-border bg-card/50 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-2" />
          Live Decision Telemetry
        </BadgeV2>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
          Build repeatable edge.
          <br />
          <span className="text-primary">Eliminate emotional drift.</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline
          in one review surface. Every session gets a precise diagnosis.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 btn-primary-glow"
          >
            <Link href={`/${locale}/authentication?next=dashboard`}>
              Start Free Audit
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-card"
          >
            <Link href={`/${locale}/#demo`}>
              Watch Demo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          No credit card required • First audit in minutes
        </p>
      </div>
      
      <div className="relative z-10 w-full mt-12 pb-12">
        <DashboardPreview />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 py-8 bg-gradient-to-t from-background to-transparent">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
          {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'NINJA|TRADER'].map((broker) => (
            <span
              key={broker}
              className={broker === 'NINJA|TRADER'
                ? 'text-primary font-medium'
                : 'hover:text-foreground transition-colors'}
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
