'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useCurrentLocale } from '@/locales/client'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildWhopCheckoutUrl } from '@/lib/whop-checkout'
import { useCurrency } from '@/hooks/use-currency'

type BillingMode = 'monthly' | 'annual'

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    subtitle: 'For traders building foundational review discipline',
    features: ['Manual journaling', 'Core trade analytics', 'Weekly process snapshot'],
    cta: 'Start Free Audit',
    note: 'No card required',
    popular: false,
  },
  {
    name: 'Pro AI',
    monthlyPrice: 29,
    yearlyPrice: 24,
    subtitle: 'For serious traders optimizing execution quality',
    features: [
      'AI session debriefs',
      'Behavior drift detection',
      'Execution quality scoring',
      'Advanced dashboards',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    note: 'Best for active discretionary traders',
    popular: true,
  },
  {
    name: 'Desk',
    monthlyPrice: 99,
    yearlyPrice: 84,
    subtitle: 'For prop teams, mentors, and performance managers',
    features: ['Team analytics workspace', 'Role-based reporting', 'Coaching intervention feed', 'Shared playbooks'],
    cta: 'Talk To Sales',
    note: 'Volume pricing for larger desks',
    popular: false,
  },
]

function getPlanHref({
  planName,
  billingMode,
  currency,
  locale,
}: {
  planName: string
  billingMode: BillingMode
  currency: string
  locale: string
}): string {
  if (planName === 'Pro AI') {
    return buildWhopCheckoutUrl({
      lookupKey: `plus_${billingMode === 'annual' ? 'yearly' : 'monthly'}_${currency.toLowerCase()}`,
      locale,
    })
  }

  if (planName === 'Desk') {
    return `/${locale}/support`
  }

  return `/${locale}/authentication?next=dashboard`
}

function getPlanPriceText(plan: (typeof plans)[number], billingMode: BillingMode): string {
  if (plan.monthlyPrice === 0) return '$0'
  return `$${billingMode === 'annual' ? plan.yearlyPrice : plan.monthlyPrice}`
}

function getPlanPeriodText(plan: (typeof plans)[number], periodLabel: string): string {
  return plan.monthlyPrice === 0 ? '/month' : periodLabel
}

function getSavingsPerMonth(plan: (typeof plans)[number]): number {
  return plan.monthlyPrice - plan.yearlyPrice
}

function getPlanCardClassName(popular: boolean): string {
  return cn(
    'group relative flex w-full flex-col rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--card)/0.6)] backdrop-blur-sm transition-all duration-500',
    'hover:border-[hsl(var(--primary)/0.45)] hover:bg-[hsl(var(--card)/0.85)] hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.2)]',
    popular && 'border-[hsl(var(--primary)/0.5)] shadow-[0_0_35px_-12px_hsl(var(--primary)/0.3)]'
  )
}

function getPlanCtaClassName(popular: boolean): string {
  return cn(
    'h-12 w-full rounded-xl text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 [font-family:var(--home-copy)]',
    popular
      ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-luxury-hover))] text-[hsl(var(--primary-foreground))] shadow-[0_4px_20px_-6px_hsl(var(--primary)/0.5)] hover:shadow-[0_6px_28px_-4px_hsl(var(--primary)/0.6)] hover:brightness-110'
      : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--primary)/0.15)] hover:border-[hsl(var(--primary)/0.3)] border border-[hsl(var(--border)/0.3)]'
  )
}

function shouldShowSavings(billingMode: BillingMode, monthlyPrice: number): boolean {
  if (billingMode !== 'annual') return false
  return monthlyPrice > 0
}

function PlanPopularBadge({ popular }: { popular: boolean }) {
  if (!popular) return null
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
      <Badge className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-luxury-hover))] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary-foreground))] shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.5)]">
        <Sparkles className="mr-1.5 h-3 w-3" />
        Most Popular
      </Badge>
    </div>
  )
}

function PlanSavingsNote({ show, savings }: { show: boolean; savings: number }) {
  if (!show) return null
  return (
    <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary)/0.9)] [font-family:var(--home-copy)]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--primary)/0.6)] opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></span>
      </span>
      Save ${savings}/month with annual billing
    </p>
  )
}

function PlanCard({
  plan,
  billingMode,
  currency,
  locale,
  periodLabel,
}: {
  plan: (typeof plans)[number]
  billingMode: BillingMode
  currency: string
  locale: string
  periodLabel: string
}) {
  const href = getPlanHref({ planName: plan.name, billingMode, currency, locale })
  const priceText = getPlanPriceText(plan, billingMode)
  const periodText = getPlanPeriodText(plan, periodLabel)
  const savings = getSavingsPerMonth(plan)
  const showSavings = shouldShowSavings(billingMode, plan.monthlyPrice)

  return (
    <div className="flex">
      <Card className={getPlanCardClassName(plan.popular)}>
        <PlanPopularBadge popular={plan.popular} />

        <CardHeader className="relative pb-6">
          <CardTitle className="text-[1.5rem] font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">
            {plan.name}
          </CardTitle>
          
          <div className="mt-5 flex items-baseline">
            <span className="text-[3.5rem] font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))] [font-family:var(--home-display)]">
              {priceText}
            </span>
            <span className="ml-2 text-sm font-medium text-[hsl(var(--foreground)/0.6)] [font-family:var(--home-copy)]">
              {periodText}
            </span>
          </div>
          
          <CardDescription className="mt-3 text-sm leading-relaxed text-[hsl(var(--foreground)/0.7)] [font-family:var(--home-copy)]">
            {plan.subtitle}
          </CardDescription>
          
          <PlanSavingsNote show={showSavings} savings={savings} />
        </CardHeader>

        <CardContent className="flex-1 pb-8">
          <ul className="space-y-4">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3.5 text-sm text-[hsl(var(--foreground)/0.8)] transition-transform duration-300 [font-family:var(--home-copy)] group-hover:translate-x-1"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--primary)/0.12)] ring-1 ring-[hsl(var(--primary)/0.25)]">
                  <Check className="h-3 w-3 text-[hsl(var(--primary))]" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            asChild
            className={getPlanCtaClassName(plan.popular)}
          >
            <Link href={href}>{plan.cta}</Link>
          </Button>
          <p className="text-center text-xs text-[hsl(var(--foreground)/0.6)] [font-family:var(--home-copy)]">{plan.note}</p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function PricingSection() {
  const locale = useCurrentLocale()
  const { currency } = useCurrency()
  const [billingMode, setBillingMode] = useState<BillingMode>('annual')

  const periodLabel = billingMode === 'annual' ? '/month, billed yearly' : '/month'

  return (
    <section id="pricing" className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2">
          <div className="h-[600px] w-[800px] rounded-full bg-[hsl(var(--primary)/0.03)] blur-[120px]" />
        </div>
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[600px] rounded-full bg-[hsl(var(--accent-rose)/0.02)] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <Badge variant="outline" className="mb-5 border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.08)] px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--primary)/0.9)] [font-family:var(--home-copy)]">
            Pricing
          </Badge>
          
          <h2 className="text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-[hsl(var(--foreground))] [font-family:var(--home-display)]">
            Choose your
            <span className="block mt-1 bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--primary)/0.85)] bg-clip-text text-transparent">
              performance operating system
            </span>
          </h2>
          
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.75] text-[hsl(var(--foreground)/0.75)] sm:text-[18px] [font-family:var(--home-copy)]">
            Start free. Upgrade when you want deeper diagnostics, tighter coaching loops, and desk-grade review workflows.
          </p>
          
          <div className="mx-auto mt-8 inline-flex items-center rounded-xl border border-[hsl(var(--border)/0.25)] bg-[hsl(var(--card)/0.5)] p-1.5 shadow-lg shadow-black/20">
            <button
              type="button"
              onClick={() => setBillingMode('monthly')}
              className={cn(
                'relative rounded-lg px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] transition-all duration-300 [font-family:var(--home-copy)]',
                billingMode === 'monthly' 
                  ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--foreground))] shadow-md' 
                  : 'text-[hsl(var(--foreground)/0.6)] hover:text-[hsl(var(--foreground)/0.9)]'
              )}
              aria-pressed={billingMode === 'monthly'}
            >
              {billingMode === 'monthly' && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[hsl(var(--primary)/0.08)] to-transparent ring-1 ring-[hsl(var(--primary)/0.2)]" />
              )}
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingMode('annual')}
              className={cn(
                'relative rounded-lg px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] transition-all duration-300 [font-family:var(--home-copy)]',
                billingMode === 'annual' 
                  ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--foreground))] shadow-md' 
                  : 'text-[hsl(var(--foreground)/0.6)] hover:text-[hsl(var(--foreground)/0.9)]'
              )}
              aria-pressed={billingMode === 'annual'}
            >
              {billingMode === 'annual' && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[hsl(var(--primary)/0.08)] to-transparent ring-1 ring-[hsl(var(--primary)/0.2)]" />
              )}
              <span className="flex items-center gap-2">
                Annual
                <span className="rounded-full bg-[hsl(var(--primary)/0.2)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))]">
                  Save 17%
                </span>
              </span>
            </button>
          </div>
          
          <p className="mt-5 text-sm text-[hsl(var(--foreground)/0.6)] [font-family:var(--home-copy)]">
            7-day free trial on Pro AI. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              billingMode={billingMode}
              currency={currency}
              locale={locale}
              periodLabel={periodLabel}
            />
          ))}
        </div>
        
        <p className="mt-10 text-center text-sm text-[hsl(var(--foreground)/0.6)] [font-family:var(--home-copy)]">
          <span className="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary)/0.6)]"></span>
          Transparent pricing. No hidden data limits. Upgrade only when your review process needs more depth.
        </p>
      </div>
    </section>
  )
}
