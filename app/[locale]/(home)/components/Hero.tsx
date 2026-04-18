'use client'

import Link from 'next/link'
import { ArrowRight, Dot, Sparkles } from 'lucide-react'
import { UnifiedHeroMedia } from '@/components/layout/unified-hero-media'
import {
  unifiedBodyCopyClassName,
  unifiedChipClassName,
  unifiedDisplayTitleClassName,
  unifiedGhostActionClassName,
  unifiedInfoLabelClassName,
  unifiedInfoValueClassName,
  unifiedInsetPanelClassName,
  unifiedPrimaryActionClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { useTypedI18n } from '@/locales/client'
import DashboardPreview from './DashboardPreview'

export default function Hero({ locale }: { locale: string }) {
  const t = useTypedI18n()

  const capabilityCards = [1, 2, 3].map((index) => ({
    title: t(`landing.home.hero.capability${index}Title`),
    description: t(`landing.home.hero.capability${index}Description`),
  }))

  const integrations = [1, 2, 3, 4, 5].map((index) => t(`landing.home.hero.integration${index}`))

  const proofPills = [
    String(t('landing.hero.noCreditCard')),
    String(t('landing.hero.firstAudit')),
  ]

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-[92px] sm:px-6 sm:pt-28 lg:px-8 lg:pb-24 xl:pb-28">
      <div className="mx-auto grid max-w-[1360px] gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] xl:items-end">
        <div className="space-y-6 [--hero-copy:var(--font-dm-sans)] [--hero-display:var(--font-outfit)]">
          <div className="animate-fade-up-smooth">
            <span className={cn(unifiedChipClassName, 'px-4 py-2')}>
              <Sparkles className="h-3.5 w-3.5" />
              {t('landing.hero.badge')}
            </span>
          </div>

          <div className="animate-fade-up-smooth animate-fade-up-smooth-d1 space-y-4">
            <h1
              className={cn(
                unifiedDisplayTitleClassName,
                'max-w-3xl text-[clamp(2.9rem,6vw,6rem)] leading-[0.94] [font-family:var(--hero-display)]',
              )}
            >
              {t('landing.hero.headline')}
              <span className="mt-3 block text-primary">{t('landing.hero.headlineAccent')}</span>
            </h1>
            <p
              className={cn(
                unifiedBodyCopyClassName,
                'max-w-xl [font-family:var(--hero-copy)] text-[1rem] md:text-[1.08rem]',
              )}
            >
              {t('landing.hero.subheadline')}
            </p>
          </div>

          <div className="animate-fade-up-smooth animate-fade-up-smooth-d2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={`/${locale}/authentication?next=dashboard`} className={unifiedPrimaryActionClassName}>
              {t('landing.hero.ctaPrimary')}
            </Link>
            <a href="#how-it-works" className={unifiedGhostActionClassName}>
              {t('landing.hero.ctaSecondary')}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="animate-fade-up-smooth animate-fade-up-smooth-d3 flex flex-wrap gap-2.5">
            {proofPills.map((item) => (
              <span key={item} className={cn(unifiedInsetPanelClassName, 'px-3.5 py-2 text-xs text-muted-foreground')}>
                {item}
              </span>
            ))}
          </div>

          <div className="animate-fade-up-smooth animate-fade-up-smooth-d4 grid gap-3 sm:grid-cols-2 xl:max-w-[42rem]">
            <div className={cn(unifiedInsetPanelClassName, 'space-y-3 p-4 sm:p-5')}>
              <p className={unifiedInfoLabelClassName}>{t('landing.home.hero.integrationsTitle')}</p>
              <div className="flex flex-wrap gap-2">
                {integrations.map((integration) => (
                  <span
                    key={String(integration)}
                    className="rounded-full border border-border/45 bg-background/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/75"
                  >
                    {integration}
                  </span>
                ))}
              </div>
            </div>

            <div className={cn(unifiedInsetPanelClassName, 'space-y-3 p-4 sm:p-5')}>
              <p className={unifiedInfoLabelClassName}>Review stack</p>
              <div className="space-y-3">
                {capabilityCards.map((card, index) => (
                  <div
                    key={String(card.title)}
                    className={cn(
                      'space-y-1.5',
                      index < capabilityCards.length - 1 && 'border-b border-border/40 pb-3',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Dot className="h-4 w-4 text-primary" />
                      <p className={cn(unifiedInfoValueClassName, 'text-[15px]')}>{card.title}</p>
                    </div>
                    <p className="text-sm leading-[1.55] text-muted-foreground">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-up-smooth animate-fade-up-smooth-d5">
          <UnifiedHeroMedia
            screenshot={<DashboardPreview />}
            overlay={<SignalOverlay />}
            caption={
              <div className="flex flex-wrap items-center gap-2 rounded-full border border-border/45 bg-background/80 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/75">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                Live review system
              </div>
            }
            className="min-h-[560px]"
          />
        </div>
      </div>
    </section>
  )
}

function SignalOverlay() {
  return (
    <svg viewBox="0 0 800 520" className="h-full w-full text-primary/75" aria-hidden="true">
      <path
        d="M40 416 C120 380, 186 354, 256 300 C326 248, 382 214, 456 196 C548 174, 630 128, 744 78"
        className="animate-signal-trace stroke-current/75"
        strokeWidth="2.5"
        strokeDasharray="140 14"
        fill="none"
      />
      <path
        d="M114 404 C190 366, 256 330, 334 258 C384 212, 446 184, 554 154"
        className="animate-signal-trace animate-signal-trace-d1 stroke-current/40"
        strokeWidth="1.5"
        strokeDasharray="40 16"
        fill="none"
      />
      <path
        d="M520 168 L640 118 L732 88"
        className="animate-signal-trace animate-signal-trace-d2 stroke-current/24"
        strokeWidth="1.5"
        strokeDasharray="12 10"
        fill="none"
      />
      <circle cx="256" cy="300" r="6" className="animate-signal-node fill-primary/90" />
      <circle
        cx="456"
        cy="196"
        r="5"
        className="animate-signal-node animate-signal-node-d1 fill-primary/72"
      />
      <circle
        cx="640"
        cy="118"
        r="4.5"
        className="animate-signal-node animate-signal-node-d2 fill-primary/60"
      />
    </svg>
  )
}
