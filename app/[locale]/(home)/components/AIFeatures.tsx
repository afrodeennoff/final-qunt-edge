'use client'

import { ArrowRight, Brain, Radar, ShieldAlert, Sparkles } from 'lucide-react'
import {
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
} from '@/components/animation/enhanced-motion'
import {
  unifiedBodyCopyClassName,
  unifiedChipClassName,
  unifiedInsetPanelClassName,
  unifiedSectionEyebrowClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { useTypedI18n } from '@/locales/client'

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
    <MotionSection className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-[1360px] gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-8">
        <div className={cn(unifiedSectionPanelClassName, 'p-6 md:p-8')}>
          <p className={unifiedSectionEyebrowClassName}>{t('landing.home.ai.eyebrow')}</p>
          <h2 className="mt-4 text-balance text-[clamp(2.2rem,4.5vw,4rem)] font-medium leading-[0.97] tracking-[-0.05em] text-foreground">
            {t('landing.home.ai.title')}
          </h2>
          <p className={cn(unifiedBodyCopyClassName, 'mt-5 max-w-xl')}>
            {t('landing.home.ai.description')}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className={cn(unifiedInsetPanelClassName, 'space-y-2 p-4')}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.ai.reasonTrailTitle')}
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {t('landing.home.ai.reasonTrailDescription')}
              </p>
            </div>
            <div className={cn(unifiedInsetPanelClassName, 'space-y-2 p-4')}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.ai.liveContextTitle')}
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {t('landing.home.ai.liveContextDescription')}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <span className={cn(unifiedChipClassName, 'px-4 py-2')}>
              <Sparkles className="h-3.5 w-3.5" />
              {t('landing.home.ai.badge')}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <MotionStagger className="grid grid-cols-1 gap-4 md:grid-cols-3" delay={0.08}>
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <MotionStaggerItem key={String(feature.title)} className={feature.colSpan}>
                  <article className={cn(unifiedInsetPanelClassName, 'flex h-full flex-col gap-4 p-5')}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/18 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="inline-flex w-fit items-center rounded-full border-0 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {t('landing.home.ai.capabilityLabel')}
                    </span>
                    <h3 className="text-[1.06rem] font-semibold tracking-[-0.02em] text-foreground">
                      {feature.title}
                    </h3>
                    <p className="flex-1 text-sm leading-[1.65] text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      <ArrowRight className="h-3.5 w-3.5" />
                      {t('landing.home.ai.inspectSignal')}
                    </div>
                  </article>
                </MotionStaggerItem>
              )
            })}
          </MotionStagger>

          <div className={cn(unifiedInsetPanelClassName, 'p-5')}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('landing.home.ai.footerDescription')}
              </p>
              <span className={cn(unifiedChipClassName, 'w-fit shrink-0 px-3 py-1.5')}>
                {t('landing.home.ai.footerBadge')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
