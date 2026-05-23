'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTypedI18n } from '@/locales/client'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { CardV2 as Card } from '@/components/ui/v2'

type BillingCycle = 'monthly' | 'annual'

export default function PricingSection({ locale }: { locale: string }) {
  const t = useTypedI18n()
  const [isAnnual, setIsAnnual] = useState(true)
  const billingCycle: BillingCycle = isAnnual ? 'annual' : 'monthly'

  const plans = [
    {
      name: t('landing.pricingNew.starter.name'),
      price: billingCycle === 'annual' ? t('landing.pricingNew.starter.annualPrice') : t('landing.pricingNew.starter.price'),
      period: t('landing.pricingNew.starter.period'),
      description: t('landing.pricingNew.starter.description'),
      features: [0, 1, 2, 3].map((index) => t(`landing.pricingNew.starter.features.${index}`)),
      cta: t('landing.pricingNew.starter.cta'),
      href: `/${locale}/authentication?next=dashboard`,
      featured: false,
    },
    {
      name: t('landing.pricingNew.pro.name'),
      price: billingCycle === 'annual' ? t('landing.pricingNew.pro.annualPrice') : t('landing.pricingNew.pro.price'),
      period: t('landing.pricingNew.pro.period'),
      description: t('landing.pricingNew.pro.description'),
      features: [0, 1, 2, 3, 4, 5].map((index) => t(`landing.pricingNew.pro.features.${index}`)),
      cta: t('landing.pricingNew.pro.cta'),
      href: `/${locale}/authentication?next=dashboard`,
      badge: t('landing.pricingNew.pro.badge'),
      featured: true,
    },
    {
      name: t('landing.pricingNew.enterprise.name'),
      price: billingCycle === 'annual' ? t('landing.pricingNew.enterprise.annualPrice') : t('landing.pricingNew.enterprise.price'),
      period: t('landing.pricingNew.enterprise.period'),
      description: t('landing.pricingNew.enterprise.description'),
      features: [0, 1, 2, 3, 4].map((index) => t(`landing.pricingNew.enterprise.features.${index}`)),
      cta: t('landing.pricingNew.enterprise.cta'),
      href: `/${locale}/support`,
      featured: false,
    },
  ]

  return (
    <MarketingSection id="pricing" className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1280px]">
      <div className="space-y-4">
        <div className="p-6 text-center md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Pricing</p>
          <h2 className="mt-4 text-balance text-[clamp(2.2rem,4.8vw,4.2rem)] font-medium leading-[0.96] tracking-[-0.05em] text-foreground">
            {t('landing.pricingNew.headline', { highlight: t('landing.pricingNew.highlight') })}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t('landing.pricingNew.subheadline')}
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              aria-pressed={!isAnnual}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                !isAnnual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t('landing.pricingNew.monthly')}
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              aria-pressed={isAnnual}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                isAnnual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t('landing.pricingNew.annual')}{' '}
              <span className="text-xs font-semibold">{t('landing.pricingNew.annualDiscount')}</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={String(plan.name)}
              className={cn(
                'relative flex h-full flex-col p-6',
                plan.featured && 'border-primary/30',
              )}
            >
              {plan.badge ? (
                <div className="absolute -top-3 left-6">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                    {plan.badge}
                  </span>
                </div>
              ) : null}

              <h3 className="text-[1.14rem] font-semibold tracking-[-0.02em] text-foreground">{plan.name}</h3>

              <div className="mt-4">
                <span className="tabular-nums text-5xl font-semibold tracking-[-0.06em] text-foreground">{plan.price}</span>
                <span className="ml-2 text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <p className="mt-4 text-sm leading-[1.65] text-muted-foreground">{plan.description}</p>

              <ul className="mt-6 grid flex-1 gap-4">
                {plan.features.map((feature) => (
                  <li key={String(feature)} className="flex items-start gap-4">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  'mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors',
                  plan.featured
                    ? 'bg-primary text-primary-foreground hover:brightness-110'
                    : 'border border-border bg-muted/30 text-foreground hover:bg-muted',
                )}
              >
                {plan.cta}
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </MarketingSection>
  )
}
