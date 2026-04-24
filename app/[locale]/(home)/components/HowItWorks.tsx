import { BarChart3, Link2, TrendingUp } from 'lucide-react'
import {
  MarketingSection,
  MarketingSectionHeader,
  MarketingStepCard,
} from '@/components/layout/marketing-sections'
import { getTypedI18n } from '@/locales/server'

const stepIcons = [Link2, BarChart3, TrendingUp]

export default async function HowItWorks() {
  const t = await getTypedI18n()

  const steps = [1, 2, 3].map((index) => ({
    name: t(`landing.home.workflow.step${index}Name`),
    description: t(`landing.home.workflow.step${index}Description`),
    icon: stepIcons[index - 1],
  }))

  return (
    <MarketingSection id="how-it-works">
      <div className="space-y-12">
        <MarketingSectionHeader
          eyebrow={t('landing.home.workflow.eyebrow')}
          title={t('landing.home.workflow.title')}
          description={t('landing.home.workflow.description')}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <MarketingStepCard
                key={String(step.name)}
                step={`0${index + 1}`}
                icon={<Icon className="h-5 w-5" />}
                title={step.name}
                description={step.description}
              />
            )
          })}
        </div>
      </div>
    </MarketingSection>
  )
}
