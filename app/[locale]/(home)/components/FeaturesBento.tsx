import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  unifiedBodyCopyClassName,
  unifiedChipClassName,
  unifiedInsetPanelClassName,
  unifiedSectionEyebrowClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { MotionSection, MotionStagger, MotionStaggerItem } from '@/components/motion'
import { getTypedI18n } from '@/locales/server'

const featureIcons = [Download, BarChart3, Users, Shield, FileText, Brain]

export default async function FeaturesBento() {
  const t = await getTypedI18n()

  const features = [1, 2, 3, 4, 5, 6].map((index) => ({
    title: t(`landing.home.features.feature${index}Title`),
    description: t(`landing.home.features.feature${index}Description`),
    icon: featureIcons[index - 1],
  }))

  return (
    <MotionSection className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1360px] space-y-6">
        <div className={cn(unifiedSectionPanelClassName, 'p-6 sm:p-8')}>
          <p className={unifiedSectionEyebrowClassName}>{t('landing.home.features.eyebrow')}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end">
            <div>
              <h2 className="text-balance text-[clamp(2.2rem,4.8vw,4.3rem)] font-medium leading-[0.96] tracking-[-0.05em] text-foreground">
                {t('landing.home.features.title')}
                <span className="block text-primary">{t('landing.home.features.highlight')}</span>
              </h2>
            </div>
            <p className={cn(unifiedBodyCopyClassName, 'max-w-2xl')}>
              {t('landing.home.features.description')}
            </p>
          </div>
        </div>

                <div className="px-1">
          <span className={cn(unifiedChipClassName, 'px-3 py-1.5 text-foreground/80')}>
            {t('landing.home.features.listLabel')}
          </span>
        </div>

        <MotionStagger className="grid gap-4 lg:grid-cols-4" delay={0.08}>
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <MotionStaggerItem key={String(feature.title)} className={feature.colSpan}>
                <article
                  className={cn(
                    feature.highlighted ? unifiedSectionPanelClassName : unifiedInsetPanelClassName,
                    'flex h-full flex-col gap-4 p-6',
                    feature.highlighted && 'border-primary/16',
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/18 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  {feature.highlighted ? (
                    <span className={cn(unifiedChipClassName, 'w-fit px-3 py-1.5')}>
                      {t('landing.home.features.feature2Badge')}
                    </span>
                  ) : null}
                  <div className="space-y-2">
                    <h3 className="text-[1.06rem] font-semibold tracking-[-0.02em] text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-[1.65] text-muted-foreground">{feature.description}</p>
                  </div>
                </article>
              </MotionStaggerItem>
            )
          })}
        </MotionStagger>
      </div>
    </MarketingSection>
      </div>
    </MarketingSection>
  )
}
