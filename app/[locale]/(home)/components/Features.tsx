"use client"

import { motion, useReducedMotion } from 'framer-motion'
import { CardV2, CardV2Title, CardV2Description } from '@/components/ui/v2'
import { DashboardIcon, ChartIcon, LeaderboardIcon, ProfileIcon, SettingsIcon, DealsIcon } from '@/components/icons/svg-icons'

const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const STAGGER_DELAY = 0.08

const items = [
  {
    title: 'One Truth Timeline',
    desc: 'Unify fills, notes, and context into one performance record across brokers and imports.',
    Icon: DashboardIcon,
  },
  {
    title: 'Execution Grade Engine',
    desc: 'Score every trade against your ruleset so discipline becomes measurable, not assumed.',
    Icon: ChartIcon,
  },
  {
    title: 'AI Session Debriefs',
    desc: 'Get blunt post-session diagnostics with root causes and the next priorities to fix.',
    Icon: LeaderboardIcon,
  },
  {
    title: 'Drift Alerts',
    desc: 'Detect emotional, sizing, and frequency drift before it compounds into drawdown.',
    Icon: ProfileIcon,
  },
  {
    title: 'Correction Loop',
    desc: 'Convert weak patterns into concrete interventions and track adherence week over week.',
    Icon: SettingsIcon,
  },
  {
    title: 'Desk-Level Oversight',
    desc: 'Give managers and mentors a clean, auditable view of process quality by trader.',
    Icon: DealsIcon,
  },
]

function FeatureCard({ item, index }: { item: typeof items[0]; index: number }) {
  const { Icon } = item

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.42,
        ease: MOTION_EASE,
        delay: index * STAGGER_DELAY,
      }}
    >
      <CardV2 className="group relative flex h-full flex-col gap-4 bg-white/[0.03] border-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 hover:border-v2-accent/30">
        <div className="inline-flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-v2-lg bg-v2-accent-subtle p-v2-3 text-v2-accent transition-colors duration-300 group-hover:bg-v2-accent/20">
            <Icon size={20} strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          <CardV2Title className="transition-colors duration-300 group-hover:text-v2-accent">
            {item.title}
          </CardV2Title>
          <CardV2Description>
            {item.desc}
          </CardV2Description>
        </div>

        <div className="flex items-center gap-1.5 text-v2-text-secondary transition-colors duration-300 group-hover:text-v2-accent">
          <span className="text-xs font-medium tracking-wide">Learn more</span>
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
      </CardV2>
    </motion.article>
  )
}

function FeaturesAnimated() {
  return (
    <section
      id="features"
      className="relative px-4 py-40 sm:px-6 lg:px-8"
    >
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="space-y-4 text-center sm:space-y-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: MOTION_EASE }}
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-v2-accent">
            Platform Weapons
          </p>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-light leading-[0.92] tracking-[-0.025em] text-v2-text-primary">
            Built for traders who{' '}
            <span className="block text-v2-accent">want standards, not excuses</span>
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

function FeaturesStatic() {
  return (
    <section
      id="features"
      className="relative px-4 py-40 sm:px-6 lg:px-8"
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="space-y-4 text-center sm:space-y-5">
          <p className="text-[11px] uppercase tracking-[0.25em] text-v2-accent">
            Platform Weapons
          </p>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-light leading-[0.92] tracking-[-0.025em] text-v2-text-primary">
            Built for traders who{' '}
            <span className="block text-v2-accent">want standards, not excuses</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {items.map((item, index) => (
            <FeatureCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Features() {
  const prefersReducedMotion = useReducedMotion()
  
  if (prefersReducedMotion) {
    return <FeaturesStatic />
  }
  
  return <FeaturesAnimated />
}
