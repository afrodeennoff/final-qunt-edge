'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ButtonV2 } from '@/components/ui/v2'

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

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
}

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const billingCycle: BillingCycle = isAnnual ? 'annual' : 'monthly'

  return (
    <section id="pricing" className="py-20 sm:py-28 lg:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
          <h2 className="text-[clamp(1.9rem,4.9vw,3.45rem)] font-semibold tracking-[-0.025em] mb-5 text-foreground leading-tight [font-family:var(--home-display)]">
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">pricing</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 mb-8 leading-relaxed [font-family:var(--home-copy)]">
            Start free. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-input/60 border border-border/50">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              aria-pressed={!isAnnual}
              className={`px-5 py-2.5 rounded-lg text-[0.85rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                !isAnnual
                  ? 'bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]'
                  : 'text-muted-foreground hover:text-foreground'
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
                  ? 'bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual <span className="text-success font-semibold">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              className={`
                relative rounded-2xl border p-7 lg:p-8 backdrop-blur-sm transition-all duration-300
                ${
                  plan.variant === 'featured'
                    ? 'border-primary/30 bg-card/80 shadow-[0_0_48px_-16px_hsl(var(--primary)/0.2)]'
                    : 'bg-card/60 border-border/40 hover:border-border/70 hover:bg-card/70'
                }
              `}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] bg-primary text-primary-foreground rounded-full shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.5)]">
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
                <span className="text-5xl lg:text-[3.25rem] font-bold text-foreground tracking-[-0.02em] [font-family:var(--home-display)]">
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
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-[0.875rem] text-muted-foreground/80 [font-family:var(--home-copy)]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <ButtonV2
                variant={plan.variant === 'featured' ? 'default' : 'outline'}
                className={`w-full rounded-xl h-11 text-[0.9rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                  plan.variant === 'featured'
                    ? 'bg-primary hover:bg-primary/90 btn-primary-glow'
                    : 'border-border/50 text-foreground hover:border-border hover:bg-card'
                }`}
              >
                {plan.cta}
              </ButtonV2>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
