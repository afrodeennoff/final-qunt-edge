'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import {
  unifiedChipClassName,
  unifiedGhostActionClassName,
  unifiedInsetPanelClassName,
  unifiedPrimaryActionClassName,
  unifiedSectionEyebrowClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { useTypedI18n } from '@/locales/client'

type BillingCycle = 'monthly' | 'annual'

export default function PricingSection({ locale }: { locale: string }) {
  const t = useTypedI18n()
  const [isAnnual, setIsAnnual] = useState(true)
  const billingCycle: BillingCycle = isAnnual ? 'annual' : 'monthly'

  const plans = [
    {
      name: t('landing.pricingNew.starter.name'),
      price:
        billingCycle === 'annual'
          ? t('landing.pricingNew.starter.annualPrice')
          : t('landing.pricingNew.starter.price'),
      period: t('landing.pricingNew.starter.period'),
      description: t('landing.pricingNew.starter.description'),
      features: [0, 1, 2, 3].map((index) => t(`landing.pricingNew.starter.features.${index}`)),
      cta: t('landing.pricingNew.starter.cta'),
      href: `/${locale}/authentication?next=dashboard`,
      featured: false,
    },
    {
      name: t('landing.pricingNew.pro.name'),
      price:
        billingCycle === 'annual'
          ? t('landing.pricingNew.pro.annualPrice')
          : t('landing.pricingNew.pro.price'),
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
      price:
        billingCycle === 'annual'
          ? t('landing.pricingNew.enterprise.annualPrice')
          : t('landing.pricingNew.enterprise.price'),
      period: t('landing.pricingNew.enterprise.period'),
      description: t('landing.pricingNew.enterprise.description'),
      features: [0, 1, 2, 3, 4].map((index) =>
        t(`landing.pricingNew.enterprise.features.${index}`),
      ),
      cta: t('landing.pricingNew.enterprise.cta'),
      href: `/${locale}/support`,
      featured: false,
    },
  ]

  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1360px] space-y-10">
        <div className="text-center">
          <p className={unifiedSectionEyebrowClassName}>Pricing</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t('landing.pricingNew.headline', {
              highlight: t('landing.pricingNew.highlight'),
            })}
          </h2>

          <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-border/35 bg-background/70 p-1">
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

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={String(plan.name)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                plan.featured ? unifiedSectionPanelClassName : unifiedInsetPanelClassName,
                'relative flex h-full flex-col p-6',
                plan.featured && 'border-primary/18',
              )}
            >
              {plan.badge ? (
                <div className="absolute -top-3 left-6">
                  <span className={cn(unifiedChipClassName, 'px-4 py-1.5')}>{plan.badge}</span>
                </div>
              ) : null}

              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {plan.name}
              </h3>

              <div className="mt-4">
                <span className="tabular-nums text-4xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">{plan.period}</span>
                {plan.featured && billingCycle === 'annual' ? (
                  <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    {t('landing.pricingNew.annualNote')}
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

              <ul className="mt-6 grid flex-1 gap-3">
                {plan.features.map((feature) => (
                  <li key={String(feature)} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  plan.featured ? unifiedPrimaryActionClassName : unifiedGhostActionClassName,
                  'mt-6 w-full',
                )}
              >
                {plan.cta}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
