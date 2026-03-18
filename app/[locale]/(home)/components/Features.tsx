"use client"

import { BarChart3, Brain, CalendarCheck2, Database, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

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
      className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--primary)/0.12)] bg-[hsl(var(--card)/0.6)] backdrop-blur-sm"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.42,
        ease: MOTION_EASE,
        delay: index * STAGGER_DELAY,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3, ease: MOTION_EASE },
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), transparent 50%, hsl(var(--primary) / 0.08))',
          filter: 'blur(20px)',
        }}
      />

      <motion.div
        className="absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: '0 0 20px 1px hsl(var(--primary) / 0.25), inset 0 0 20px 1px hsl(var(--primary) / 0.1)',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.04)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute left-0 top-0 h-[2px] w-0 bg-gradient-to-r from-[hsl(var(--primary)/0.6)] to-[hsl(var(--primary)/0.2)] transition-all duration-500 group-hover:w-full" />

      <div className="relative flex h-full flex-col gap-4 p-6 sm:p-7">
        <div className="relative inline-flex">
          <motion.div
            className="absolute -inset-1 rounded-xl bg-[hsl(var(--primary)/0.1)] blur-md opacity-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary)/0.9)] shadow-sm"
            whileHover={{
              borderColor: 'hsl(var(--primary) / 0.45)',
              backgroundColor: 'hsl(var(--primary) / 0.12)',
              transition: { duration: 0.3, ease: MOTION_EASE },
            }}
          >
            <motion.div
              whileHover={{
                y: [0, -3, 0],
                transition: { duration: 0.4, ease: MOTION_EASE },
              }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          <h3 className="text-lg font-semibold leading-tight tracking-[-0.015em] text-foreground transition-colors duration-300 [font-family:var(--home-display)] group-hover:text-[hsl(var(--primary)/0.95)]">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground/80 [font-family:var(--home-copy)] transition-colors duration-300 group-hover:text-muted-foreground">
            {item.desc}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[hsl(var(--primary)/0.5)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
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
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const blob1Y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const blob2Y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ y: blob1Y }}
      >
        <div className="absolute -left-1/4 top-1/2 h-[600px] w-[600px] rounded-full bg-[hsl(var(--primary)/0.03)] blur-[120px]" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ y: blob2Y }}
      >
        <div className="absolute -right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-[hsl(var(--primary)/0.02)] blur-[100px]" />
      </motion.div>

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
