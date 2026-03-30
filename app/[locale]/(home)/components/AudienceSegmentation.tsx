'use client'

import { BadgeV2 } from '@/components/ui/v2'
import { ArrowRight, Check } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const audiences = [
  {
    title: 'For Prop Firm Traders',
    bullets: [
      'Optimize consistency metrics across funded accounts',
      'Protect your funded edge with drift detection',
      'Team process audit with desk-level visibility',
      'Multi-account review and challenge preparation',
    ],
    slideFrom: -30,
  },
  {
    title: 'For Independent Traders',
    bullets: [
      'Build repeatable routines from your best sessions',
      'Eliminate emotional drift with structured reviews',
      'Track execution quality beyond simple P&L',
      'AI-powered weekly performance briefs',
    ],
    slideFrom: 30,
  },
] as const

export default function AudienceSegmentation() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <BadgeV2
            variant="outline"
            className="border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]"
          >
            Who Is This For?
          </BadgeV2>
          <h2 className="mt-3 text-[clamp(2rem,4.9vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            Built for serious traders,
            <span className="block text-foreground">not casual hobbyists</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-[15px] leading-[1.78] text-foreground/80 sm:text-base [font-family:var(--home-copy)]">
            Whether you're protecting a funded account or sharpening your personal edge, Qunt Edge
            adapts to your process.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
          {audiences.map((audience) => (
            <motion.div
              key={audience.title}
              className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface)/0.6)] p-6 lg:p-8"
              initial={prefersReducedMotion ? false : { opacity: 0, x: audience.slideFrom }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, x: 0 }
              }
              viewport={{ once: true, margin: '-8% 0px -4% 0px' }}
              transition={{ duration: 0.55, ease: MOTION_EASE }}
            >
              <h3 className="text-xl font-semibold [font-family:var(--home-display)]">
                {audience.title}
              </h3>

              <ul className="mt-5 space-y-3">
                {audience.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground/80 [font-family:var(--home-copy)]">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#pricing"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
