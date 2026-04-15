'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MagneticButton } from '@/components/animation/interactive'
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
    <section id="pricing" className="bg-muted/30 px-4 py-16 sm:py-20 lg:py-24 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1360px]">
        <motion.div
          className="mb-10 text-center md:mb-14"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="type-h2 text-balance text-foreground lg:text-h1">
            {t('landing.pricingNew.headline', {
              highlight: t('landing.pricingNew.highlight'),
            })}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t('landing.pricingNew.subheadline')}
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-card/70 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              aria-pressed={!isAnnual}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                !isAnnual
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('landing.pricingNew.monthly')}
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              aria-pressed={isAnnual}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                isAnnual
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('landing.pricingNew.annual')}{' '}
              <span className="text-xs font-semibold">
                {t('landing.pricingNew.annualDiscount')}
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
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
              className={`relative flex h-full flex-col rounded-lg border p-6 ${
                plan.featured
                  ? 'border-primary/30 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]'
                  : 'border-white/[0.06] bg-card/70 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]'
              }`}
            >
              {plan.badge ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground">
                    {plan.badge}
                  </span>
                </div>
              ) : null}

              <h3 className="type-h4 text-foreground">{plan.name}</h3>

              <div className="mt-4">
                <span className="tabular-nums text-5xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">{plan.period}</span>
                {plan.featured && billingCycle === 'annual' ? (
                  <span className="ml-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    {t('landing.pricingNew.annualNote')}
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

              <ul className="mt-6 grid flex-1 gap-3">
                {plan.features.map((feature) => (
                  <li key={String(feature)} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.featured ? (
                <MagneticButton strength={6}>
                  <Button asChild className="mt-6 h-11 w-full rounded-full text-sm font-semibold">
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </MagneticButton>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="mt-6 h-11 w-full rounded-full border-white/[0.06] bg-background/70 text-sm font-medium text-foreground hover:bg-background"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
