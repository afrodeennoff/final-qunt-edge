'use client'

import { motion } from 'framer-motion'
import { BadgeV2 } from '@/components/ui/v2'
import { Brain, Bot, Radar, ShieldAlert, Sparkles } from 'lucide-react'
import { MOTION_EASE } from './_constants'
import type { LucideIcon } from 'lucide-react'

const features = [
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

type Feature = (typeof features)[number]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.06,
      ease: MOTION_EASE,
    },
  }),
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon as LucideIcon

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface)/0.6)] p-5 lg:p-6"
    >
      <div className="mb-4 h-10 w-10 rounded-lg border border-primary/50 bg-primary/15 flex items-center justify-center text-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold tracking-[-0.01em] text-foreground mb-2 [font-family:var(--home-display)]">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground [font-family:var(--home-copy)]">
        {feature.description}
      </p>
    </motion.div>
  )
}

export default function AIFeatures() {
  return (
    <section className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-14 text-center lg:mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <BadgeV2
            variant="outline"
            className="mb-5 border-[hsl(var(--mk-border)/0.4)] bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]"
          >
            Must-Have AI Features
          </BadgeV2>
          <h2 className="text-[clamp(1.8rem,3.8vw,2.75rem)] font-semibold leading-tight tracking-[-0.025em] text-foreground mb-5 [font-family:var(--home-display)]">
            AI that improves{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              decision quality, not just reporting
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground/70 sm:text-lg">
            Six intelligent systems that run alongside your trading — catching patterns you miss
            and building playbooks from your best work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        <motion.div
          variants={cardVariants}
          custom={features.length}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-4 rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface)/0.5)] p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-muted-foreground [font-family:var(--home-copy)]">
              AI decisions stay auditable with a transparent reason trail, so every recommendation
              can be reviewed.
            </p>
            <BadgeV2
              variant="outline"
              className="w-fit shrink-0 border-primary/35 bg-primary/15 text-foreground"
            >
              Explainable AI
            </BadgeV2>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
