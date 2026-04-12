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
    <div className="relative h-full overflow-hidden rounded-[1.8rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.05]">
      <div className="mb-5 inline-flex items-center justify-center rounded-xl w-12 h-12">
        <div className="absolute inset-0 rounded-xl bg-[oklch(0.08_0_0)] blur-sm" />
        <div className={`relative inline-flex items-center justify-center rounded-[1rem] w-12 h-12 border ${accent.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${accent.badge}`}>
        Capability
      </span>

      <h3 className="mt-4 text-[1.1rem] font-semibold tracking-[-0.02em] text-foreground [font-family:var(--home-display)]">
        {feature.title}
      </h3>
      <p className="mt-3 text-[0.92rem] leading-[1.75] text-muted-foreground/70 [font-family:var(--home-copy)]">
        {feature.description}
      </p>

      <div className="mt-6 flex items-center gap-1.5 text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground/54 transition-colors hover:text-foreground">
        <ArrowRight className="w-3.5 h-3.5" />
        <span>Inspect signal</span>
      </div>
    </div>
  )
}

export default function AIFeatures() {
  return (
    <MotionSection className={BORDER_SECTION}>
      <div className="mx-auto max-w-[1360px] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
          <motion.div
            className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_26px_70px_-44px_rgba(0,0,0,0.96)] lg:p-7"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.65_0.22_260/0.12),transparent_45%),radial-gradient(circle_at_bottom_right,oklch(0.82_0.185_155/0.06),transparent_34%)]" />
            <div className="relative">
              <p className={`${TYPO_EYEBROW} mb-4 text-muted-foreground/46 [font-family:var(--home-copy)]`}>
                AI-Powered
              </p>
              <h2 className={`${TYPO_MINOR} text-foreground leading-[0.94] [font-family:var(--home-display)]`}>
                A private analyst layer that studies every trade like a desk review.
              </h2>
              <p className="mt-5 max-w-xl text-[0.98rem] leading-[1.8] text-muted-foreground/70">
                Qunt Edge uses AI as a structured review engine, not a gimmick. Every recommendation is built to support a more disciplined process, stronger feedback loops, and clearer weekly decisions.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Reason trail</p>
                  <p className="mt-2 text-sm leading-[1.7] text-foreground/60">
                    Recommendations stay explainable, reviewable, and easy to challenge.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Live context</p>
                  <p className="mt-2 text-sm leading-[1.7] text-foreground/60">
                    Signals inherit your rules, risk shape, and execution patterns instead of generic advice.
                  </p>
                </div>
              </div>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--accent-blue-border)] bg-[var(--accent-blue-subtle)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-blue)]">
                <Sparkles className="h-3.5 w-3.5" />
                Explainable AI, tuned for traders
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <MotionStagger
              className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:gap-4"
              delay={STAGGER_CARD}
            >
              {aiFeatures.map((feature) => (
                <MotionStaggerItem key={feature.title} className={feature.colSpan}>
                  <AIFeatureCard feature={feature} />
                </MotionStaggerItem>
              ))}
            </MotionStagger>

            <motion.div
              className="rounded-[1.8rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05)] sm:p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.4 }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-[1.8] text-muted-foreground/68">
                  AI decisions stay anchored to a transparent reason trail, so every intervention can be reviewed alongside the raw trade evidence.
                </p>
                <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-[var(--accent-blue-border)] bg-[var(--accent-blue-subtle)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-blue)]">
                  Explainable AI
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
