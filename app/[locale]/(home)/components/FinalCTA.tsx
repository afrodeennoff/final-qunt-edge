'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ButtonV2 } from '@/components/ui/v2'

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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,hsl(var(--primary)/0.12),transparent)]" />
          {/* Subtle grid overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.12)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.12)_1px,transparent_1px)] bg-[size:48px_48px] opacity-25" />

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
              Join 50,000+ traders who have improved their performance with Qunt Edge.
              Start your free audit today.
            </p>
            <ButtonV2
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 btn-primary-glow rounded-xl text-[0.95rem] px-8 h-13 font-medium shadow-[0_12px_32px_-12px_hsl(var(--primary)/0.55)] hover:shadow-[0_16px_40px_-12px_hsl(var(--primary)/0.65)] transition-shadow duration-300"
            >
              <Link href={`/${locale}/authentication?next=dashboard`}>
                Start Free Audit
              </Link>
            </ButtonV2>
            <p className="mt-5 text-[0.78rem] text-muted-foreground/45 tracking-wide">
              No credit card required · Setup in 2 minutes · Cancel anytime
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
