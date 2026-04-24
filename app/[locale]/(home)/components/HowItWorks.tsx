import {
  MarketingSection,
  MarketingSectionHeader,
} from '@/components/layout/marketing-sections'
import { getTypedI18n } from '@/locales/server'
import ProductDemoPlayer from './ProductDemoPlayer'

export default async function HowItWorks() {
  const t = await getTypedI18n()

  return (
    <MarketingSection id="how-it-works">
      <div className="space-y-12">
        <MarketingSectionHeader
          eyebrow={t('landing.home.workflow.eyebrow')}
          title={t('landing.home.workflow.title')}
          description={t('landing.home.workflow.description')}
        />
        <ProductDemoPlayer />
      </div>
    </MarketingSection>
  )
}
