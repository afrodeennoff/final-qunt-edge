'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { ButtonV2 } from '@/components/ui/v2'
import { MagneticButton } from '@/components/animation/interactive'
import { MOTION_EASE } from './_constants'

const ease = MOTION_EASE as unknown as number[]

interface FinalCTAProps {
  locale: string
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  return (
    <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
      {/* Bold gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 shadow-[0_0_100px_-20px_hsl(var(--primary)/0.3)]" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="marketing-panel rounded-3xl relative overflow-hidden border border-[hsl(var(--mk-border)/0.25)] px-6 py-16 sm:px-12 sm:py-20">
          {/* Inner glow accent */}
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/15 via-primary/[0.06] to-transparent blur-xl" />

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
              Join traders tracking their performance with Qunt Edge.
              Start your free audit today.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
            >
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
            </motion.div>

            <motion.p
              className="mt-5 text-[0.78rem] text-muted-foreground/45 tracking-wide"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              No credit card required · Setup in 2 minutes · Cancel anytime
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
