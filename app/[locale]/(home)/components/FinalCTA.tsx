'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ButtonV2 as Button } from '@/components/ui/v2'

export function FinalCTA() {
  return (
    <section className="border-t border-[oklch(0.65_0.22_260/0.04)] py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-[10px] font-mono tracking-[2.5px] text-primary">
          START TODAY
        </div>

        <h2 className="text-balance text-5xl font-light tracking-[-0.025em] sm:text-6xl">
          Your edge deserves<br />better tools.
        </h2>

        <p className="mx-auto mt-6 max-w-md text-[15px] text-muted-foreground">
          Join the traders who stopped guessing and started seeing exactly where their money comes from.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/authentication/sign-up">
              Start free 14-day trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/dashboard">Watch the 2-minute demo</Link>
          </Button>
        </div>

        <p className="mt-6 text-[11px] tracking-[1px] text-muted-foreground/70">
          No card required. Cancel anytime. Built for serious prop traders.
        </p>
      </div>
    </section>
  )
}
