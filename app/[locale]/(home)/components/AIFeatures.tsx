'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Radar,
  Bot,
  Sparkles,
  ShieldAlert,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
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

const aiFeatures = [
  {
    icon: Brain,
    title: 'AI Session Debrief',
    description:
      'Creates concise recaps of what worked, what broke, and what to adjust next session — turning raw trades into coaching feedback.',
    colSpan: 'md:col-span-2',
  },
  {
    icon: Radar,
    title: 'Behavior Drift Radar',
    description:
      'Flags subtle shifts in risk behavior and setup quality before they become costly drawdowns.',
    colSpan: 'md:col-span-1',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Assessment',
    description:
      'Real-time risk scoring that evaluates sizing, frequency, and emotional variance against your personal thresholds.',
    colSpan: 'md:col-span-1',
  },
  {
    icon: Sparkles,
    title: 'Smart Insights & Briefs',
    description:
      'Auto-compiles weekly performance reports, playbook templates, and intervention alerts for structured self-review and mentorship.',
    colSpan: 'md:col-span-2',
  },
] as const

type AIFeature = (typeof aiFeatures)[number]

function AIFeatureCard({ feature }: { feature: AIFeature }) {
  const Icon = feature.icon

  return (
    <GlassCard
      variant="subtle"
      hover
      size="md"
      className="relative overflow-hidden h-full bg-gradient-to-br from-primary/[0.06] to-transparent"
    >
      <div className="mb-4 inline-flex items-center justify-center rounded-xl w-12 h-12">
        <div className="absolute inset-0 rounded-xl bg-primary/15 blur-sm" />
        <div className="relative inline-flex items-center justify-center rounded-xl w-12 h-12 border border-primary/40 bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>

      <h3 className="text-[1.05rem] font-semibold tracking-[-0.01em] text-foreground [font-family:var(--home-display)]">
        {feature.title}
      </h3>
      <p className="mt-2 text-[0.88rem] leading-relaxed text-muted-foreground/70 [font-family:var(--home-copy)]">
        {feature.description}
      </p>

      <div className="mt-4 flex items-center gap-1.5 text-[0.8rem] font-medium text-primary/70 transition-colors hover:text-primary">
        <ArrowRight className="w-3.5 h-3.5" />
        <span>Learn more</span>
      </div>
    </GlassCard>
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
          className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.05] p-5 sm:p-6"
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
            <BadgeV2
              variant="outline"
              className="w-fit shrink-0 border-primary/35 bg-primary/10 text-primary"
            >
              Explainable AI
            </BadgeV2>
          </div>
        </motion.div>
      </div>
    </MotionSection>
  )
}
