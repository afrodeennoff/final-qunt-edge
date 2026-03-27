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
    <section id="pricing" className="py-24 bg-[#0b0b0d]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold mb-4 text-[#E0E0E0]">
            Simple, transparent{' '}
            <span className="text-[#2962FF]">pricing</span>
          </h2>
          <p className="text-lg text-[#9E9E9E] mb-8">
            Start free. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-[#101014] border border-[#1A1A21]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAnnual
                  ? 'bg-[#2962FF] text-white'
                  : 'text-[#9E9E9E] hover:text-[#E0E0E0]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAnnual
                  ? 'bg-[#2962FF] text-white'
                  : 'text-[#9E9E9E] hover:text-[#E0E0E0]'
              }`}
            >
              Annual <span className="text-[#089981]">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative rounded-xl border p-6
                ${plan.variant === 'featured'
                  ? 'border-[#2962FF] bg-[#0b0b0d]'
                  : 'border-[#1A1A21] bg-[#0b0b0d]'}
              `}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-medium bg-[#2962FF] text-white rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-lg font-medium text-[#E0E0E0] mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-[#E0E0E0]">
                  {plan.price}
                </span>
                <span className="text-[#707070]">{plan.period}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#707070] mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#089981] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#9E9E9E]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.variant === 'featured' ? 'default' : 'outline'}
                className={`w-full ${
                  plan.variant === 'featured'
                    ? 'bg-[#2962FF] hover:bg-[#2962FF]/90'
                    : 'border-[#1A1A21] text-[#E0E0E0]'
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
