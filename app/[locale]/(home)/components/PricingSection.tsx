'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
          <h2 className="mb-5 text-[clamp(1.9rem,4.9vw,3.45rem)] font-[350] tracking-[-0.045em] text-foreground/95 leading-tight [font-family:var(--home-display)]">
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">pricing</span>
          </h2>
          <p className="mb-8 text-base leading-[1.8] text-foreground/56 sm:text-lg [font-family:var(--home-copy)]">
            Start free. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              aria-pressed={!isAnnual}
              className={`px-5 py-2.5 rounded-lg text-[0.85rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                !isAnnual
                  ? 'rounded-full bg-white text-black'
                  : 'text-foreground/46 hover:text-foreground/95'
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
                  ? 'rounded-full bg-white text-black'
                  : 'text-foreground/46 hover:text-foreground/95'
              }`}
            >
              Annual <span className="text-success font-semibold">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards - Glassmorphism */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease }}
              className={`
                relative rounded-[2rem] border p-7 lg:p-8 transition-all duration-300
                ${
                  plan.variant === 'featured'
                    ? 'border border-[oklch(0.65_0.22_260/0.28)] bg-[oklch(0.045_0.006_264)] shadow-[0_0_0_0.5px_oklch(0.65_0.22_260/0.18),0_0_40px_oklch(0.65_0.22_260/0.08),0_28px_80px_-44px_rgba(0,0,0,0.95)]'
                    : 'border border-white/[0.08] bg-[oklch(0.038_0.005_264)] shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_24px_60px_-36px_rgba(0,0,0,0.92)] hover:-translate-y-1 hover:border-white/[0.14]'
                }
              `}
            >
              {plan.variant === 'featured' && (
                <div className="absolute -inset-0.5 -z-10 rounded-[2.1rem] border border-[var(--accent-blue)]/20" />
              )}
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
                      {plan.badge}
                    </span>
                  </div>
              )}

              {/* Plan Name */}
              <h3 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-foreground/95 [font-family:var(--home-display)]">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                  <span className="font-mono text-5xl font-[250] tracking-[-0.05em] tabular-nums text-white lg:text-[3.25rem]">
                  {plan.pricing[billingCycle]}
                </span>
                <span className="text-[0.9rem] text-foreground/38">{plan.period[billingCycle]}</span>
                {plan.name === 'Pro' && billingCycle === 'annual' && (
                  <span className="ml-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-success">
                    Billed annually
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mb-7 text-[0.92rem] leading-[1.75] text-foreground/56 [font-family:var(--home-copy)]">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-green-subtle)]">
                      <Check className="w-3 h-3 text-[var(--accent-green)]" />
                    </div>
                    <span className="text-[0.875rem] text-foreground/62 [font-family:var(--home-copy)]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.variant === 'featured' ? (
                  <MagneticButton strength={6}>
                  <Button
                    className="h-11 w-full rounded-full bg-white text-[0.9rem] font-semibold text-black transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 hover:bg-white/90"
                  >
                    {plan.cta}
                  </Button>
                </MagneticButton>
              ) : (
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-full border border-white/[0.12] bg-white/[0.04] text-[0.9rem] font-medium text-foreground/76 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-foreground/95"
                >
                  {plan.cta}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
