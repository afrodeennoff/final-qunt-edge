'use client'

import { ArrowRight, Target, TrendingUp } from 'lucide-react'
import { BadgeV2 as Badge, CardV2 as Card } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { useTypedI18n } from '@/locales/client'

const audienceIcons = [Target, TrendingUp]

export default function AudienceSegmentation() {
  const t = useTypedI18n()

  const audiences = [
    {
      badge: t('landing.home.audience.propBadge'),
      title: t('landing.home.audience.propTitle'),
      description: t('landing.home.audience.propDescription'),
      cta: t('landing.home.audience.propCta'),
      features: [1, 2, 3, 4, 5].map((index) => t(`landing.home.audience.propFeature${index}`)),
      icon: audienceIcons[0],
    },
    {
      badge: t('landing.home.audience.independentBadge'),
      title: t('landing.home.audience.independentTitle'),
      description: t('landing.home.audience.independentDescription'),
      cta: t('landing.home.audience.independentCta'),
      features: [1, 2, 3, 4, 5].map((index) => t(`landing.home.audience.independentFeature${index}`)),
      icon: audienceIcons[1],
    },
  ]

  return (
    <MarketingSection className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1360px]">
      <div className="mb-8 text-center md:mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t('landing.home.audience.eyebrow')}
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          {t('landing.home.audience.title')}{' '}
          <span className="text-primary">{t('landing.home.audience.highlight')}</span>
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {audiences.map((audience) => {
          const Icon = audience.icon
          return (
            <Card key={String(audience.title)} className="flex h-full flex-col p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" size="sm" className="rounded-full border-primary/30 bg-primary/10 text-primary">
                    {audience.badge}
                  </Badge>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-foreground">{audience.title}</h3>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {audience.description}
              </p>

              <ul className="grid flex-1 gap-4">
                {audience.features.map((feature) => (
                  <li key={String(feature)} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-sm leading-relaxed text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                {audience.cta}
                <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          )
        })}
      </div>
    </MarketingSection>
  )
}
