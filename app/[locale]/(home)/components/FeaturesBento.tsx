'use client'

import { motion } from 'motion/react'
import {
  BarChart3,
  Brain,
  Users,
  Download,
  FileText,
  Shield,
  ArrowRight,
  Radar,
  Bot,
  Sparkles,
  ShieldAlert,
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

const problems = [
  {
    badge: 'Data Fragmentation',
    icon: BarChart3,
    title: 'Where are your trades, really?',
    description:
      'Scattered across brokers, spreadsheets, and memory — never analysis.',
    solution: 'Advanced Analytics',
  },
  {
    badge: 'Repeating Mistakes',
    icon: Brain,
    title: 'Why the same errors, again?',
    description:
      'No structured review means no improvement loop. Patterns stay invisible.',
    solution: 'AI Insights',
  },
  {
    badge: 'Team Isolation',
    icon: Users,
    title: 'Can your coach see what you see?',
    description:
      'Siloed data makes performance gaps invisible until they cost you.',
    solution: 'Team Sync',
  },
] as const

type Problem = (typeof problems)[number]

const features = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Decile analysis, heatmaps, and custom metrics that expose what PnL hides.',
    colSpan: 'lg:col-span-2',
    highlighted: false,
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description:
      'Pattern recognition, behavioral analysis, and explainable AI that turns raw trades into a coaching system.',
    colSpan: 'lg:col-span-2',
    highlighted: true,
  },
  {
    icon: Users,
    title: 'Team Sync',
    description:
      'Share layouts, compare performance, and accelerate improvement together.',
    colSpan: 'lg:col-span-1',
    highlighted: false,
  },
  {
    icon: Download,
    title: 'Multi-Broker Import',
    description:
      'Connect Tradovate, Rithmic, IBKR, or import CSV. Your data, your way.',
    colSpan: 'lg:col-span-3',
    highlighted: false,
  },
  {
    icon: FileText,
    title: 'Coach-Ready Exports',
    description:
      'PDF briefs and shareable reports for structured mentorship sessions.',
    colSpan: 'lg:col-span-2',
    highlighted: false,
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-grade encryption and SOC2 compliance protect every trade you upload.',
    colSpan: 'lg:col-span-2',
    highlighted: false,
  },
] as const

type Feature = (typeof features)[number]

const aiFeatures = [
  {
    title: 'Behavior Drift Radar',
    description:
      'Flags subtle shifts in risk behavior and setup quality before they become drawdowns.',
    icon: Radar,
  },
  {
    title: 'AI Session Debrief',
    description:
      'Creates concise recaps of what worked, what broke, and what to adjust next session.',
    icon: Bot,
  },
  {
    title: 'Execution Quality Score',
    description:
      'Scores trades against your ruleset so process wins are visible, even on flat PnL days.',
    icon: Brain,
  },
  {
    title: 'Playbook Auto-Builder',
    description:
      'Converts your best sessions into reusable setup templates and checklist-ready plans.',
    icon: Sparkles,
  },
  {
    title: 'Risk Intervention Alerts',
    description:
      'Escalates coaching prompts when sizing, frequency, or emotional variance crosses limits.',
    icon: ShieldAlert,
  },
  {
    title: 'Weekly Performance Briefs',
    description:
      'Auto-compiles concise weekly reports for self-review, mentors, or desk standups.',
    icon: Bot,
  },
] as const

type AIFeature = (typeof aiFeatures)[number]

function ProblemCard({ problem }: { problem: Problem }) {
  const Icon = problem.icon
  return (
    <GlassCard
      variant="subtle"
      hover
      size="sm"
      className="relative overflow-hidden h-full"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/[0.06]">
        <Icon className="h-4 w-4 text-destructive/80" />
      </div>
      <BadgeV2 variant="error" size="sm" className="mb-3">
        {problem.badge}
      </BadgeV2>
      <h3 className="text-[0.95rem] font-semibold tracking-[-0.01em] text-foreground [font-family:var(--home-display)]">
        {problem.title}
      </h3>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground/70 [font-family:var(--home-copy)]">
        {problem.description}
      </p>
      <div className="mt-3 flex items-center gap-1.5 text-[0.78rem] font-medium text-primary">
        <ArrowRight className="w-3 h-3" />
        <span>{problem.solution}</span>
      </div>
    </GlassCard>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon

  return (
    <GlassCard
      variant="strong"
      hover
      size="md"
      className={`relative overflow-hidden h-full${feature.highlighted ? ' border-primary/25 shadow-[0_0_32px_-12px_hsl(var(--primary)/0.15)]' : ''}`}
    >
      <div className="mb-4 inline-flex items-center justify-center rounded-xl w-12 h-12">
        <div className="absolute inset-0 rounded-xl bg-primary/15 blur-sm" />
        <div className="relative inline-flex items-center justify-center rounded-xl w-12 h-12 border border-primary/40 bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>

      {feature.highlighted && (
        <BadgeV2
          variant="outline"
          size="sm"
          className="mb-2 border-primary/40 bg-primary/10 text-primary"
        >
          AI-Powered
        </BadgeV2>
      )}

      <h3 className="text-lg font-semibold text-gradient-primary [font-family:var(--home-display)]">
        {feature.title}
      </h3>
      <p className="mt-1.5 text-[0.88rem] text-muted-foreground/70 leading-relaxed [font-family:var(--home-copy)]">
        {feature.description}
      </p>
    </GlassCard>
  )
}

function AIFeatureCard({ feature }: { feature: AIFeature }) {
  const Icon = feature.icon

  return (
    <GlassCard
      variant="subtle"
      hover
      size="sm"
      className="relative overflow-hidden h-full bg-gradient-to-br from-primary/[0.06] to-transparent"
    >
      <div className="mb-3 inline-flex items-center justify-center rounded-xl w-10 h-10">
        <div className="absolute inset-0 rounded-xl bg-primary/15 blur-sm" />
        <div className="relative inline-flex items-center justify-center rounded-xl w-10 h-10 border border-primary/40 bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <h3 className="text-[0.95rem] font-semibold text-foreground [font-family:var(--home-display)]">
        {feature.title}
      </h3>
      <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted-foreground/70 [font-family:var(--home-copy)]">
        {feature.description}
      </p>
    </GlassCard>
  )
}

export default function FeaturesBento() {
  return (
    <div id="features">
      <MotionSection className={BORDER_SECTION}>
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14 lg:mb-20"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: MOTION_EASE as unknown as number[] }}
          >
            <p
              className={`${TYPO_EYEBROW} text-muted-foreground/60 mb-3 [font-family:var(--home-copy)]`}
            >
              The Solution
            </p>
            <h2
              className={`${TYPO_MINOR} text-foreground leading-tight [font-family:var(--home-display)]`}
            >
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                trade smarter
              </span>
            </h2>
            <p className="mt-4 text-[0.95rem] sm:text-lg text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re protecting a funded account or sharpening your personal
              edge — analytics, AI coaching, and team collaboration in one platform.
            </p>
          </motion.div>

          <MotionStagger
            className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-16"
            delay={STAGGER_CARD}
          >
            {problems.map((problem) => (
              <MotionStaggerItem key={problem.title}>
                <ProblemCard problem={problem} />
              </MotionStaggerItem>
            ))}
          </MotionStagger>

          <div className="mb-8">
            <BadgeV2 variant="accent" size="sm">
              Features
            </BadgeV2>
          </div>

          <MotionStagger
            className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4"
            delay={STAGGER_CARD}
          >
            {features.map((feature) => (
              <MotionStaggerItem key={feature.title} className={feature.colSpan}>
                <FeatureCard feature={feature} />
              </MotionStaggerItem>
            ))}
          </MotionStagger>

          <div className="mt-16 mb-8">
            <BadgeV2
              variant="outline"
              size="sm"
              className="border-primary/35 bg-primary/10 text-primary"
            >
              AI-Powered
            </BadgeV2>
          </div>

          <MotionStagger
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4"
            delay={STAGGER_CARD}
          >
            {aiFeatures.map((feature) => (
              <MotionStaggerItem key={feature.title}>
                <AIFeatureCard feature={feature} />
              </MotionStaggerItem>
            ))}
          </MotionStagger>

          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.05] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI decisions stay auditable with a transparent reason trail, so
                every recommendation can be reviewed.
              </p>
              <BadgeV2
                variant="outline"
                className="w-fit shrink-0 border-primary/35 bg-primary/10 text-primary"
              >
                Explainable AI
              </BadgeV2>
            </div>
          </div>
        </div>
      </MotionSection>
    </div>
  )
}
