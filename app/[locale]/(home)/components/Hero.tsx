'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { BadgeV2, ButtonV2 } from '@/components/ui/v2'
import { MagneticButton } from '@/components/animation/interactive'
import DashboardPreview from './DashboardPreview'

const ease = [0.25, 0.46, 0.45, 0.94]

export default function Hero({ locale }: { locale: string }) {
  const partnerLinks = [
    {
      name: 'NinjaTrader',
      href: `/${locale}/firm/`,
      badge: 'Execution Partner',
    },
    {
      name: 'Tradovate',
      href: `/${locale}/firm/`,
      badge: 'Platform Partner',
    },
    {
      name: 'FundingPips Trading',
      href: `/${locale}/firm/funding-pips`,
      badge: 'Prop Partner',
    },
  ] as const

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-[68px] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-mesh-animated opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.55_0.22_264/0.08)] blur-3xl animate-orb-float" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[oklch(0.45_0.18_290/0.06)] blur-3xl animate-orb-float" style={{ animationDelay: '-5s' }} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:72px_72px] opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_85%_15%,hsl(var(--primary)/0.06),transparent_70%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0, ease }}
          >
            <BadgeV2
              variant="outline"
              className="mb-8 border-[hsl(var(--mk-border)/0.5)] bg-[hsl(var(--mk-surface)/0.6)] backdrop-blur-sm rounded-full px-4 py-1.5 shadow-glow-primary"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
              <span className="text-[0.78rem] tracking-wide text-muted-foreground">
                Live Decision Telemetry
              </span>
            </BadgeV2>
          </motion.div>

          <motion.h1
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-[-0.035em] leading-[1.05] mb-0 max-w-4xl text-foreground text-gradient-primary [font-family:var(--home-display)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            Your next edge starts
          </motion.h1>

          <motion.h1
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-[-0.035em] leading-[1.05] mb-6 max-w-4xl bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent [font-family:var(--home-display)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
          >
            with better decisions.
          </motion.h1>

          <motion.p
            className="text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground/90 max-w-2xl mx-auto mb-8 leading-[1.7] [font-family:var(--home-copy)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
          >
            Qunt Edge isolates execution quality, behavioral drift, and risk discipline
            in one surface.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease }}
          >
            <MagneticButton strength={6}>
              <ButtonV2
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 btn-primary-glow rounded-xl px-7 h-12 text-[0.92rem] font-medium w-full sm:w-auto shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.5)]"
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
              className="border-border/60 hover:bg-card/80 rounded-xl px-7 h-12 text-[0.92rem] w-full sm:w-auto group transition-all duration-200"
            >
              <a href="#how-it-works">
                Watch Demo
                <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </ButtonV2>
          </motion.div>

          <motion.p
            className="text-[0.78rem] text-muted-foreground/50 tracking-wide mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            No credit card · First audit in minutes
          </motion.p>

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
                <div
                  className="absolute -inset-4 rounded-3xl opacity-100 blur-2xl"
                  style={{
                    boxShadow:
                      '0 40px 80px -20px hsl(var(--primary)/0.15)',
                  }}
                />
                <DashboardPreview />
              </motion.div>
            </div>
          </motion.div>

          {/* Partner strip */}
          <motion.div
            className="mt-12 w-full pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, ease }}
          >
            <p className="mb-3 text-center text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground/40 [font-family:var(--home-copy)]">
              Partners
            </p>
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-3">
              {partnerLinks.map((partner) => (
                <Link
                  key={partner.name}
                  href={partner.href}
                  aria-label={`Open ${partner.name} partner firm page`}
                  className="group rounded-xl border border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.55)] px-3 py-3 text-left transition-colors hover:border-primary/35 hover:bg-[hsl(var(--mk-surface)/0.72)]"
                >
                  <p className="text-sm font-medium text-foreground/90 [font-family:var(--home-display)]">
                    {partner.name}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/65 [font-family:var(--home-copy)]">
                    {partner.badge}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
    </section>
  )
}
