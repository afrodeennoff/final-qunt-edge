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
  Target,
  Trophy,
  Wallet,
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

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const appFeatureRows = [
  {
    title: 'Execution review',
    body: 'Audit return, pair selection, average win/loss, duration, and streak behavior instead of relying on a single PnL headline.',
    icon: BarChart3,
  },
  {
    title: 'Firm research',
    body: 'Screen prop firms by cost, payout model, drawdown type, tracked accounts, and paid-out volume on the same public surface.',
    icon: Building2,
  },
  {
    title: 'Proof system',
    body: 'Bring leaderboard visibility, payout evidence, and public deal context together so the site reads like a product, not a brochure.',
    icon: Shield,
  },
]

const whyChooseUs = [
  {
    title: 'One interface',
    body: 'Home, deals, prop firms, and leaderboard now share the same layout rhythm and dark design language.',
  },
  {
    title: 'Research before hype',
    body: 'The public story starts with market context, tracked data, and company facts instead of disconnected promo blocks.',
  },
  {
    title: 'Built around trader decisions',
    body: 'Each page is designed to help users decide what to review, which firm to explore, and where to go next.',
  },
]

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

export default function HomeContent({ locale, overview, leaders, spotlights }: HomeContentProps) {
  const reduceMotion = useReducedMotion()
  const topLeaders = leaders.slice(0, 4)
  const featuredSpotlights = [...spotlights.futures.slice(0, 1), ...spotlights.cfd.slice(0, 1)]

  return (
    <main className="relative mx-auto w-full max-w-[1360px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden">
        <motion.div
          initial={{ opacity: 0.2, scale: 0.92 }}
          animate={reduceMotion ? { opacity: 0.35, scale: 1 } : { opacity: 0.55, scale: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute left-[10%] top-4 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,_rgba(88,129,255,0.26)_0%,_rgba(88,129,255,0)_72%)] blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0.18, x: 28 }}
          animate={reduceMotion ? { opacity: 0.24, x: 0 } : { opacity: 0.42, x: 0 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="absolute right-[7%] top-16 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(28,200,138,0.18)_0%,_rgba(28,200,138,0)_75%)] blur-3xl"
        />
        <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <section className="grid gap-6 pb-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:pb-10">
        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.7 }} className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
            <Sparkles className="h-3.5 w-3.5 text-v2-accent" />
            Public trader research layer
          </div>

          <div className="space-y-5">
            <h1 className="max-w-5xl text-[clamp(3.1rem,7vw,7rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-white">
              Research firms.
              <br />
              Review trades.
              <br />
              See public proof.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/64 sm:text-lg">
              Qunt Edge is a unified trader operating surface for performance review, prop firm discovery, payout context, and leaderboard visibility. The public pages now feel like one product end to end.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonV2 variant="solid" size="lg" className="rounded-full px-8" asChild>
              <Link href={`/${locale}/deals`} className="flex items-center gap-2">
                Explore Deals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </ButtonV2>
            <ButtonV2 variant="outline" size="lg" className="rounded-full border-white/12 bg-white/[0.03] px-8 text-white hover:bg-white/[0.06]" asChild>
              <Link href={`/${locale}/authentication?next=dashboard`}>Open Dashboard</Link>
            </ButtonV2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tracked firms" value={overview.totalTrackedFirms.toLocaleString()} icon={Building2} />
            <StatCard label="Live deals" value={overview.totalLiveDeals.toLocaleString()} icon={Wallet} />
            <StatCard label="Accounts tracked" value={overview.totalAccounts.toLocaleString()} icon={Landmark} />
            <StatCard label="Paid payouts" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} icon={Banknote} />
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.8, delay: 0.12 }}>
          <CardV2 variant="glass" hover={false} className="overflow-hidden rounded-[34px] border-white/10 bg-black/35 p-0">
            <div className="grid gap-4 border-b border-white/10 bg-white/[0.025] px-6 py-5 sm:grid-cols-2">
              <FeaturePulse
                eyebrow="Top futures"
                title={spotlights.futures[0]?.name ?? 'Futures spotlight'}
                body={spotlights.futures[0]?.promoText ?? 'Live futures coverage from the public market feed.'}
              />
              <FeaturePulse
                eyebrow="Top CFD"
                title={spotlights.cfd[0]?.name ?? 'CFD spotlight'}
                body={spotlights.cfd[0]?.promoText ?? 'Live CFD coverage from the public market feed.'}
              />
            </div>
            <CardV2Content className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Live public board</p>
                  <p className="mt-2 text-sm text-white/58">A compact view of the strongest public leader and firm signals on the site.</p>
                </div>
                <ButtonV2 variant="ghost" size="sm" className="rounded-full text-v2-accent" asChild>
                  <Link href={`/${locale}/leaderboard`}>View leaderboard</Link>
                </ButtonV2>
              </div>

              <div className="grid gap-3">
                {topLeaders.map((leader) => (
                  <div key={leader.userId} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/25 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-semibold text-white/72">
                        #{leader.rank}
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

      <section className="grid gap-4 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.72, delay: 0.14 }}>
          <SurfacePanel
            eyebrow="Platform story"
            title="Why traders choose us"
            description="The public site now mirrors the product itself: less clutter, stronger hierarchy, and a clear path from discovery to decision."
          >
            <div className="grid gap-3">
              {whyChooseUs.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-v2-accent" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-white/58">{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SurfacePanel>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.78, delay: 0.2 }}>
          <SurfacePanel
            eyebrow="Market snapshot"
            title="Featured prop firm coverage"
            description={`Spotlights refreshed from PropFirmMatch on ${spotlights.updatedAt}.`}
          >
            <div className="grid gap-3">
              {featuredSpotlights.map((item) => (
                <a
                  key={`${item.slug}-${item.category}`}
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/45">{item.category} spotlight</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/58">{item.promoText}</p>
                </a>
              ))}
            </div>
          </SurfacePanel>
        </motion.div>
      </section>

      <section className="grid gap-4 border-y border-white/8 py-8 sm:grid-cols-3">
        {appFeatureRows.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.62, delay: 0.16 + index * 0.08 }}
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

      <section className="grid gap-4 py-10 lg:grid-cols-[1fr] lg:py-14">
        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.76, delay: 0.22 }}>
          <SurfacePanel
            eyebrow="What you can do"
            title="Move from homepage to action in a few clicks"
            description="The landing flow is intentionally short now, with only the key product paths."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <JourneyCard icon={Target} title="Find a firm" body="Browse the deals board, filter by fit, then open a company profile." href={`/${locale}/deals`} />
              <JourneyCard icon={Trophy} title="See public leaders" body="Use the leaderboard to inspect current top performers and trade behavior." href={`/${locale}/leaderboard`} />
              <JourneyCard icon={Building2} title="Review firm stats" body="Scan tracked account value and payout traction on the prop firms page." href={`/${locale}/propfirms`} />
              <JourneyCard icon={BarChart3} title="Open the product" body="Go straight into your dashboard and review your own execution workflow." href={`/${locale}/authentication?next=dashboard`} />
            </div>
          </SurfacePanel>
        </motion.div>
      </section>
    </main>
  )
}

function SurfacePanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <CardV2 variant="glass" hover={false} className="rounded-[30px] border-white/10 bg-white/[0.03]">
      <CardV2Content className="p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">{eyebrow}</p>
        <CardV2Title className="mt-4 text-3xl text-white">{title}</CardV2Title>
        <CardV2Description className="mt-4 text-base leading-7 text-white/60">{description}</CardV2Description>
        <div className="mt-6">{children}</div>
      </CardV2Content>
    </CardV2>
  )
}

function StatCard({
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

function FeaturePulse({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{eyebrow}</p>
      <p className="mt-2 text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-white/60">{body}</p>
    </div>
  )
}

function JourneyCard({
  icon: Icon,
  title,
  body,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  href: string
}) {
  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition-colors hover:bg-white/[0.05]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <Icon className="h-4 w-4 text-v2-accent" />
      </div>
      <p className="mt-4 text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-white/58">{body}</p>
    </Link>
  )
}
