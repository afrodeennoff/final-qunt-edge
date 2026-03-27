'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BadgeV2 } from "@/components/ui/v2"
import DashboardPreview from './DashboardPreview'

export default function Hero({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(41,98,255,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,26,33,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,26,33,0.5)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <BadgeV2
          variant="outline"
          className="mb-6 border-[#1A1A21] bg-[#0b0b0d]/50 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse mr-2" />
          Live Decision Telemetry
        </BadgeV2>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[#E0E0E0]">
          Build repeatable edge.
          <br />
          <span className="text-[#2962FF]">Eliminate emotional drift.</span>
        </h1>
        
        <p className="text-xl text-[#9E9E9E] max-w-2xl mx-auto mb-8">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline 
          in one review surface. Every session gets a precise diagnosis.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <ButtonV2 
            asChild
            size="lg"
            className="bg-[#2962FF] hover:bg-[#2962FF]/90 btn-primary-glow"
          >
            <Link href={`/${locale}/authentication?next=dashboard`}>
              Start Free Audit
            </Link>
          </ButtonV2>
          <ButtonV2 
            asChild
            size="lg"
            variant="outline"
            className="border-[#1A1A21] text-[#E0E0E0] hover:bg-[#0b0b0d]"
          >
            <Link href={`/${locale}/#demo`}>
              Watch Demo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </ButtonV2>
        </div>
        
        <p className="text-sm text-[#707070]">
          No credit card required • First audit in minutes
        </p>
      </div>
      
      <div className="relative z-10 w-full mt-12 pb-12">
        <DashboardPreview />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 py-8 bg-gradient-to-t from-[#050505] to-transparent">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-[#707070]">
          {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'NINJA|TRADER'].map((broker) => (
            <span
              key={broker}
              className={broker === 'NINJA|TRADER' 
                ? 'text-[#2962FF] font-medium' 
                : 'hover:text-[#E0E0E0] transition-colors'}
            >
              {broker}
            </span>
          ))}
        </div>
      </div>
      
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent,#050505)]" />
    </section>
  )
}
