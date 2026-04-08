'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { BadgeV2, ButtonV2 } from '@/components/ui/v2'
import { MagneticButton } from '@/components/animation/interactive'
import DashboardPreview from './DashboardPreview'

const ease = [0.25, 0.46, 0.45, 0.94]

const capabilityCards = [
  {
    title: 'Execution Audits',
    description: 'Spot quality drift before it hits your PnL',
    tone:
      'from-[hsl(var(--primary)/0.3)] via-[hsl(var(--primary)/0.16)] to-[hsl(var(--primary)/0.03)]',
  },
  {
    title: 'AI Debriefs',
    description: 'Session-level insights with actionable next steps',
    tone:
      'from-[hsl(var(--accent)/0.34)] via-[hsl(var(--primary)/0.15)] to-[hsl(var(--mk-surface-muted)/0.35)]',
  },
  {
    title: 'Team Coaching',
    description: 'Review setups, process, and risk with your desk',
    tone:
      'from-[hsl(var(--chart-2)/0.3)] via-[hsl(var(--primary)/0.12)] to-[hsl(var(--mk-surface-muted)/0.3)]',
  },
] as const

export default function Hero({ locale }: { locale: string }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pb-20 pt-[74px]">
        <div className="absolute inset-0 bg-[#000]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0, ease }}
          >
            <BadgeV2
              variant="outline"
              className="mb-8 rounded-full border border-[var(--frost-border)] bg-[oklch(0.06_0_0)] px-4 py-1.5 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
              <span className="text-[0.75rem] tracking-[0.08em] text-muted-foreground">
                Precision Trading Intelligence
              </span>
            </BadgeV2>
          </motion.div>

          <motion.h1
            className="max-w-4xl text-[clamp(2.45rem,6vw,4.9rem)] font-medium leading-[0.98] tracking-[-0.032em] text-foreground [font-family:var(--home-display)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            Audit execution quality.
            <span className="mt-1 block bg-gradient-to-r from-primary via-primary/90 to-[hsl(var(--accent)/0.92)] bg-clip-text text-transparent">
              Compound your edge.
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-8 mt-6 max-w-2xl text-[clamp(1rem,2vw,1.2rem)] leading-[1.5] text-muted-foreground/90 [font-family:var(--home-copy)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
          >
            Qunt Edge turns scattered trade data into a clear execution story, so you can
            review decisions faster, coach better, and trade with tighter discipline.
          </motion.p>

          <motion.div
            className="mb-2 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease }}
          >
            <MagneticButton strength={6}>
              <ButtonV2
                asChild
                size="lg"
                className="h-12 w-full rounded-full bg-primary px-8 text-[0.9rem] font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
              >
                <Link href={`/${locale}/authentication?next=dashboard`}>
                  Start Free Audit
                </Link>
              </ButtonV2>
            </MagneticButton>
            <ButtonV2
              asChild
              size="lg"
              variant="outline"
              className="group h-12 w-full rounded-full border border-[var(--frost-border)] bg-transparent px-8 text-[0.9rem] text-foreground transition-all duration-200 hover:bg-white/10 sm:w-auto"
            >
              <a href="#how-it-works">
                Watch Demo
                <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </ButtonV2>
          </motion.div>

          <motion.p
            className="mb-10 text-[0.78rem] tracking-wide text-muted-foreground/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            No credit card · First audit in minutes
          </motion.p>

          <motion.div
            className="mb-10 grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5, ease }}
          >
            {capabilityCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-4 text-left"
              >
                <div
                  className={`rounded-xl border border-[var(--frost-border-alt)] bg-[oklch(0.06_0_0)] px-3 py-2`}
                >
                  <p className="text-[0.74rem] font-medium uppercase tracking-[0.12em] text-foreground/88">
                    {card.title}
                  </p>
                  <p className="mt-1 text-[0.82rem] leading-relaxed text-foreground/72">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
          >
            <div
              className="relative"
              style={{
                perspective: '1200px',
              }}
            >
              <motion.div
                initial={{ rotateX: 2 }}
                animate={{ rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative"
              >
                <div className="absolute -inset-6 rounded-3xl opacity-100 blur-2xl" />
                <DashboardPreview />
              </motion.div>
            </div>
          </motion.div>

          {/* Broker logos strip */}
          <motion.div
            className="mt-12 w-full pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, ease }}
          >
            <p className="mb-4 text-center text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground/48 [font-family:var(--home-copy)]">
              Trusted broker integrations
            </p>
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
              {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'NinjaTrader'].map(
                (broker) => (
                  <span
                    key={broker}
                    className="rounded-full border border-[var(--frost-border)] bg-[oklch(0.06_0_0)] px-3 py-1.5 text-[0.78rem] font-medium tracking-wide text-muted-foreground/65 transition-colors hover:text-foreground/90 [font-family:var(--home-display)]"
                  >
                    {broker}
                  </span>
                ),
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
    </section>
  )
}
