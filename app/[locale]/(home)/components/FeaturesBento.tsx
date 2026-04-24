import { BarChart3, Brain, Download, FileText, Shield, Users } from 'lucide-react'
import {
  MarketingFeatureCard,
  MarketingSection,
  MarketingSectionHeader,
} from '@/components/layout/marketing-sections'
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
    <MarketingSection id="features">
      <div className="space-y-12">
        <MarketingSectionHeader
          eyebrow={t('landing.home.features.eyebrow')}
          title={
            <>
              {t('landing.home.features.title')}{' '}
              <span className="text-primary">{t('landing.home.features.highlight')}</span>
            </>
          }
          description={t('landing.home.features.description')}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <MarketingFeatureCard
                key={String(feature.title)}
                icon={<Icon className="h-5 w-5" />}
                title={feature.title}
                description={feature.description}
              />
            )
          })}
        </div>
      </div>
    </MarketingSection>
  )
}
