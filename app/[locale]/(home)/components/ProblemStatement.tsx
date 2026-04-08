'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Brain, RotateCcw, ArrowRight } from 'lucide-react'
import {
  MOTION_EASE,
  STAGGER_CARD,
  TYPO_MINOR,
  TYPO_EYEBROW,
} from './_constants'

const problems = [
  {
    icon: AlertTriangle,
    title: 'False Confidence',
    description:
      'Positive PnL on a bad process is luck, not skill. Without execution auditing, winners reinforce bad habits.',
  },
  {
    icon: Brain,
    title: 'Decision Drift',
    description:
      'Subtle shifts in risk, timing, and setup discipline compound silently until they become unrecoverable drawdowns.',
  },
  {
    icon: RotateCcw,
    title: 'No Performance Loop',
    description:
      'Reviewing outcomes without auditing decisions means you never identify the root cause of underperformance.',
  },
] as const

type Problem = (typeof problems)[number]

function ProblemCard({ problem }: { problem: Problem }) {
  const Icon = problem.icon
  return (
    <motion.div
      className="rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-4"
      whileHover={{ borderColor: 'var(--frost-border-strong)' }}
      transition={{ duration: 0.2 }}
    >
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--accent-red)]/30 bg-[rgba(255,32,71,0.06)]">
        <Icon className="h-4 w-4 text-[var(--accent-red)]" />
      </div>
      <h3 className="text-[0.95rem] font-semibold tracking-[-0.01em] text-foreground [font-family:var(--home-display)]">
        {problem.title}
      </h3>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground/70 [font-family:var(--home-copy)]">
        {problem.description}
      </p>
    </motion.div>
  )
}

export default function ProblemStatement() {
  return (
    <section className="relative px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: MOTION_EASE as unknown as number[] }}
          >
            <p className={`${TYPO_EYEBROW} text-foreground/60 mb-3 [font-family:var(--home-copy)]`}>
              The Gap
            </p>
            <h2 className={`${TYPO_MINOR} text-foreground leading-tight [font-family:var(--home-display)]`}>
              Results tell you if you were paid,{' '}
              <span className="bg-gradient-to-r from-foreground/60 to-foreground/30 bg-clip-text text-transparent">
                not if you were good.
              </span>
            </h2>
            <p className="mt-5 text-[0.92rem] leading-relaxed text-muted-foreground/70 max-w-lg [font-family:var(--home-copy)]">
              Average traders celebrate outcomes. Elite traders audit decisions.
              The difference between a lucky streak and a sustainable edge is
              execution discipline — and most traders have no way to measure it.
            </p>

            <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary mb-1">
                    Mindset Upgrade
                  </p>
                  <p className="text-[0.82rem] leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">
                    Promote process to first-class data. When execution quality is
                    visible, improvement becomes inevitable.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-3">
            {problems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: MOTION_EASE as unknown as number[],
                }}
              >
                <ProblemCard problem={problem} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
