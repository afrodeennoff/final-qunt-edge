'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTypedI18n } from '@/locales/client'
import DashboardPreview from './DashboardPreview'

export default function Hero({ locale }: { locale: string }) {
  const t = useTypedI18n()

  const capabilityCards = [1, 2, 3].map((index) => ({
    title: t(`landing.home.hero.capability${index}Title`),
    description: t(`landing.home.hero.capability${index}Description`),
  }))

  const integrations = [1, 2, 3, 4, 5].map((index) => t(`landing.home.hero.integration${index}`))

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-[88px] sm:px-6 sm:pt-28 md:pb-24 md:pt-32 lg:px-8 xl:pb-28">
      <div className="relative mx-auto max-w-[1200px] [--hero-copy:var(--font-dm-sans)] [--hero-display:var(--font-outfit)]">
        <div className="mx-auto max-w-[860px] text-center">
          <div className="hero-entrance">
            <Badge
              variant="outline"
              className="mb-6 rounded-full border-border/60 bg-card/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-foreground/80"
            >
              {t('landing.hero.badge')}
            </Badge>
          </div>

          <h1 className="hero-entrance hero-entrance-d1 mx-auto max-w-[820px] text-balance text-[clamp(2.75rem,7vw,4.75rem)] leading-[1.05] tracking-[-0.055em] text-foreground [font-family:var(--hero-display)] font-semibold">
            {t('landing.hero.headline')}
            <span className="mt-2 block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {t('landing.hero.headlineAccent')}
            </span>
          </h1>

          <p className="hero-entrance hero-entrance-d2 mx-auto mt-6 max-w-[700px] text-balance text-[1rem] leading-[1.55] text-muted-foreground md:text-[1.125rem] [font-family:var(--hero-copy)]">
            {t('landing.hero.subheadline')}
          </p>

          <div className="hero-entrance hero-entrance-d3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-11 w-full rounded-md px-8 text-sm font-semibold sm:w-auto"
            >
              <Link href={`/${locale}/authentication?next=dashboard`}>
                {t('landing.hero.ctaPrimary')}
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="group h-11 w-full rounded-md border-border/60 bg-background/70 px-8 text-sm font-semibold text-foreground/80 hover:border-border/80 hover:bg-background sm:w-auto"
            >
              <a href="#how-it-works">
                {t('landing.hero.ctaSecondary')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>

          <div className="hero-entrance hero-entrance-d4 mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="type-label rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-muted-foreground">
              {t('landing.hero.noCreditCard')}
            </span>
            <span className="type-label rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-muted-foreground">
              {t('landing.hero.firstAudit')}
            </span>
          </div>
        </div>

        <div className="hero-entrance hero-entrance-d5 mt-12">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] xl:gap-5">
            <div className="overflow-hidden rounded-lg border border-border/60 bg-card/70 p-3 shadow-sm sm:p-4 lg:row-span-2">
              <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border/60 bg-background/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <p className="type-label text-muted-foreground">
                  {t('landing.home.hero.integrationsTitle')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {integrations.map((integration) => (
                    <span
                      key={String(integration)}
                      className="type-label rounded-full border border-border/60 bg-card/80 px-3 py-1 text-foreground/80"
                    >
                      {integration}
                    </span>
                  ))}
                </div>
              </div>

              <DashboardPreview />
            </div>

            <article className="rounded-lg border border-border/60 bg-card/70 p-5 text-left shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="type-label text-muted-foreground">{t('landing.hero.badge')}</p>
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
              <div className="space-y-4">
                {capabilityCards.map((card, index) => (
                  <div
                    key={String(card.title)}
                    className={`${
                      index < capabilityCards.length - 1 ? 'border-b border-border/60 pb-4' : ''
                    }`}
                  >
                    <p className="text-[1rem] leading-[1.2] tracking-[0.2px] text-foreground [font-family:var(--hero-display)] font-semibold">
                      {card.title}
                    </p>
                    <p className="mt-2 text-[0.875rem] leading-[1.5] text-muted-foreground [font-family:var(--hero-copy)]">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-border/60 bg-card/70 p-5 text-left shadow-sm">
              <p className="type-label text-muted-foreground">
                {t('landing.home.hero.integrationsTitle')}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-md border border-border/60 bg-background/60 px-4 py-3">
                  <p className="type-label text-foreground/70">{t('landing.hero.noCreditCard')}</p>
                </div>
                <div className="rounded-md border border-border/60 bg-background/60 px-4 py-3">
                  <p className="type-label text-foreground/70">{t('landing.hero.firstAudit')}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
