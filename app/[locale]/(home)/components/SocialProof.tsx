'use client'

import { motion } from 'framer-motion'
import { Lock, Server, ShieldCheck, LifeBuoy, Clock, Trophy, Globe, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
      className="rounded-[1.7rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05)]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
    >
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/[0.10] bg-black/50 text-foreground/95">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-[clamp(1.7rem,3vw,2.4rem)] font-[350] tracking-[-0.05em] text-foreground/95 tabular-nums [font-family:var(--home-display)]">
        {stat.prefix}
        <AnimatedCounter target={stat.value} />
        {stat.suffix}
      </div>
      <p className="mt-2 text-[0.82rem] text-muted-foreground/62 [font-family:var(--home-copy)]">
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
      className="flex h-full flex-col justify-between rounded-[1.8rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05)]"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease }}
    >
      <div className="mb-5 inline-flex w-fit rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/38">
        Trader voice
      </div>
      <MessageSquare className="mb-4 h-5 w-5 text-[var(--accent-blue)] opacity-40" />
      <blockquote className="mb-6 text-[0.96rem] leading-[1.85] text-muted-foreground/78 [font-family:var(--home-copy)]">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/[0.10] bg-white/[0.04] text-xs font-bold text-primary [font-family:var(--home-display)]">
          {testimonial.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground/95 [font-family:var(--home-display)]">
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
      className="rounded-[1.7rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05)]"
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease }}
    >
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/[0.10] bg-black/50 text-[var(--accent-blue)]">
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
      <div className="mx-auto max-w-[1360px] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <motion.div
          className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_24px_60px_-40px_rgba(0,0,0,0.95)]">
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground/95 [font-family:var(--home-copy)]"
            >
              Trusted By Serious Traders
            </Badge>
            <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.4rem)] font-[350] leading-[0.95] tracking-[-0.045em] [font-family:var(--home-display)]">
              The platform traders keep when they stop treating review like an afterthought.
            </h2>
            <p className="mt-4 max-w-xl text-[0.96rem] leading-[1.8] text-muted-foreground/68 [font-family:var(--home-copy)]">
              The product is built around discipline, clarity, and repeatable decision review. That is why funded traders, coaches, and team leads use the same operating layer.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <div className="mb-4 rounded-[1.8rem] border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">On-the-desk feedback</p>
              <p className="mt-3 text-sm leading-[1.8] text-foreground/60">
                Review quality only matters if traders and managers keep coming back to it. These quotes reflect how the system changes routines, not just dashboards.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:gap-4">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} index={i} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="mb-4 rounded-[1.8rem] border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Trust foundation</p>
              <p className="mt-3 text-sm leading-[1.8] text-foreground/60">
                The product is opinionated about security, data ownership, and operational reliability because trading review software only works when it earns long-term trust.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
              {trustPillars.map((pillar, i) => (
                <TrustPillarCard key={pillar.title} pillar={pillar} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
