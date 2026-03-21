'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Banknote, Building2, Landmark, Trophy } from 'lucide-react'
import { ButtonV2, CardV2, CardV2Content, CardV2Description, CardV2Title } from '@/components/ui/v2'
import type { DealsOverview, DealsSpotlightCollection } from '@/server/deals'
import type { LeaderboardEntry } from '@/app/[locale]/(landing)/leaderboard/data/leaderboard-query'

type HomeContentProps = {
  locale: string
  overview: DealsOverview
  leaders: LeaderboardEntry[]
  spotlights: DealsSpotlightCollection
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function HomeContent({ locale, overview, leaders, spotlights }: HomeContentProps) {
  const topLeaders = leaders.slice(0, 5)

  return (
    <main className="relative mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] overflow-hidden">
        <motion.div
          initial={{ opacity: 0.45, scale: 0.94 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(88,129,255,0.22)_0%,_rgba(88,129,255,0)_72%)] blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0.2, x: -40 }}
          animate={{ opacity: 0.5, x: 0 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="absolute right-[10%] top-24 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.12)_0%,_rgba(34,197,94,0)_74%)] blur-3xl"
        />
        <div className="absolute inset-x-0 top-20 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>

      <section className="grid gap-8 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:py-14">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7 }} className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
            <span className="h-2 w-2 rounded-full bg-v2-accent" />
            Minimal dark infrastructure for trader review
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-[clamp(3.1rem,7vw,6.6rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
              One dark
              <br />
              operating system
              <br />
              for traders.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/66 sm:text-lg">
              Qunt Edge blends execution review, live firm research, payout proof, and public leaderboards into one restrained surface with less noise and better decision context.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonV2 variant="solid" size="lg" className="rounded-full px-8">
              <Link href={`/${locale}/authentication?next=dashboard`} className="flex items-center gap-2">
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </ButtonV2>
            <ButtonV2 variant="ghost" size="lg" className="rounded-full border border-white/12 bg-white/[0.03] px-8 text-white hover:bg-white/[0.06]">
              <Link href={`/${locale}/deals`}>Browse Firm Board</Link>
            </ButtonV2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroMetric label="Tracked firms" value={overview.totalTrackedFirms.toLocaleString()} icon={Building2} />
            <HeroMetric label="Accounts tracked" value={overview.totalAccounts.toLocaleString()} icon={Landmark} />
            <HeroMetric label="Paid payouts" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} icon={Banknote} />
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <CardV2 variant="glass" hover={false} className="overflow-hidden rounded-[32px] border-white/10 bg-black/35 p-0">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Live Surface</p>
            </div>
            <CardV2Content className="grid gap-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InsightCard
                  eyebrow="Top futures"
                  title={spotlights.futures[0]?.name ?? 'Tradeify'}
                  body={spotlights.futures[0]?.promoText ?? 'Current futures promos surfaced from the spotlights layer.'}
                />
                <InsightCard
                  eyebrow="Top CFD"
                  title={spotlights.cfd[0]?.name ?? 'FTMO'}
                  body={spotlights.cfd[0]?.promoText ?? 'Current CFD and forex promos surfaced from the spotlights layer.'}
                />
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                  <div>
                    <p className="text-sm font-medium text-white">Leaderboard pulse</p>
                    <p className="mt-1 text-sm text-white/54">Public leaders ranked from real monthly performance data.</p>
                  </div>
                  <Link href={`/${locale}/leaderboard`} className="text-sm font-medium text-v2-accent">
                    View all
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {topLeaders.map((leader) => (
                    <div key={leader.userId} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/25 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-semibold text-white/72">
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
              </div>
            </CardV2Content>
          </CardV2>
        </motion.div>
      </section>

      <section className="grid gap-4 border-y border-white/8 py-8 sm:grid-cols-3">
        {[
          ['Unified public surface', 'Home, deals, and leaderboard now speak the same dark visual language and data model.'],
          ['Real firm metrics', 'Deals now include tracked accounts, funded value, and payout totals from our own dataset.'],
          ['Cleaner review flow', 'The homepage is reduced to the signals that matter instead of a long stack of unrelated marketing blocks.'],
        ].map(([title, body], index) => (
          <motion.div
            key={title}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.65, delay: 0.15 + index * 0.08 }}
            className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4"
          >
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm leading-6 text-white/56">{body}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 py-10 lg:grid-cols-[1fr_0.95fr] lg:py-14">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7, delay: 0.2 }}>
          <CardV2 variant="glass" hover={false} className="rounded-[30px] border-white/10 bg-white/[0.03]">
            <CardV2Content className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Now live</p>
              <CardV2Title className="mt-4 text-3xl text-white">Deals and leaderboard are no longer separate design systems.</CardV2Title>
              <CardV2Description className="mt-4 max-w-2xl text-base leading-7 text-white/60">
                The public product now connects the story: discover firms, inspect account and payout traction, and check how real traders are performing in the same design language.
              </CardV2Description>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <QuickLink href={`/${locale}/deals`} title="Deals board" body="Company cards, descriptions, payout totals, and live offer context." />
                <QuickLink href={`/${locale}/leaderboard`} title="Leaderboard" body="Top traders with real monthly metrics, pairs, durations, and streaks." />
                <QuickLink href={`/${locale}/propfirms`} title="Prop firms" body="Catalogue-level view of accounts, value distribution, and payout activity." />
                <QuickLink href={`/${locale}/support`} title="Support" body="Help and product feedback without leaving the main public flow." />
              </div>
            </CardV2Content>
          </CardV2>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.75, delay: 0.28 }}>
          <CardV2 variant="elevated" hover={false} className="rounded-[30px] border-white/12 bg-white/[0.04]">
            <CardV2Content className="flex h-full flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/55">
                  <Trophy className="h-3.5 w-3.5 text-v2-accent" />
                  Public proof
                </div>
                <CardV2Title className="mt-4 text-3xl text-white">
                  Minimal on the surface.
                  <br />
                  Richer underneath.
                </CardV2Title>
                <CardV2Description className="mt-4 text-base leading-7 text-white/60">
                  We removed theme drift and visual conflict, then pushed the same rigor into the code paths behind deals and leaderboard so the UI stays honest under real data.
                </CardV2Description>
              </div>
              <ButtonV2 variant="solid" size="lg" className="mt-8 rounded-full px-8">
                <Link href={`/${locale}/authentication?next=dashboard`} className="flex items-center gap-2">
                  Start With Qunt Edge
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </ButtonV2>
            </CardV2Content>
          </CardV2>
        </motion.div>
      </section>
    </main>
  )
}

function HeroMetric({
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

function InsightCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{eyebrow}</p>
      <p className="mt-2 text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-white/60">{body}</p>
    </div>
  )
}

function QuickLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/8 bg-black/25 p-5 transition-colors hover:bg-white/[0.04]">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/56">{body}</p>
    </Link>
  )
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}
