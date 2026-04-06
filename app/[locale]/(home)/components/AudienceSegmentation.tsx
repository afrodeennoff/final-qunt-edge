'use client'

import { motion } from 'framer-motion'
import { Target, TrendingUp, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { BadgeV2 } from '@/components/ui/v2'
import {
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
} from '@/components/animation/enhanced-motion'
import {
  MOTION_EASE,
  STAGGER_CARD,
  BORDER_SECTION,
  TYPO_MINOR,
  TYPO_EYEBROW,
} from './_constants'

const ease = MOTION_EASE as unknown as number[]

const audiences = [
  {
    badge: 'Prop Firm',
    icon: Target,
    title: 'For Prop Firm Traders',
    description:
      'Protect your funded account and prove consistency to your evaluation firm.',
    features: [
      'Challenge rule tracking with real-time violation alerts',
      'Daily and max drawdown monitoring across all accounts',
      'Payout verification with detailed performance reports',
      'Team process audit for desk managers and mentors',
      'Multi-account review in a single unified view',
    ],
    cta: 'Start Protecting Your Edge',
    gradient: 'from-primary/10 via-primary/[0.04] to-transparent',
    iconBorder: 'border-primary/40 bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    badge: 'Independent',
    icon: TrendingUp,
    title: 'For Independent Traders',
    description:
      'Build repeatable routines and eliminate emotional drift from your trading.',
    features: [
      'Multi-account management across brokers and platforms',
      'Real-time broker sync with Tradovate, Rithmic, MT5',
      'AI-powered behavioral insights and pattern detection',
      'Execution quality scoring against your personal ruleset',
      'Automated weekly briefs for structured self-review',
    ],
    cta: 'Build Your Edge',
    gradient: 'from-primary/[0.06] via-transparent to-primary/[0.04]',
    iconBorder: 'border-primary/40 bg-primary/10',
    iconColor: 'text-primary',
  },
] as const

type Audience = (typeof audiences)[number]

function AudienceCard({
  audience,
  index,
}: {
  audience: Audience
  index: number
}) {
  const Icon = audience.icon

  return (
    <GlassCard
      variant="strong"
      hover
      size="lg"
      className="relative overflow-hidden h-full"
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-[var(--radius)] bg-gradient-to-br ${audience.gradient}`}
      />

      <div className="relative z-10">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <BadgeV2
              variant="outline"
              size="sm"
              className="mb-3 border-primary/35 bg-primary/10 text-primary"
            >
              {audience.badge}
            </BadgeV2>
            <h3 className="text-[clamp(1.1rem,2.2vw,1.4rem)] font-semibold tracking-[-0.01em] text-foreground [font-family:var(--home-display)]">
              {audience.title}
            </h3>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>

        <p className="mb-5 text-[0.9rem] leading-relaxed text-muted-foreground/70 [font-family:var(--home-copy)]">
          {audience.description}
        </p>

        <ul className="mb-6 space-y-2.5">
          {audience.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              <span className="text-[0.85rem] leading-relaxed text-muted-foreground/80 [font-family:var(--home-copy)]">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          className="group inline-flex items-center gap-2 text-[0.88rem] font-medium text-primary transition-colors hover:text-primary/80"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease, delay: 0.3 + index * 0.1 }}
        >
          {audience.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>
    </GlassCard>
  )
}

export default function AudienceSegmentation() {
  return (
    <MotionSection className={BORDER_SECTION}>
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <p
            className={`${TYPO_EYEBROW} text-muted-foreground/60 mb-3 [font-family:var(--home-copy)]`}
          >
            Built For You
          </p>
          <h2
            className={`${TYPO_MINOR} text-foreground leading-tight [font-family:var(--home-display)]`}
          >
            Whatever your trading style,{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              we&apos;ve got you
            </span>
          </h2>
        </motion.div>

        <MotionStagger
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
          delay={STAGGER_CARD}
        >
          {audiences.map((audience, index) => (
            <MotionStaggerItem key={audience.title}>
              <AudienceCard audience={audience} index={index} />
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </MotionSection>
  )
}
