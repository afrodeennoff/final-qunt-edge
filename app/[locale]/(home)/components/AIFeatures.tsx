'use client'

import { ArrowRight, Brain, Radar, ShieldAlert, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTypedI18n } from '@/locales/client'
import { CardV2 as Card } from '@/components/ui/v2'

const icons = [Brain, Radar, ShieldAlert, Sparkles]

export default function AIFeatures() {
  const t = useTypedI18n()

  const features = [1, 2, 3, 4].map((index) => ({
    icon: icons[index - 1],
    title: t(`landing.home.ai.feature${index}Title`, {}),
    description: t(`landing.home.ai.feature${index}Description`, {}),
    colSpan: index === 1 || index === 4 ? 'md:col-span-2' : 'md:col-span-1',
  }))

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <Card className="p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{t('landing.home.ai.eyebrow')}</p>
          <h2 className="mt-3 text-balance text-[clamp(1.85rem,4vw,2.6rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-foreground">
            {t('landing.home.ai.title')}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground max-w-xl">
            {t('landing.home.ai.description')}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Card className="space-y-1.5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {t('landing.home.ai.reasonTrailTitle')}
              </p>
              <p className="text-[13px] leading-relaxed text-foreground">
                {t('landing.home.ai.reasonTrailDescription')}
              </p>
            </Card>
            <Card className="space-y-1.5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {t('landing.home.ai.liveContextTitle')}
              </p>
              <p className="text-[13px] leading-relaxed text-foreground">
                {t('landing.home.ai.liveContextDescription')}
              </p>
            </Card>
          </div>

          <div className="mt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              {t('landing.home.ai.badge')}
            </span>
          </div>
        </Card>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={String(feature.title)} className={cn('flex h-full flex-col gap-3 p-4', feature.colSpan)}>
                  <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {t('landing.home.ai.capabilityLabel')}
                  </span>
                  <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">
                    {feature.title}
                  </h3>
                  <p className="flex-1 text-[13px] leading-[1.55] text-muted-foreground">
                    {feature.description}
                  </p>
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                    <ArrowRight className="h-3 w-3" />
                    {t('landing.home.ai.inspectSignal')}
                  </div>
                </Card>
              )
            })}
          </div>

          <Card className="p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {t('landing.home.ai.footerDescription')}
              </p>
              <span className="w-fit shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {t('landing.home.ai.footerBadge')}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
