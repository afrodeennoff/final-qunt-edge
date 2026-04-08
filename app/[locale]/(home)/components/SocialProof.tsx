'use client'

import { motion } from 'framer-motion'
import { Lock, Server, ShieldCheck, LifeBuoy, Clock, Trophy, Globe, MessageSquare } from 'lucide-react'
import { BadgeV2 } from '@/components/ui/v2'
import { AnimatedCounter } from '@/components/animation/enhanced-motion'
import {
  MOTION_EASE,
  STAGGER_CARD,
  BORDER_SECTION,
  TYPO_MINOR,
  TYPO_EYEBROW,
} from './_constants'

const ease = MOTION_EASE as unknown as number[]

const stats = [
  { label: 'Traders', value: 12000, suffix: '+', icon: Trophy, prefix: '' },
  { label: 'Funded Accounts', value: 85, suffix: '%', icon: Globe, prefix: '' },
  { label: 'Instrument Coverage', value: 100, suffix: '%', icon: Clock, prefix: '' },
  { label: 'Avg. Support Response', value: 7, suffix: 'min', icon: MessageSquare, prefix: '<' },
] as const

const testimonials = [
  {
    quote:
      'The review cadence alone changed my trading. I went from chasing setups to executing a repeatable process — and it shows in the numbers.',
    name: 'Futures Trader',
    role: 'Prop Firm Funded',
    initials: 'FT',
  },
  {
    quote:
      'Our team went from guessing who needed help to having data-driven coaching sessions. The export briefs save us hours every week.',
    name: 'Desk Manager',
    role: 'Trading Firm',
    initials: 'DM',
  },
  {
    quote:
      'The weekly brief is the single most useful tool I give my students. It surfaces patterns they literally cannot see on their own.',
    name: 'Trading Coach',
    role: 'Mentor',
    initials: 'TC',
  },
] as const

const trustPillars = [
  { title: 'Security By Design', body: 'Account-scoped reads and writes with ownership checks across every data path.', icon: Lock },
  { title: 'Reliable Operations', body: 'Fail-closed budget enforcement and hardened routes that never silently fall back.', icon: Server },
  { title: 'Data You Control', body: 'Bring your workflow, export review briefs, and keep your performance data portable.', icon: ShieldCheck },
  { title: 'Support You Can Reach', body: 'Product support, in-app guidance, and direct escalation paths for active traders.', icon: LifeBuoy },
] as const

function StatCard({ stat, index }: { stat: (typeof stats)[number]; index: number }) {
  const Icon = stat.icon
  return (
    <motion.div
      key={stat.label}
      className="rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-5"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-tight text-foreground tabular-nums [font-family:var(--home-display)]">
        {stat.prefix}
        <AnimatedCounter target={stat.value} />
        {stat.suffix}
      </div>
      <p className="mt-1 text-[0.82rem] text-muted-foreground/70 [font-family:var(--home-copy)]">
        {stat.label}
      </p>
    </motion.div>
  )
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[number]
  index: number
}) {
  return (
    <motion.article
      key={testimonial.name}
      className="rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-6 flex flex-col justify-between h-full"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease }}
    >
      <MessageSquare className="h-5 w-5 text-[var(--accent-blue)] opacity-40 mb-3" />
      <blockquote className="mb-5 text-[0.92rem] leading-relaxed text-muted-foreground/80 [font-family:var(--home-copy)]">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-[var(--frost-border)] ring-offset-2 ring-offset-[var(--surface-card)] text-xs font-bold text-primary [font-family:var(--home-display)]">
          {testimonial.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground [font-family:var(--home-display)]">
            {testimonial.name}
          </p>
          <p className="text-[0.78rem] text-muted-foreground/60 [font-family:var(--home-copy)]">
            {testimonial.role}
          </p>
        </div>
      </div>
    </motion.article>
  )
}

function TrustPillarCard({
  pillar,
  index,
}: {
  pillar: (typeof trustPillars)[number]
  index: number
}) {
  const Icon = pillar.icon
  return (
    <motion.article
      key={pillar.title}
      className="rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-5"
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease }}
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-[var(--accent-blue)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-[0.95rem] font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">
        {pillar.title}
      </h3>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground/70 [font-family:var(--home-copy)]">
        {pillar.body}
      </p>
    </motion.article>
  )
}

export default function SocialProof() {
  return (
    <section className={BORDER_SECTION}>
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        {/* Header */}
        <motion.div
          className="text-center mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <BadgeV2
            variant="outline"
            className="border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]"
          >
            Trusted By Serious Traders
          </BadgeV2>
          <h2 className="mt-4 text-[clamp(1.8rem,4.2vw,3rem)] font-semibold leading-tight tracking-[-0.02em] [font-family:var(--home-display)]">
            Why high-standard traders{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              choose Qunt Edge
            </span>
          </h2>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-14">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Testimonials + Trust Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Testimonials - Left */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-3 lg:gap-4">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} index={i} />
            ))}
          </div>

          {/* Trust Pillars - Right */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {trustPillars.map((pillar, i) => (
              <TrustPillarCard key={pillar.title} pillar={pillar} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
