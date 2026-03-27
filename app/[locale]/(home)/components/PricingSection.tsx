'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '100 trades/month',
      '1 broker connection',
      'Basic analytics',
      '7-day data retention',
    ],
    cta: 'Get Started',
    variant: 'outline' as const,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For serious traders',
    features: [
      'Unlimited trades',
      'All broker connections',
      'AI insights',
      'Unlimited data retention',
      'Priority support',
      'Coach-ready exports',
    ],
    cta: 'Start Free Trial',
    badge: 'Most Popular',
    variant: 'featured' as const,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and firms',
    features: [
      'Everything in Pro',
      'Team management',
      'SSO integration',
      'Custom SLAs',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    variant: 'outline' as const,
  },
]

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <section id="pricing" className="py-20 sm:py-28 lg:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.025em] mb-5 text-foreground leading-tight">
            Simple, transparent{' '}
            <span className="text-gradient-primary">pricing</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 mb-8 leading-relaxed">
            Start free. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-input/60 border border-border/50">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2.5 rounded-lg text-[0.85rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                !isAnnual
                  ? 'bg-primary text-white shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2.5 rounded-lg text-[0.85rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                isAnnual
                  ? 'bg-primary text-white shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual <span className="text-success font-semibold">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative rounded-2xl border p-7 lg:p-8 transition-all duration-300
                ${plan.variant === 'featured'
                  ? 'border-primary/30 bg-card shadow-[0_0_48px_-16px_hsl(var(--primary)/0.2)]'
                  : 'border-border/50 bg-card/50 hover:border-border/70 hover:bg-card/70'}
              `}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] bg-primary text-white rounded-full shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.5)]">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-lg font-semibold text-foreground mb-2 tracking-[-0.01em]">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl lg:text-[2.75rem] font-bold text-foreground tracking-[-0.02em]">
                  {plan.price}
                </span>
                <span className="text-muted-foreground/70 text-[0.9rem]">{plan.period}</span>
              </div>

              {/* Description */}
              <p className="text-[0.9rem] text-muted-foreground/70 mb-7 leading-relaxed">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-[0.875rem] text-muted-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.variant === 'featured' ? 'default' : 'outline'}
                className={`w-full rounded-xl h-11 text-[0.9rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                  plan.variant === 'featured'
                    ? 'bg-primary hover:bg-primary/90 btn-primary-glow'
                    : 'border-border/50 text-foreground hover:border-border hover:bg-card'
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
