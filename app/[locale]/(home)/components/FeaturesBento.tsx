'use client'

import { motion } from 'framer-motion'
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
import { Badge } from '@/components/ui/badge'
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
    tone:
      'from-[hsl(var(--primary)/0.16)] via-[hsl(var(--mk-surface-muted)/0.35)] to-transparent',
  },
  {
    badge: 'Repeating Mistakes',
    icon: Brain,
    title: 'Why the same errors, again?',
    description:
      'No structured review means no improvement loop. Patterns stay invisible.',
    solution: 'AI Insights',
    tone:
      'from-[hsl(var(--accent)/0.18)] via-[hsl(var(--primary)/0.14)] to-transparent',
  },
  {
    badge: 'Team Isolation',
    icon: Users,
    title: 'Can your coach see what you see?',
    description:
      'Siloed data makes performance gaps invisible until they cost you.',
    solution: 'Team Sync',
    tone:
      'from-[hsl(var(--chart-2)/0.16)] via-[hsl(var(--primary)/0.12)] to-transparent',
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
    tone:
      'from-[hsl(var(--primary)/0.18)] via-[hsl(var(--mk-surface-muted)/0.4)] to-transparent',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description:
      'Pattern recognition, behavioral analysis, and explainable AI that turns raw trades into a coaching system.',
    colSpan: 'lg:col-span-2',
    highlighted: true,
    tone:
      'from-[hsl(var(--accent)/0.2)] via-[hsl(var(--primary)/0.16)] to-transparent',
  },
  {
    icon: Users,
    title: 'Team Sync',
    description:
      'Share layouts, compare performance, and accelerate improvement together.',
    colSpan: 'lg:col-span-1',
    highlighted: false,
    tone:
      'from-[hsl(var(--chart-2)/0.16)] via-[hsl(var(--mk-surface-muted)/0.34)] to-transparent',
  },
  {
    icon: Download,
    title: 'Multi-Broker Import',
    description:
      'Connect Tradovate, Rithmic, IBKR, or import CSV. Your data, your way.',
    colSpan: 'lg:col-span-3',
    highlighted: false,
    tone:
      'from-[hsl(var(--primary)/0.16)] via-[hsl(var(--mk-surface-muted)/0.36)] to-transparent',
  },
  {
    icon: FileText,
    title: 'Coach-Ready Exports',
    description:
      'PDF briefs and shareable reports for structured mentorship sessions.',
    colSpan: 'lg:col-span-2',
    highlighted: false,
    tone:
      'from-[hsl(var(--accent)/0.16)] via-[hsl(var(--mk-surface-muted)/0.3)] to-transparent',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-grade encryption and SOC2 compliance protect every trade you upload.',
    colSpan: 'lg:col-span-2',
    highlighted: false,
    tone:
      'from-[hsl(var(--chart-2)/0.14)] via-[hsl(var(--primary)/0.08)] to-transparent',
  },
] as const

type Feature = (typeof features)[number]

const aiFeatures = [
  {
    title: 'Behavior Drift Radar',
    description:
      'Flags subtle shifts in risk behavior and setup quality before they become drawdowns.',
    icon: Radar,
    tone:
      'from-[hsl(var(--primary)/0.14)] via-[hsl(var(--mk-surface-muted)/0.26)] to-transparent',
  },
  {
    title: 'AI Session Debrief',
    description:
      'Creates concise recaps of what worked, what broke, and what to adjust next session.',
    icon: Bot,
    tone:
      'from-[hsl(var(--accent)/0.16)] via-[hsl(var(--primary)/0.08)] to-transparent',
  },
  {
    title: 'Execution Quality Score',
    description:
      'Scores trades against your ruleset so process wins are visible, even on flat PnL days.',
    icon: Brain,
    tone:
      'from-[hsl(var(--primary)/0.16)] via-[hsl(var(--mk-surface-muted)/0.26)] to-transparent',
  },
  {
    title: 'Playbook Auto-Builder',
    description:
      'Converts your best sessions into reusable setup templates and checklist-ready plans.',
    icon: Sparkles,
    tone:
      'from-[hsl(var(--accent)/0.14)] via-[hsl(var(--chart-2)/0.12)] to-transparent',
  },
  {
    title: 'Risk Intervention Alerts',
    description:
      'Escalates coaching prompts when sizing, frequency, or emotional variance crosses limits.',
    icon: ShieldAlert,
    tone:
      'from-[hsl(var(--primary)/0.12)] via-[hsl(var(--mk-surface-muted)/0.28)] to-transparent',
  },
  {
    title: 'Weekly Performance Briefs',
    description:
      'Auto-compiles concise weekly reports for self-review, mentors, or desk standups.',
    icon: Bot,
    tone:
      'from-[hsl(var(--chart-2)/0.14)] via-[hsl(var(--primary)/0.09)] to-transparent',
  },
] as const

type AIFeature = (typeof aiFeatures)[number]

function ProblemCard({ problem }: { problem: Problem }) {
  const Icon = problem.icon
  return (
    <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_18px_44px_-30px_rgba(0,0,0,0.88)] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14]">
      <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/[0.08] bg-white/[0.04] shadow-[0_0_20px_oklch(0.65_0.22_260/0.16)]">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <Badge
        variant="outline"
        size="sm"
        className="mb-4 rounded-full border-[oklch(0.65_0.22_260/0.28)] bg-[oklch(0.65_0.22_260/0.08)] text-[oklch(0.75_0.22_260)]"
      >
        {problem.badge}
      </Badge>
      <h3 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground/95 [font-family:var(--home-display)]">
        {problem.title}
      </h3>
      <p className="mt-3 text-[0.9rem] leading-[1.7] text-foreground/60 [font-family:var(--home-copy)]">
        {problem.description}
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/74">
        <ArrowRight className="w-3 h-3" />
        <span>{problem.solution}</span>
      </div>
    </div>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon

  return (
    <div
      className={`relative h-full overflow-hidden rounded-[1.75rem] border p-6 ${feature.highlighted ? 'border-[oklch(0.65_0.22_260/0.28)] bg-[oklch(0.045_0.006_264)] shadow-[0_0_0_0.5px_oklch(0.65_0.22_260/0.18),0_0_40px_oklch(0.65_0.22_260/0.08),0_18px_44px_-30px_rgba(0,0,0,0.9)]' : 'border-white/[0.08] bg-[oklch(0.038_0.005_264)] shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_18px_44px_-30px_rgba(0,0,0,0.88)] hover:border-white/[0.14]'} transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
        <div className="absolute inset-0 rounded-xl bg-primary/15 blur-sm" />
        <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-white/[0.08] bg-white/[0.04]">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>

      {feature.highlighted && (
        <Badge
          variant="outline"
          size="sm"
          className="mb-2 rounded-full border-primary/38 bg-primary/10 text-primary"
        >
          AI-Powered
        </Badge>
      )}

      <h3 className="relative text-lg font-medium text-gradient-primary [font-family:var(--home-display)]">
        {feature.title}
      </h3>
      <p className="relative mt-2.5 text-[0.92rem] leading-[1.7] text-foreground/60 [font-family:var(--home-copy)]">
        {feature.description}
      </p>
    </div>
  )
}

function AIFeatureCard({ feature }: { feature: AIFeature }) {
  const Icon = feature.icon

  return (
    <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_18px_44px_-30px_rgba(0,0,0,0.88)] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14]">
      <div className="relative mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl">
        <div className="absolute inset-0 rounded-xl bg-primary/15 blur-sm" />
        <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <h3 className="relative text-[1rem] font-medium tracking-[-0.015em] text-foreground/95 [font-family:var(--home-display)]">
        {feature.title}
      </h3>
      <p className="relative mt-2.5 text-[0.88rem] leading-[1.65] text-foreground/58 [font-family:var(--home-copy)]">
        {feature.description}
      </p>
    </div>
  )
}

export default function FeaturesBento() {
  return (
    <div id="features">
      <MotionSection className={BORDER_SECTION}>
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-14 text-center lg:mb-20"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: MOTION_EASE as unknown as number[] }}
          >
            <p
              className={`${TYPO_EYEBROW} mb-3 text-foreground/34 [font-family:var(--home-copy)]`}
            >
              Platform Capabilities
            </p>
            <h2
              className={`${TYPO_MINOR} text-foreground/95 leading-tight [font-family:var(--home-display)]`}
            >
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                trade smarter
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-[1.7] tracking-[-0.01em] text-foreground/56 sm:text-lg">
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
            <Badge variant="secondary" size="sm" className="rounded-full border-white/[0.08] bg-white/[0.04] px-3 text-foreground/62">
              Features
            </Badge>
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
            <Badge
              variant="outline"
              size="sm"
              className="rounded-full border-[oklch(0.65_0.22_260/0.28)] bg-[oklch(0.65_0.22_260/0.08)] px-3 text-[oklch(0.75_0.22_260)]"
            >
              AI-Powered
            </Badge>
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

          <div className="mt-5 rounded-[1.75rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_18px_44px_-30px_rgba(0,0,0,0.88)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-[1.7] text-foreground/58">
                AI decisions stay auditable with a transparent reason trail, so
                every recommendation can be reviewed.
              </p>
              <Badge
                variant="outline"
                className="w-fit shrink-0 rounded-full border-[oklch(0.65_0.22_260/0.28)] bg-[oklch(0.65_0.22_260/0.08)] text-[oklch(0.75_0.22_260)]"
              >
                Explainable AI
              </Badge>
            </div>
          </div>
        </div>
      </MotionSection>
    </div>
  )
}
