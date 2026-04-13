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
 className="rounded-[1.75rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] p-5 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_18px_44px_-32px_rgba(0,0,0,0.9)]"
 whileHover={{ borderColor: 'var(--frost-border-strong)' }}
 transition={{ duration: 0.2 }}
 >
 <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[1rem] border border-[var(--accent-red)]/30 bg-[rgba(255,32,71,0.06)]">
 <Icon className="h-4 w-4 text-[var(--accent-red)]" />
 </div>
 <h3 className="text-[1rem] font-semibold tracking-[-0.02em] text-foreground/95 [font-family:var(--home-display)]">
 {problem.title}
 </h3>
 <p className="mt-3 text-[0.88rem] leading-[1.7] text-foreground/58 [font-family:var(--home-copy)]">
 {problem.description}
 </p>
 </motion.div>
 )
}

export default function ProblemStatement() {
 return (
 <section className="relative px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
 <div className="mx-auto max-w-[1360px]">
 <div className="grid grid-cols-1 gap-10 rounded-[2rem] border border-white/[0.08] bg-[oklch(0.03_0.004_264)] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_28px_80px_-44px_rgba(0,0,0,0.95)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:p-8">
 <motion.div
 className="flex flex-col justify-center rounded-[1.75rem] border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.045)] p-6"
 initial={{ opacity: 0, x: -24 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6, ease: MOTION_EASE as unknown as number[] }}
 >
 <p className={`${TYPO_EYEBROW} text-foreground/34 mb-3 [font-family:var(--home-copy)]`}>
 The Gap
 </p>
 <h2 className={`${TYPO_MINOR} text-foreground/95 leading-tight [font-family:var(--home-display)]`}>
 Results tell you if you were paid,{' '}
 <span className="bg-gradient-to-r from-foreground/60 to-foreground/30 bg-clip-text text-transparent">
 not if you were good.
 </span>
 </h2>
 <p className="mt-5 max-w-lg text-[0.98rem] leading-[1.8] tracking-[-0.01em] text-foreground/56 [font-family:var(--home-copy)]">
 Average traders celebrate outcomes. Elite traders audit decisions.
 The difference between a lucky streak and a sustainable edge is
 execution discipline — and most traders have no way to measure it.
 </p>

 <div className="mt-6 rounded-[1.5rem] border border-primary/25 bg-primary/10 p-5">
 <div className="flex items-start gap-3">
 <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
 <div>
 <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary mb-1">
 Mindset Upgrade
 </p>
 <p className="text-[0.88rem] leading-[1.7] text-foreground/78 [font-family:var(--home-copy)]">
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
