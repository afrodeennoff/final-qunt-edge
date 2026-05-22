import {
  MarketingPricingCard,
  MarketingSection,
  MarketingSectionHeader,
} from '@/components/layout/marketing-sections'
import { buildWhopCheckoutUrl } from '@/lib/whop-checkout'
import { getTypedI18n } from '@/locales/server'

export async function MarketingPricingSection({
  locale,
  id = 'pricing',
  showHeader = true,
  titleAs = 'h2',
}: {
  locale: string
  id?: string
  showHeader?: boolean
  titleAs?: 'h1' | 'h2'
}) {
  const t = await getTypedI18n()

  const plans = [
    {
      name: t('landing.pricingNew.starter.name'),
      price: t('landing.pricingNew.starter.price'),
      period: t('landing.pricingNew.starter.period'),
      description: t('landing.pricingNew.starter.description'),
      features: [0, 1, 2, 3].map((index) => t(`landing.pricingNew.starter.features.${index}`)),
      cta: t('landing.pricingNew.starter.cta'),
      href: `/${locale}/authentication?next=dashboard`,
      highlighted: false,
    },
    {
      name: t('landing.pricingNew.pro.name'),
      price: t('landing.pricingNew.pro.annualPrice'),
      period: t('landing.pricingNew.pro.period'),
      description: t('landing.pricingNew.pro.description'),
      features: [0, 1, 2, 3].map((index) => t(`landing.pricingNew.pro.features.${index}`)),
      cta: t('landing.pricingNew.pro.cta'),
      href: buildWhopCheckoutUrl({ lookupKey: 'plus_yearly_usd', locale }),
      highlighted: true,
      badge: t('landing.pricingNew.pro.badge'),
      billingNote: t('landing.pricingNew.annualNote'),
    },
    {
      name: t('landing.pricingNew.enterprise.name'),
      price: t('landing.pricingNew.enterprise.price'),
      period: t('landing.pricingNew.enterprise.period'),
      description: t('landing.pricingNew.enterprise.description'),
      features: [0, 1, 2, 3].map((index) => t(`landing.pricingNew.enterprise.features.${index}`)),
      cta: t('landing.pricingNew.enterprise.cta'),
      href: `/${locale}/support`,
      highlighted: false,
    },
  ]

  return (
    <MarketingSection id={id}>
      <div className="space-y-12">
        {showHeader ? (
          <MarketingSectionHeader
            eyebrow={t('landing.pricingNew.eyebrow')}
            title={t('landing.pricingNew.headline', {
              highlight: t('landing.pricingNew.highlight'),
            })}
            titleAs={titleAs}
            description={t('landing.pricingNew.subheadline')}
          />
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <MarketingPricingCard
              key={String(plan.name)}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              cta={plan.cta}
              href={plan.href}
              highlighted={plan.highlighted}
              badge={plan.badge}
              billingNote={plan.billingNote}
            />
          ))}
        </div>
      </div>
    </MarketingSection>
  )
}
