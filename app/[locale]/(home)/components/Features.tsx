"use client"

import { BarChart3, Brain, CalendarCheck2, Database, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const STAGGER_DELAY = 0.08

const items = [
  {
    title: 'One Truth Timeline',
    desc: 'Unify fills, notes, and context into one performance record across brokers and imports.',
    icon: BarChart3,
  },
  {
    title: 'Execution Grade Engine',
    desc: 'Score every trade against your ruleset so discipline becomes measurable, not assumed.',
    icon: Database,
  },
  {
    title: 'AI Session Debriefs',
    desc: 'Get blunt post-session diagnostics with root causes and the next priorities to fix.',
    icon: Brain,
  },
  {
    title: 'Drift Alerts',
    desc: 'Detect emotional, sizing, and frequency drift before it compounds into drawdown.',
    icon: LayoutDashboard,
  },
  {
    title: 'Correction Loop',
    desc: 'Convert weak patterns into concrete interventions and track adherence week over week.',
    icon: CalendarCheck2,
  },
  {
    title: 'Desk-Level Oversight',
    desc: 'Give managers and mentors a clean, auditable view of process quality by trader.',
    icon: ShieldCheck,
  },
]

function FeatureCard({ item, index }: { item: typeof items[0]; index: number }) {
  const Icon = item.icon

  return (
    <motion.article
      className="group relative overflow-hidden rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card))] transition-colors duration-300 hover:border-[hsl(var(--border)/0.6)]"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.42,
        ease: MOTION_EASE,
        delay: index * STAGGER_DELAY,
      }}
    >
      <div className="relative flex h-full flex-col gap-4 p-6 sm:p-7">
        <div className="inline-flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--primary)/0.9)] transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.25)] group-hover:border-[hsl(var(--border)/0.6)]">
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          <h3 className="text-lg font-semibold leading-tight tracking-[-0.015em] text-foreground transition-colors duration-300 [font-family:var(--home-display)] group-hover:text-[hsl(var(--primary)/0.9)]">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground [font-family:var(--home-copy)]">
            {item.desc}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[hsl(var(--primary)/0.7)] transition-colors duration-300 group-hover:text-[hsl(var(--primary)/0.9)]">
          <span className="text-xs font-medium tracking-wide [font-family:var(--home-copy)]">Learn more</span>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </motion.article>
  )
}

export default function Features() {
  return (
    <section
      id="features"
      className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="space-y-4 text-center sm:space-y-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: MOTION_EASE }}
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--primary)/0.7)] [font-family:var(--home-copy)]">
            Platform Weapons
          </p>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[0.92] tracking-[-0.025em] text-foreground [font-family:var(--home-display)]">
            Built for traders who{' '}
            <span className="block text-[hsl(var(--primary)/0.9)]">want standards, not excuses</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {items.map((item, index) => (
            <FeatureCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
