import {
  MarketingBrowserFrame,
  MarketingSection,
  MarketingSectionHeader,
} from '@/components/layout/marketing-sections'
import { getTypedI18n } from '@/locales/server'
import ProductDemoPlayer from './ProductDemoPlayer'

export default async function ProductDemo() {
  const t = await getTypedI18n()

  return (
    <MarketingSection id="product-walkthrough" className="pt-8 lg:pt-10">
      <div className="space-y-12">
        <MarketingSectionHeader
          eyebrow={t('landing.home.demo.eyebrow')}
          title={t('landing.home.demo.title')}
          description={t('landing.home.demo.description')}
        />
        <MarketingBrowserFrame label={t('landing.home.demo.frameLabel')}>
          <ProductDemoPlayer />
        </MarketingBrowserFrame>
      </div>
    </MarketingSection>
  )
}
