'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { ButtonV2 } from '@/components/ui/v2'
import { MagneticButton } from '@/components/animation/interactive'

interface FinalCTAProps {
  locale: string
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  return (
    <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="marketing-panel rounded-3xl relative overflow-hidden border border-[hsl(var(--mk-border)/0.25)] px-6 py-16 sm:px-12 sm:py-20">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-[oklch(0.55_0.22_264/0.15)] via-[oklch(0.45_0.18_290/0.08)] to-transparent blur-xl" />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 rounded-3xl opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(oklch(0.55_0.22_264) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55_0.22_264) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />

          <div className="relative z-10">
            <h2 className="text-[clamp(1.8rem,4.2vw,3.2rem)] font-semibold tracking-[-0.025em] mb-6 text-foreground leading-tight [font-family:var(--home-display)]">
              Ready to{' '}
              <span className="line-through decoration-muted-foreground/30 decoration-2">stop guessing</span>
              {' '}and{' '}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                start knowing
              </span>
              ?
            </h2>
            <p className="text-[0.95rem] sm:text-lg text-muted-foreground/75 mb-10 leading-relaxed [font-family:var(--home-copy)]">
              Join 2,400+ traders who have improved their performance with Qunt Edge.
              Start your free audit today.
            </p>
            <MagneticButton strength={8}>
              <ButtonV2
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 btn-primary-glow rounded-xl text-[0.95rem] px-8 h-13 font-medium shadow-glow-primary-lg"
              >
                <Link href={`/${locale}/authentication?next=dashboard`}>
                  Start Your Free Audit — No Credit Card
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </ButtonV2>
            </MagneticButton>
            <p className="mt-5 text-[0.78rem] text-muted-foreground/45 tracking-wide">
              No credit card required · Setup in 2 minutes · Cancel anytime
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
