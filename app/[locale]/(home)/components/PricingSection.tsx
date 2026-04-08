'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ButtonV2 } from '@/components/ui/v2'
import { MagneticButton } from '@/components/animation/interactive'
import { MOTION_EASE } from './_constants'

type BillingCycle = 'monthly' | 'annual'

const plans = [
  {
    name: 'Starter',
    pricing: {
      monthly: '$0',
      annual: '$0',
    },
    period: {
      monthly: '/month',
      annual: '/month',
    },
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
    pricing: {
      monthly: '$49',
      annual: '$39',
    },
    period: {
      monthly: '/month',
      annual: '/month',
    },
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
    pricing: {
      monthly: 'Custom',
      annual: 'Custom',
    },
    period: {
      monthly: '',
      annual: '',
    },
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

const ease = MOTION_EASE as unknown as number[]

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const billingCycle: BillingCycle = isAnnual ? 'annual' : 'monthly'

  return (
    <section id="pricing" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <h2 className="text-[clamp(1.9rem,4.9vw,3.45rem)] font-semibold tracking-[-0.025em] mb-5 text-foreground leading-tight [font-family:var(--home-display)]">
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">pricing</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 mb-8 leading-relaxed [font-family:var(--home-copy)]">
            Start free. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-[var(--radius-pill)] bg-[oklch(0.08_0_0)] border border-[var(--frost-border)]">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              aria-pressed={!isAnnual}
              className={`px-5 py-2.5 rounded-lg text-[0.85rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                !isAnnual
                  ? 'bg-white text-black rounded-full'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              aria-pressed={isAnnual}
              className={`px-5 py-2.5 rounded-lg text-[0.85rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                isAnnual
                  ? 'bg-white text-black rounded-full'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Annual <span className="text-success font-semibold">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards - Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease }}
              className={`
                relative rounded-2xl border p-7 lg:p-8 transition-all duration-300
                ${
                  plan.variant === 'featured'
                    ? 'border border-[var(--frost-border-strong)] bg-[var(--surface-card)]'
                    : 'border border-[var(--frost-border)] bg-[var(--surface-card)] hover:border-[var(--frost-border-strong)]'
                }
              `}
            >
              {plan.variant === 'featured' && (
                <div className="absolute -inset-0.5 rounded-3xl border border-[var(--accent-blue)]/20 -z-10" />
              )}
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-black rounded-[var(--radius-pill)] px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-lg font-semibold text-foreground mb-2 tracking-[-0.01em] [font-family:var(--home-display)]">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                  <span className="text-5xl lg:text-[3.25rem] font-bold font-mono tabular-nums tracking-tight text-white">
                  {plan.pricing[billingCycle]}
                </span>
                <span className="text-muted-foreground/70 text-[0.9rem]">{plan.period[billingCycle]}</span>
                {plan.name === 'Pro' && billingCycle === 'annual' && (
                  <span className="ml-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-success">
                    Billed annually
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[0.9rem] text-muted-foreground/70 mb-7 leading-relaxed [font-family:var(--home-copy)]">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent-green-subtle)] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[var(--accent-green)]" />
                    </div>
                    <span className="text-[0.875rem] text-muted-foreground/80 [font-family:var(--home-copy)]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.variant === 'featured' ? (
                  <MagneticButton strength={6}>
                  <ButtonV2
                    className="w-full rounded-[var(--radius-pill)] h-11 text-[0.9rem] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 bg-white text-black"
                  >
                    {plan.cta}
                  </ButtonV2>
                </MagneticButton>
              ) : (
                <ButtonV2
                  variant="outline"
                  className="w-full rounded-xl h-11 text-[0.9rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 border border-[var(--frost-border)] hover:border-[var(--frost-border-strong)]"
                >
                  {plan.cta}
                </ButtonV2>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
