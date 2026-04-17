'use client'

import Link from 'next/link'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Gift,
  HandCoins,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useI18n } from '@/locales/client'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'
import {
  unifiedChipClassName,
  unifiedGhostActionClassName,
  unifiedHeroPanelClassName,
  unifiedInsetPanelClassName,
  unifiedMetricPanelClassName,
  unifiedPrimaryActionClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

export default function ReferralPage() {
  const t = useI18n()
  const affiliateUrl = 'https://whop.com/quantedge-solutions/affiliates'

  const tiers = [
    { count: 1, reward: t('referral.landing.tier1Reward'), icon: Gift },
    { count: 3, reward: t('referral.landing.tier2Reward'), icon: Sparkles },
    { count: 5, reward: t('referral.landing.tier3Reward'), icon: Trophy },
  ]

  const requirements = [
    {
      title: t('referral.landing.requirement1Title'),
      description: t('referral.landing.requirement1Description'),
      icon: CheckCircle2,
      tone: 'positive',
    },
    {
      title: t('referral.landing.requirement2Title'),
      description: t('referral.landing.requirement2Description'),
      icon: AlertCircle,
      tone: 'warning',
    },
  ] as const

  const steps = [
    [t('referral.landing.step1Title'), t('referral.landing.step1Description')],
    [t('referral.landing.step2Title'), t('referral.landing.step2Description')],
    [t('referral.landing.step3Title'), t('referral.landing.step3Description')],
  ] as const

  return (
<<<<<<< HEAD
    <UnifiedPageShell widthClassName="max-w-[1320px]" className="py-12 sm:py-16">
      <div className="space-y-6">
        <section
          className={cn(unifiedHeroPanelClassName, 'animate-fade-up-smooth p-6 sm:p-8 lg:p-10')}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(740px_280px_at_12%_6%,rgba(255,255,255,0.08),transparent_72%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_220px_at_88%_12%,rgba(255,255,255,0.045),transparent_72%)]" />
=======
    <div className="px-4 py-12 bg-background text-foreground">
      <div className="w-full">
        <Card className="mb-8 border-border/24 bg-gradient-to-br from-card/85 via-card/70 to-card/85 text-foreground shadow-2xl">
          <CardContent className="p-6 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <Badge className="w-fit bg-card/25 text-foreground hover:bg-card/35">
                  {t('referral.landing.heroBadge')}
                </Badge>
                <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                  {t('referral.landing.heroTitle')}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                  {t('referral.landing.heroDescription')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('referral.landing.affiliateLinkLabel')}: {affiliateUrl}
                </p>
              </div>
>>>>>>> origin/main

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.82fr)] xl:items-end">
            <div className="space-y-5">
              <span className={unifiedChipClassName}>{t('referral.landing.heroBadge')}</span>
              <h1 className="max-w-4xl text-[clamp(2.2rem,5vw,4.3rem)] font-medium leading-[0.98] tracking-[-0.04em] text-foreground/95">
                {t('referral.landing.heroTitle')}
              </h1>
              <p className="max-w-2xl text-sm leading-[1.7] text-muted-foreground sm:text-base">
                {t('referral.landing.heroDescription')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('referral.landing.affiliateLinkLabel')}: {affiliateUrl}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={unifiedPrimaryActionClassName}
                >
                  <HandCoins className="h-4 w-4" />
                  {t('referral.landing.affiliateCta')}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="#referral-how-it-works" className={unifiedGhostActionClassName}>
                  {t('referral.landing.howItWorks')}
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div
                className={cn(
                  unifiedMetricPanelClassName,
                  'animate-scale-reveal animate-scale-reveal-d1',
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Program focus
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {t('referral.landing.title')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t('referral.landing.subtitle')}
                </p>
              </div>
              <div
                className={cn(
                  unifiedMetricPanelClassName,
                  'animate-scale-reveal animate-scale-reveal-d2',
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Reward ladder
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  1, 3, then 5 referrals
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Unlock higher reward tiers as successful invites compound.
                </p>
              </div>
              <div
                className={cn(
                  unifiedMetricPanelClassName,
                  'animate-scale-reveal animate-scale-reveal-d3',
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Operator note
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  Verify before sharing
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Keep the official link and eligibility notes close to the action.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="referral-how-it-works"
          className={cn(
            unifiedSectionPanelClassName,
            'animate-fade-up-smooth animate-fade-up-smooth-d2 p-5 sm:p-6',
          )}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                How it works
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                One clear flow from invite to reward
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Keep the program structured like the rest of the public tools: a clear action first,
              then one walkthrough, then the rules beneath it.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {steps.map(([title, description], index) => (
              <div
                key={title}
                className={cn(
                  unifiedInsetPanelClassName,
                  'animate-scale-reveal p-5',
                  index === 0 && 'animate-scale-reveal-d1',
                  index === 1 && 'animate-scale-reveal-d2',
                  index === 2 && 'animate-scale-reveal-d3',
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section
            className={cn(
              unifiedSectionPanelClassName,
              'animate-fade-up-smooth animate-fade-up-smooth-d3 p-5 sm:p-6',
            )}
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Requirements
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Keep eligibility visible before anyone shares the link
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('referral.landing.requirementsDescription')}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {requirements.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className={cn(
                      unifiedInsetPanelClassName,
                      'animate-scale-reveal flex gap-4 p-4',
                      index === 0 && 'animate-scale-reveal-d1',
                      index === 1 && 'animate-scale-reveal-d2',
                    )}
                  >
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10">
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          item.tone === 'positive' && 'text-semantic-success',
                          item.tone === 'warning' && 'text-semantic-warning',
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section
            className={cn(
              unifiedSectionPanelClassName,
              'animate-fade-up-smooth animate-fade-up-smooth-d4 p-5 sm:p-6',
            )}
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Reward tiers
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Reward progression that stays easy to scan
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {tiers.map((tier, index) => {
                const Icon = tier.icon
                return (
                  <div
                    key={tier.count}
                    className={cn(
                      unifiedInsetPanelClassName,
                      'animate-scale-reveal flex flex-col items-center p-5 text-center',
                      index === 0 && 'animate-scale-reveal-d1',
                      index === 1 && 'animate-scale-reveal-d2',
                      index === 2 && 'animate-scale-reveal-d3',
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="mt-4 rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {t('referral.landing.tierBadge', { count: tier.count })}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {tier.reward}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

<<<<<<< HEAD
        <section
          className={cn(
            unifiedSectionPanelClassName,
            'animate-fade-up-smooth animate-fade-up-smooth-d4 p-5 sm:p-6',
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Important notes
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Keep the operating notes attached to the offer
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              t('referral.landing.note1'),
              t('referral.landing.note2'),
              t('referral.landing.note3'),
            ].map((note, index) => (
              <div
                key={note}
                className={cn(
                  unifiedInsetPanelClassName,
                  'animate-scale-reveal p-4',
                  index === 0 && 'animate-scale-reveal-d1',
                  index === 1 && 'animate-scale-reveal-d2',
                  index === 2 && 'animate-scale-reveal-d3',
                )}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </section>
=======
        {/* How It Works Section */}
        <Card className="mb-8 bg-card border-border/24">
          <CardHeader>
            <CardTitle className="text-2xl">{t('referral.landing.howItWorks')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('referral.landing.step1Title')}</h3>
                  <p className="text-muted-foreground">{t('referral.landing.step1Description')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('referral.landing.step2Title')}</h3>
                  <p className="text-muted-foreground">{t('referral.landing.step2Description')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('referral.landing.step3Title')}</h3>
                  <p className="text-muted-foreground">{t('referral.landing.step3Description')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Section */}
        <Card className="mb-8 bg-card border-border/24">
          <CardHeader>
            <CardTitle className="text-2xl">{t('referral.landing.requirements')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {t('referral.landing.requirementsDescription')}
            </p>
            <div className="space-y-4">
              {requirements.map((req, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-lg border border-border/24 bg-muted/30">
                  <div className="flex-shrink-0 mt-0.5">
                    {req.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{req.title}</h3>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards Tiers Section */}
        <Card className="mb-8 bg-card border-border/24">
          <CardHeader>
            <CardTitle className="text-2xl">{t('referral.landing.rewards')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border/24 bg-muted/20 flex flex-col items-center text-center transition-colors hover:bg-muted/35"
                >
                  <div className="mb-4">{tier.icon}</div>
                  <Badge variant="secondary" className="mb-3">
                    {t('referral.landing.tierBadge', { count: tier.count })}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{tier.reward}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="bg-card border-border/24">
          <CardHeader>
            <CardTitle className="text-2xl">{t('referral.landing.importantNotes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-disc list-inside text-muted-foreground">
              <li>{t('referral.landing.note1')}</li>
              <li>{t('referral.landing.note2')}</li>
              <li>{t('referral.landing.note3')}</li>
            </ul>
          </CardContent>
        </Card>
>>>>>>> origin/main
      </div>
    </UnifiedPageShell>
  )
}
