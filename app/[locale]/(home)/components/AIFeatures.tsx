'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Radar,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
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

const aiFeatures = [
  {
    icon: Brain,
    title: 'AI Session Debrief',
    description:
      'Creates concise recaps of what worked, what broke, and what to adjust next session — turning raw trades into coaching feedback.',
    colSpan: 'md:col-span-2',
    accent: 'blue' as const,
  },
  {
    icon: Radar,
    title: 'Behavior Drift Radar',
    description:
      'Flags subtle shifts in risk behavior and setup quality before they become costly drawdowns.',
    colSpan: 'md:col-span-1',
    accent: 'green' as const,
  },
  {
    icon: ShieldAlert,
    title: 'Risk Assessment',
    description:
      'Real-time risk scoring that evaluates sizing, frequency, and emotional variance against your personal thresholds.',
    colSpan: 'md:col-span-1',
    accent: 'orange' as const,
  },
  {
    icon: Sparkles,
    title: 'Smart Insights & Briefs',
    description:
      'Auto-compiles weekly performance reports, playbook templates, and intervention alerts for structured self-review and mentorship.',
    colSpan: 'md:col-span-2',
    accent: 'blue' as const,
  },
] as const

type AIFeature = (typeof aiFeatures)[number]

const ACCENT_MAP = {
  blue: {
    badge: 'border-[var(--accent-blue-border)] bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]',
    icon: 'bg-[var(--accent-blue-subtle)] border-[var(--accent-blue-border)] text-[var(--accent-blue)]',
  },
  green: {
    badge: 'border-[var(--accent-green-border)] bg-[var(--accent-green-subtle)] text-[var(--accent-green)]',
    icon: 'bg-[var(--accent-green-subtle)] border-[var(--accent-green-border)] text-[var(--accent-green)]',
  },
  orange: {
    badge: 'border-[var(--accent-orange-border)] bg-[var(--accent-orange-subtle)] text-[var(--accent-orange)]',
    icon: 'bg-[var(--accent-orange-subtle)] border-[var(--accent-orange-border)] text-[var(--accent-orange)]',
  },
} as const

function AIFeatureCard({ feature }: { feature: AIFeature }) {
  const Icon = feature.icon
  const accent = ACCENT_MAP[feature.accent]

  return (
    <div className="relative overflow-hidden h-full rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] hover:border-[var(--frost-border-strong)] transition-colors">
      <div className="mb-4 inline-flex items-center justify-center rounded-xl w-12 h-12">
        <div className="absolute inset-0 rounded-xl bg-[oklch(0.08_0_0)] blur-sm" />
        <div className={`relative inline-flex items-center justify-center rounded-xl w-12 h-12 border ${accent.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${accent.badge}`}>
        AI Feature
      </span>

      <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.01em] text-foreground [font-family:var(--home-display)]">
        {feature.title}
      </h3>
      <p className="mt-2 text-[0.88rem] leading-relaxed text-muted-foreground/70 [font-family:var(--home-copy)]">
        {feature.description}
      </p>

      <div className="mt-4 flex items-center gap-1.5 text-[0.8rem] font-medium text-muted-foreground/70 transition-colors hover:text-foreground">
        <ArrowRight className="w-3.5 h-3.5" />
        <span>Learn more</span>
      </div>
    </div>
  )
}

export default function AIFeatures() {
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
            AI-Powered
          </p>
          <h2
            className={`${TYPO_MINOR} text-foreground leading-tight [font-family:var(--home-display)]`}
          >
            Your trades, analyzed by{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              intelligence
            </span>
          </h2>
          <p className="mt-4 text-[0.95rem] sm:text-lg text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Six AI capabilities working together to turn raw trade data into
            actionable coaching, behavioral insights, and structured improvement plans.
          </p>
        </motion.div>

        <MotionStagger
          className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4"
          delay={STAGGER_CARD}
        >
          {aiFeatures.map((feature) => (
            <MotionStaggerItem key={feature.title} className={feature.colSpan}>
              <AIFeatureCard feature={feature} />
            </MotionStaggerItem>
          ))}
        </MotionStagger>

        <motion.div
          className="mt-4 rounded-2xl border border-[var(--frost-border)] bg-[oklch(0.05_0_0)] p-5 sm:p-6"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.4 }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI decisions stay auditable with a transparent reason trail, so
              every recommendation can be reviewed and trusted.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-blue-border)] bg-[var(--accent-blue-subtle)] px-3 py-1 text-xs font-medium text-[var(--accent-blue)] w-fit shrink-0">
              Explainable AI
            </span>
          </div>
        </motion.div>
      </div>
    </MotionSection>
  )
}
