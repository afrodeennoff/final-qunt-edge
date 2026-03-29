'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { BadgeV2 } from '@/components/ui/v2'
import { ButtonV2 } from '@/components/ui/v2'
import DashboardPreview from './DashboardPreview'

const stats = [
  { value: '50,000+', label: 'Active Traders' },
  { value: '12M+', label: 'Trades Analyzed' },
  { value: '98%', label: 'Plan Adherence' },
]

export default function Hero({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-[68px] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:64px_64px] opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_85%_15%,hsl(var(--primary)/0.06),transparent_70%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BadgeV2
              variant="outline"
              className="mb-8 border-[hsl(var(--mk-border)/0.5)] bg-[hsl(var(--mk-surface)/0.6)] backdrop-blur-sm rounded-full px-4 py-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
              <span className="text-[0.78rem] tracking-wide text-muted-foreground">
                Live Decision Telemetry
              </span>
            </BadgeV2>
          </motion.div>

          <motion.h1
            className="text-[clamp(2.4rem,5.8vw,4.2rem)] font-bold tracking-[-0.038em] leading-[1.02] mb-6 max-w-4xl text-foreground [font-family:var(--home-display)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Your edge isn&apos;t your strategy.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              It&apos;s your review process.
            </span>
          </motion.h1>

          <motion.p
            className="text-[clamp(0.95rem,1.3vw,1.15rem)] text-muted-foreground/85 max-w-2xl mx-auto mb-8 leading-[1.7] [font-family:var(--home-copy)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Qunt Edge isolates execution quality, behavioral drift, and risk discipline
            in one review surface. Every session gets a precise diagnosis.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <ButtonV2
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 btn-primary-glow rounded-xl px-7 h-12 text-[0.92rem] font-medium w-full sm:w-auto shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.5)]"
            >
              <Link href={`/${locale}/authentication?next=dashboard`}>
                Start Free Audit
              </Link>
            </ButtonV2>
            <ButtonV2
              asChild
              size="lg"
              variant="outline"
              className="border-[hsl(var(--mk-border)/0.5)] text-foreground hover:bg-[hsl(var(--mk-surface)/0.6)] rounded-xl px-7 h-12 text-[0.92rem] w-full sm:w-auto group transition-all duration-200"
            >
              <a href="#how-it-works">
                See How It Works
                <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </ButtonV2>
          </motion.div>

          <motion.div
            className="flex items-center gap-6 sm:gap-10 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums [font-family:var(--home-display)]">
                  {stat.value}
                </p>
                <p className="text-[0.7rem] text-muted-foreground/60 tracking-wide uppercase mt-0.5 [font-family:var(--home-copy)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.p
            className="text-[0.78rem] text-muted-foreground/50 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            No credit card required · First audit in minutes
          </motion.p>

          <motion.div
            className="w-full mt-12 pb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <DashboardPreview />
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.82rem] text-muted-foreground/50 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <span className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground/40 mr-1 [font-family:var(--home-copy)]">
              Integrates with
            </span>
            {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'NinjaTrader'].map((broker) => (
              <span
                key={broker}
                className="hover:text-foreground/70 transition-colors duration-200"
              >
                {broker}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
    </section>
  )
}
