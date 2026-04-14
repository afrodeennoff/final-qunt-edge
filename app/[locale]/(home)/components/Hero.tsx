'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MagneticButton } from '@/components/animation/interactive'
import { useTypedI18n } from '@/locales/client'
import DashboardPreview from './DashboardPreview'

const ease = [0.22, 1, 0.36, 1] as const

export default function Hero({ locale }: { locale: string }) {
  const t = useTypedI18n()

  const capabilityCards = [1, 2, 3].map((index) => ({
    title: t(`landing.home.hero.capability${index}Title`),
    description: t(`landing.home.hero.capability${index}Description`),
  }))

  const integrations = [1, 2, 3, 4, 5].map((index) => t(`landing.home.hero.integration${index}`))

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 md:pb-20 md:pt-32 lg:px-8 xl:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-background/0 to-background/0" />
      {/* Atmospheric glow orbs */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-primary/[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-40 h-[400px] w-[400px] rounded-full bg-accent/[0.03] blur-[120px]" />

      <div className="relative mx-auto flex w-full max-w-[1360px] flex-col gap-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease }}
          >
            <Badge
              variant="outline"
              className="mb-6 rounded-full border-white/[0.06] bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 transition-[background-color,border-color,box-shadow,filter,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              {t('landing.hero.badge')}
            </Badge>
          </motion.div>

          <motion.h1
            className="type-h1 max-w-5xl text-balance text-foreground lg:text-display"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
          >
            {t('landing.hero.headline')}
            <span className="mt-2 block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {t('landing.hero.headlineAccent')}
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-3xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
          >
            {t('landing.hero.subheadline')}
          </motion.p>

          <motion.div
            className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
          >
            <MagneticButton strength={6}>
              <Button
                asChild
                size="lg"
                className="h-11 w-full rounded-full px-8 text-sm font-bold transition-[background-color,border-color,box-shadow,filter,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:brightness-110 sm:w-auto"
              >
                <Link href={`/${locale}/authentication?next=dashboard`}>
                  {t('landing.hero.ctaPrimary')}
                </Link>
              </Button>
            </MagneticButton>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="group h-11 w-full rounded-full border-white/[0.06] bg-background/70 px-8 text-sm font-medium text-foreground/80 transition-[background-color,border-color,box-shadow,filter,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/[0.12] hover:bg-background sm:w-auto"
            >
              <a href="#how-it-works">
                {t('landing.hero.ctaSecondary')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
              </a>
            </Button>
          </motion.div>

          <motion.p
            className="mt-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {t('landing.hero.noCreditCard')} · {t('landing.hero.firstAudit')}
          </motion.p>
        </div>

        <motion.div
          className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease }}
        >
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {capabilityCards.map((card) => (
              <div
                key={String(card.title)}
                className="rounded-lg border-white/[0.06] bg-card/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  {card.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}

            <div className="rounded-lg border border-white/[0.04] bg-card/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t('landing.home.hero.integrationsTitle')}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {integrations.map((integration) => (
                  <span
                    key={String(integration)}
                    className="rounded-full border-white/[0.06] bg-background/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-foreground/80 transition-[background-color,border-color,box-shadow,filter,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/[0.12]"
                  >
                    {integration}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-lg border border-primary/20 bg-gradient-to-b from-primary/10 via-background/0 to-background/0" />
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-primary/[0.03] blur-[120px]" />
            <DashboardPreview />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
