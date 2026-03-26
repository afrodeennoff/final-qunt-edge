'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgePercent,
  ChartNoAxesCombined,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react'
import type { DealItem, DealsOverview, UnifiedFirm } from '@/server/deals'
import { formatCompactCurrency } from '@/lib/formatting/currency'

type HomeContentProps = {
  locale: string
  firms: UnifiedFirm[]
  deals: DealItem[]
  overview: DealsOverview
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Deals', href: '/deals' },
  { label: 'Pricing', href: '/pricing' },
]

function formatPrice(value: number): string {
  if (value <= 0) return 'Free'
  return `$${value.toLocaleString()}`
}

function getLeadingFirms(firms: UnifiedFirm[]): UnifiedFirm[] {
  return [...firms]
    .sort((a, b) => {
      if (b.catalogueStats.paidPayoutAmount !== a.catalogueStats.paidPayoutAmount) {
        return b.catalogueStats.paidPayoutAmount - a.catalogueStats.paidPayoutAmount
      }
      return b.catalogueStats.accountsCount - a.catalogueStats.accountsCount
    })
    .slice(0, 5)
}

function getLeadingDeals(deals: DealItem[]): DealItem[] {
  return [...deals].sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 6)
}

const ease = [0.22, 1, 0.36, 1] as const

export default function HomeContent({ locale, firms, deals, overview }: HomeContentProps) {
  const localePrefix = `/${locale}`
  const leadingFirms = getLeadingFirms(firms)
  const leadingDeals = getLeadingDeals(deals)
  const topDeal = leadingDeals[0]

  return (
    <div className="bg-[#0a151c] text-white selection:bg-[#39b7d0] selection:text-[#071016]">
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <Image
          src="/videos/demo_dark_poster.png"
          alt="Qunt Edge interface preview"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,10,14,0.88)_22%,rgba(5,10,14,0.56)_58%,rgba(5,10,14,0.82)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(57,183,208,0.24),transparent_45%)]" />

        <header className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex w-full max-w-[1400px] items-center gap-2 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
            <Link
              href={localePrefix}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm"
            >
              Qunt Edge
            </Link>

            <nav className="ml-2 hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href.startsWith('#') ? item.href : `${localePrefix}${item.href}`}
                  className="rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/82 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href={`${localePrefix}/authentication`}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#39b7d0] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#041017] transition hover:bg-[#65d4e8]"
            >
              Start Free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1400px] items-end px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pb-14 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="max-w-[860px]"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Trade research, redesigned
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease, delay: 0.1 }}
              className="mt-5 text-[clamp(2.9rem,8.3vw,8.2rem)] font-semibold leading-[0.82] tracking-[-0.065em]"
            >
              Find elite prop firms,
              <span className="block text-[#66d6eb]">verify live discounts,</span>
              <span className="block">move with conviction.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.16 }}
              className="mt-5 max-w-[55ch] text-sm leading-7 text-white/80 sm:text-base"
            >
              One visual command surface for firm comparison, deal intelligence, and leaderboard context, with no clutter and no generic landing-page noise.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.22 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href={`${localePrefix}/propfirms`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#07151f] transition hover:bg-[#dff6fb]"
              >
                Explore firms
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`${localePrefix}/deals`}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/16"
              >
                View live deals
                <BadgePercent className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#09131a]">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-0 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          <Metric label="Tracked Firms" value={overview.totalTrackedFirms.toLocaleString()} />
          <Metric label="Live Deals" value={overview.totalLiveDeals.toLocaleString()} />
          <Metric label="Payout Volume" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} />
          <Metric label="Payout Events" value={overview.totalPaidPayoutCount.toLocaleString()} />
        </div>
      </section>

      <section id="features" className="bg-[#f1f4f2] text-[#07151f]">
        <div className="mx-auto grid w-full max-w-[1400px] gap-0 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.68, ease }}
            className="relative min-h-[500px] overflow-hidden rounded-[2rem]"
          >
            <Image src="/business-light.png" alt="Market research scene" fill className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(20deg,rgba(7,21,31,0.7),rgba(7,21,31,0.16))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Featured Signal</p>
              <h2 className="mt-3 text-[clamp(1.9rem,3.5vw,3.2rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
                Top deal right now:
                <span className="block text-[#82dff0]">{topDeal ? `${topDeal.discountPercent}% off ${topDeal.firmName}` : 'Live updates in progress'}</span>
              </h2>
              <p className="mt-3 text-sm text-white/82">
                {topDeal ? `${topDeal.platform} • ${topDeal.category} • ${topDeal.couponCode}` : 'The strongest verified discount appears here first.'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease, delay: 0.06 }}
            className="flex flex-col justify-center gap-8 px-0 pt-10 lg:px-14 lg:pt-0"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3f5a67]">Why this flow works</p>
            <h3 className="text-[clamp(2rem,4.5vw,4rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
              One surface.
              <span className="block text-[#1f8fa8]">Real signal.</span>
            </h3>
            <p className="max-w-[45ch] text-sm leading-7 text-[#304957]">
              Scan firms by payout traction, spot discount opportunities instantly, and carry that context into ranking and pricing decisions without bouncing across disconnected pages.
            </p>
            <div className="space-y-3 border-t border-[#07151f]/10 pt-4">
              <Row icon={ShieldCheck} label="Compare payout models and account behavior with less friction." />
              <Row icon={ChartNoAxesCombined} label="Keep high-signal stats visible while evaluating tradeoffs." />
              <Row icon={BadgePercent} label="Turn active offers into concrete, immediately actionable choices." />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="benefits" className="bg-[#07131a] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7bcfe0]">Top Firms</p>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
                Ranked by real
                <span className="block">payout traction.</span>
              </h2>
            </div>
            <div>
              <p className="max-w-[54ch] text-sm leading-7 text-white/75">
                The strongest names in your dataset, prioritized for direct action and linked to their dedicated firm pages.
              </p>
            </div>
          </motion.div>

          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {leadingFirms.length > 0 ? (
              leadingFirms.map((firm, index) => (
                <motion.div
                  key={firm.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, ease, delay: index * 0.04 }}
                >
                  <Link
                    href={`${localePrefix}/firm/${firm.slug}`}
                  className="group grid items-center gap-2 py-6 transition hover:bg-white/5 sm:grid-cols-[64px_1fr_auto] sm:gap-5"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7bcfe0]">#{index + 1}</p>
                    <div>
                      <p className="text-xl font-semibold tracking-[-0.03em]">{firm.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/65">{firm.platform} • {firm.payoutModel}</p>
                    </div>
                    <div className="text-sm text-white/76 sm:text-right">
                      <p>{formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)}</p>
                      <p>{firm.catalogueStats.accountsCount.toLocaleString()} accounts</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/65 transition group-hover:translate-x-1 group-hover:text-white sm:hidden" />
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="py-5 text-sm text-white/70">Firm rankings appear here when data is available.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#f1f4f2] py-16 text-[#07151f] sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3f5a67]">Live Deal Tape</p>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
                Active discounts,
                <span className="block text-[#1f8fa8]">displayed for fast decisions.</span>
              </h2>
            </div>
            <Link
              href={`${localePrefix}/deals`}
              className="inline-flex items-center gap-2 rounded-full border border-[#07151f]/14 px-5 py-2.5 text-sm font-semibold transition hover:bg-[#e2f3f7]"
            >
              Open full deals board
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {leadingDeals.length > 0 ? (
              leadingDeals.map((deal, index) => (
                <motion.article
                  key={deal.id}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, ease, delay: index * 0.05 }}
                  className="border-t border-[#07151f]/12 bg-transparent pt-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#56707d]">{deal.category}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">{deal.firmName}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#56707d]">{deal.platform}</p>

                  <div className="mt-4 flex items-end justify-between">
                    <p className="text-4xl font-semibold tracking-[-0.04em] text-[#cc5f3a]">{deal.discountPercent}%</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em]">{deal.couponCode}</p>
                  </div>

                  <p className="mt-3 text-sm text-[#304957]">Challenge fee {formatPrice(deal.challengeFee)}</p>
                </motion.article>
              ))
            ) : (
              <p className="text-sm text-[#304957]">No active deals available right now.</p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#07131a] py-14 sm:py-18 lg:py-22">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease }}
            className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7bcfe0]">Final Step</p>
              <h2 className="mt-3 text-[clamp(2rem,4.2vw,3.8rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
                Start your next
                <span className="block text-[#7bcfe0]">firm decision with signal.</span>
              </h2>
              <p className="mt-4 max-w-[52ch] text-sm leading-7 text-white/74">
                Browse the catalogue, validate deal quality, and step into your dashboard with real context instead of guesswork.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href={`${localePrefix}/propfirms`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#07151f] transition hover:bg-[#dff6fb]"
              >
                Open catalogue
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`${localePrefix}/leaderboard`}
                className="inline-flex items-center gap-2 rounded-full border border-white/28 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Leaderboard
                <Trophy className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-white/10 pr-3 last:border-r-0 sm:pr-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{value}</p>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck
  label: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#d7edf2] text-[#1f8fa8]">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-sm leading-6 text-[#304957]">{label}</p>
    </div>
  )
}
