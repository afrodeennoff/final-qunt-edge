import { BarChart3, Brain, Download, FileText, Shield, Users } from 'lucide-react'
import {
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
} from '@/components/animation/enhanced-motion'
import {
  unifiedInsetPanelClassName,
  unifiedSectionEyebrowClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { getTypedI18n } from '@/locales/server'

const featureIcons = [BarChart3, Brain, Users, Download, FileText, Shield]

export default async function FeaturesBento() {
  const t = await getTypedI18n()

  const features = [1, 2, 3, 4, 5, 6].map((index) => ({
    title: t(`landing.home.features.feature${index}Title`),
    description: t(`landing.home.features.feature${index}Description`),
    icon: featureIcons[index - 1],
  }))

  return (
    <MotionSection className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1360px] space-y-10">
        <div className="text-center">
          <p className={unifiedSectionEyebrowClassName}>{t('landing.home.features.eyebrow')}</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t('landing.home.features.title')}{' '}
            <span className="text-primary">{t('landing.home.features.highlight')}</span>
          </h2>
        </div>

        <MotionStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" delay={0.08}>
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <MotionStaggerItem key={String(feature.title)}>
                <article className={cn(unifiedInsetPanelClassName, 'p-6')}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/18 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              </MotionStaggerItem>
            )
          })}
        </MotionStagger>
      </div>
    </MotionSection>
  )
}
