'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Banknote,
  BarChart3,
  Building2,
  CheckCircle2,
  Landmark,
  Shield,
  Sparkles,
} from 'lucide-react'
import { ButtonV2, CardV2, CardV2Content, CardV2Description, CardV2Title } from '@/components/ui/v2'
import type { DealsOverview, DealsSpotlightCollection } from '@/server/deals'
import type { LeaderboardEntry } from '@/app/[locale]/(landing)/leaderboard/data/leaderboard-query'

type HomeContentProps = {
  locale: string
  overview: DealsOverview
  leaders: LeaderboardEntry[]
  spotlights: DealsSpotlightCollection
}

const corePillars = [
  {
    title: 'Review what actually happened',
    body: 'Track return, pair selection, durations, average win and loss, and streak behavior instead of hiding everything behind one performance number.',
    icon: BarChart3,
  },
  {
    title: 'Research firms with context',
    body: 'Compare live deals, short company summaries, tracked account value, and paid payout totals in one public workflow.',
    icon: Building2,
  },
  {
    title: 'Keep the interface disciplined',
    body: 'One dark visual system across home, deals, leaderboard, and firm pages means less friction and less visual drift.',
    icon: Shield,
  },
]

const whyChooseUs = [
  'Deals and leaderboard use real public data contracts instead of decorative placeholders.',
  'Public pages now share the same dark design language as the rest of the product.',
  'The landing page flows directly into firm research and proof, not disconnected marketing tabs.',
]

const competitorRows = [
  ['Research depth', 'Firm cards include payouts, account value, and challenge context.', 'Mostly promo-first pages with thin company detail.'],
  ['Trader proof', 'Leaderboard shows richer public metrics like pair, duration, and streaks.', 'Usually limited to top-line results or ad-style ranking lists.'],
  ['Design continuity', 'Home, deals, and leaderboard feel like one product.', 'Marketing and app surfaces often look like separate systems.'],
]

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function HomeContent({ locale, overview, leaders, spotlights }: HomeContentProps) {
  const reduceMotion = useReducedMotion()
  const topLeaders = leaders.slice(0, 4)

  return (
    <main className="relative mx-auto w-full max-w-[1320px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] overflow-hidden">
        <motion.div
          initial={{ opacity: 0.25, scale: 0.92 }}
          animate={reduceMotion ? { opacity: 0.45, scale: 1 } : { opacity: 0.72, scale: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute left-[18%] top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(88,129,255,0.22)_0%,_rgba(88,129,255,0)_72%)] blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0.2, x: 32 }}
          animate={reduceMotion ? { opacity: 0.28, x: 0 } : { opacity: 0.48, x: 0 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="absolute right-[10%] top-20 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(28,200,138,0.16)_0%,_rgba(28,200,138,0)_75%)] blur-3xl"
        />
        <div className="absolute inset-x-0 top-20 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <section className="grid gap-6 pb-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:pb-14">
        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.7 }} className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
            <Sparkles className="h-3.5 w-3.5 text-v2-accent" />
            Minimal trader operating system
          </div>

          <div className="space-y-5">
            <h1 className="max-w-5xl text-[clamp(3.2rem,7vw,7rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-white">
              Sharper review.
              <br />
              Cleaner research.
              <br />
              One public surface.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/64 sm:text-lg">
              Qunt Edge connects execution review, firm discovery, payout proof, and public leaderboard signals in one dark interface built for traders who want less noise and better decisions.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonV2 variant="solid" size="lg" className="rounded-full px-8" asChild>
              <Link href={`/${locale}/authentication?next=dashboard`} className="flex items-center gap-2">
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </ButtonV2>
            <ButtonV2 variant="outline" size="lg" className="rounded-full border-white/12 bg-white/[0.03] px-8 text-white hover:bg-white/[0.06]" asChild>
              <Link href={`/${locale}/deals`}>Explore Deals</Link>
            </ButtonV2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatChip label="Tracked firms" value={overview.totalTrackedFirms.toLocaleString()} icon={Building2} />
            <StatChip label="Accounts tracked" value={overview.totalAccounts.toLocaleString()} icon={Landmark} />
            <StatChip label="Paid payouts" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} icon={Banknote} />
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.8, delay: 0.12 }}>
          <CardV2 variant="glass" hover={false} className="overflow-hidden rounded-[34px] border-white/10 bg-black/35 p-0">
            <div className="grid gap-4 border-b border-white/10 bg-white/[0.025] px-6 py-5 sm:grid-cols-2">
              <MiniFeature
                eyebrow="Top futures"
                title={spotlights.futures[0]?.name ?? 'Tradeify'}
                body={spotlights.futures[0]?.promoText ?? 'Live futures spotlight data.'}
              />
              <MiniFeature
                eyebrow="Top CFD"
                title={spotlights.cfd[0]?.name ?? 'FTMO'}
                body={spotlights.cfd[0]?.promoText ?? 'Live CFD spotlight data.'}
              />
            </div>
            <CardV2Content className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Leaderboard pulse</p>
                  <p className="mt-2 text-sm text-white/58">The top public traders this month, surfaced directly on the landing page.</p>
                </div>
                <ButtonV2 variant="ghost" size="sm" className="rounded-full text-v2-accent" asChild>
                  <Link href={`/${locale}/leaderboard`}>View board</Link>
                </ButtonV2>
              </div>
              <div className="mt-5 space-y-3">
                {topLeaders.map((leader) => (
                  <div key={leader.userId} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/25 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-semibold text-white/72">
                        {leader.rank}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{leader.username}</p>
                        <p className="text-xs text-white/45">{leader.topInstrument ?? 'No pair data yet'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-300">{formatCompactCurrency(leader.monthlyPnl)}</p>
                      <p className="text-xs text-white/45">{leader.winRate}% win rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardV2Content>
          </CardV2>
        </motion.div>
      </section>

      <section className="grid gap-4 border-y border-white/8 py-8 sm:grid-cols-3">
        {corePillars.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.62, delay: 0.14 + index * 0.08 }}
            >
              <CardV2 variant="glass" hover={false} className="h-full rounded-[28px] border-white/8 bg-white/[0.02]">
                <CardV2Content className="p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
                    <Icon className="h-5 w-5 text-v2-accent" />
                  </div>
                  <CardV2Title className="mt-5 text-xl text-white">{item.title}</CardV2Title>
                  <CardV2Description className="mt-3 text-sm leading-7 text-white/58">{item.body}</CardV2Description>
                </CardV2Content>
              </CardV2>
            </motion.div>
          )
        })}
      </section>

      <section className="grid gap-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.72, delay: 0.18 }}>
          <CardV2 variant="glass" hover={false} className="rounded-[30px] border-white/10 bg-white/[0.03]">
            <CardV2Content className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Why Qunt Edge</p>
              <CardV2Title className="mt-4 text-3xl text-white">Built for traders who want signal, not clutter.</CardV2Title>
              <div className="mt-6 space-y-3">
                {whyChooseUs.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-v2-accent" />
                    <p className="text-sm leading-7 text-white/60">{item}</p>
                  </div>
                ))}
              </div>
            </CardV2Content>
          </CardV2>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.78, delay: 0.24 }}>
          <CardV2 variant="elevated" hover={false} className="rounded-[30px] border-white/12 bg-white/[0.04]">
            <CardV2Content className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Public proof</p>
              <CardV2Title className="mt-4 text-3xl text-white">The landing page now carries product truth, not only marketing copy.</CardV2Title>
              <CardV2Description className="mt-4 text-base leading-7 text-white/60">
                {overview.totalLiveDeals} live deals, {overview.totalTrackedFirms} tracked firms, and {leaders.length} leaderboard entries now drive the public story directly.
              </CardV2Description>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InlineLink href={`/${locale}/deals`} label="Open firm board" />
                <InlineLink href={`/${locale}/leaderboard`} label="See leaderboard" />
                <InlineLink href={`/${locale}/propfirms`} label="Browse prop firms" />
                <InlineLink href={`/${locale}/support`} label="Talk to the team" />
              </div>
            </CardV2Content>
          </CardV2>
        </motion.div>
      </section>

      <section className="pb-6">
        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.82, delay: 0.28 }}>
          <CardV2 variant="glass" hover={false} className="overflow-hidden rounded-[32px] border-white/10 bg-white/[0.03] p-0">
            <CardV2Content className="p-6 sm:p-8">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Comparison</p>
                <CardV2Title className="mt-4 text-3xl text-white">A tighter product story than the usual trader landing page.</CardV2Title>
                <CardV2Description className="mt-4 text-base leading-7 text-white/60">
                  The difference is not louder claims. It is that research, proof, and product entry points now live in one coherent public experience.
                </CardV2Description>
              </div>
            </CardV2Content>
            <div className="border-t border-white/10">
              <div className="grid grid-cols-[0.9fr_1fr_1fr] border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-[0.16em] text-white/45">
                <div className="px-4 py-4">Category</div>
                <div className="px-4 py-4">Qunt Edge</div>
                <div className="px-4 py-4">Typical alternative</div>
              </div>
              {competitorRows.map(([label, ours, others]) => (
                <div key={label} className="grid grid-cols-[0.9fr_1fr_1fr] border-b border-white/10 last:border-b-0">
                  <div className="px-4 py-4 text-sm font-medium text-white">{label}</div>
                  <div className="px-4 py-4 text-sm leading-7 text-white/62">{ours}</div>
                  <div className="px-4 py-4 text-sm leading-7 text-white/48">{others}</div>
                </div>
              ))}
            </div>
          </CardV2>
        </motion.div>
      </section>
    </main>
  )
}

function StatChip({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
          <Icon className="h-4 w-4 text-v2-accent" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function MiniFeature({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{eyebrow}</p>
      <p className="mt-2 text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-white/60">{body}</p>
    </div>
  )
}

function InlineLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white/72 transition-colors hover:bg-white/[0.05] hover:text-white">
      {label}
    </Link>
  )
}
