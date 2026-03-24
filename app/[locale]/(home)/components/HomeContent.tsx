import Link from 'next/link'
import {
  ArrowRight,
  BadgePercent,
  BookOpenText,
  CheckCircle2,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import type { DealItem, DealsOverview, UnifiedFirm } from '@/server/deals'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import PropFirmsExplorer from './PropFirmsExplorer'

interface HomeContentProps {
  locale: string
  firms: UnifiedFirm[]
  deals: DealItem[]
  overview: DealsOverview
}

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
    .slice(0, 6)
}

function getLeadingDeals(deals: DealItem[]): DealItem[] {
  return [...deals].sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 4)
}

export default function HomeContent({ locale, firms, deals, overview }: HomeContentProps) {
  const localePrefix = `/${locale}`
  const leadingFirms = getLeadingFirms(firms)
  const featuredFirms = leadingFirms.slice(0, 3)
  const trustFirms = leadingFirms.slice(0, 6)
  const leadingDeals = getLeadingDeals(deals)
  const topDeal = leadingDeals[0]

  return (
    <div className="relative overflow-x-hidden bg-[#f3f0e7] text-[#1d1b16] selection:bg-[#1d1b16] selection:text-[#f3f0e7]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(132,103,79,0.18),transparent_58%)]" />
        <div className="absolute left-0 top-40 h-72 w-72 rounded-full bg-[#d9c7b0]/25 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[#b9d0be]/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(29,27,22,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(29,27,22,0.04)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-[1380px] flex-col gap-10 px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:gap-16 lg:pt-12">
        <section className="border-b border-[#1d1b16]/12 pb-10 lg:pb-14">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6a6258]">
                <Sparkles className="h-3.5 w-3.5 text-[#8b5e3c]" />
                Qunt Edge for prop traders
              </div>

              <h1 className="mt-6 max-w-4xl text-[clamp(3.3rem,8vw,7.2rem)] font-semibold leading-[0.88] tracking-[-0.065em] text-[#1d1b16]">
                Find the right
                <span className="block text-[#8b5e3c]">prop firm faster.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-[#5d564d]">
                A redesigned command center for comparing firms, spotting live challenge discounts, and carrying that context into deeper review without bouncing between generic pages.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`${localePrefix}/propfirms`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1d1b16] px-5 py-3 text-sm font-semibold text-[#f3f0e7] transition-colors hover:bg-[#322f29]"
                >
                  Explore firms
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`${localePrefix}/deals`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1d1b16]/10 bg-white/70 px-5 py-3 text-sm font-medium text-[#1d1b16] transition-colors hover:bg-white"
                >
                  Open deals board
                  <BadgePercent className="h-4 w-4" />
                </Link>
                <Link
                  href={`${localePrefix}/leaderboard`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1d1b16]/10 bg-white/70 px-5 py-3 text-sm font-medium text-[#1d1b16] transition-colors hover:bg-white"
                >
                  View leaderboard
                  <Trophy className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid gap-6 border-t border-[#1d1b16]/10 pt-6 sm:grid-cols-3">
                <HeroMetric label="Tracked firms" value={overview.totalTrackedFirms.toString()} helper="Comparison-ready catalogue" />
                <HeroMetric label="Live deals" value={overview.totalLiveDeals.toString()} helper="Verified offers on the board" />
                <HeroMetric label="Paid payouts" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} helper={`${overview.totalPaidPayoutCount.toLocaleString()} payout events`} />
              </div>
            </div>

            <div className="grid gap-6 border-t border-[#1d1b16]/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="grid gap-3 sm:grid-cols-3">
                {['2025 editorial pick', '2024 trader approved', '2023 comparison refined'].map((award) => (
                  <div key={award} className="border-b border-[#1d1b16]/10 pb-3 text-sm font-medium text-[#4e473f]">
                    {award}
                  </div>
                ))}
              </div>

              <div className="grid gap-6 sm:grid-cols-[1.05fr_0.95fr]">
                <div className="border-b border-[#1d1b16]/10 pb-6 text-[#1d1b16] sm:border-b-0 sm:border-r sm:pr-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a7065]">Live signal</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    {topDeal ? `${topDeal.discountPercent}% off ${topDeal.firmName}` : 'Deals update throughout the day'}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#5d564d]">
                    {topDeal
                      ? `${topDeal.platform} • ${topDeal.category} • coupon ${topDeal.couponCode}`
                      : 'When verified offers are live, the strongest discount appears here first.'}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <SoftStat label="Challenge fee" value={topDeal ? formatPrice(topDeal.challengeFee) : 'Pending'} />
                    <SoftStat label="Tracked accounts" value={overview.totalAccounts.toLocaleString()} />
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a7065]">Why this page exists</p>
                  <div className="mt-4 space-y-3">
                    <StoryLine
                      icon={Radar}
                      title="Scan the field"
                      copy="See the strongest firms, payouts, and deals before opening a single detail page."
                    />
                    <StoryLine
                      icon={ShieldCheck}
                      title="Stress-test the setup"
                      copy="Use the explorer to narrow by platform, challenge structure, and drawdown type."
                    />
                    <StoryLine
                      icon={BookOpenText}
                      title="Carry context forward"
                      copy="Move into deals, firm detail, and trader ranking without losing the reason behind your shortlist."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#1d1b16]/10 pb-10">
          <SectionTag label="Trusted by active researchers" />
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
            {trustFirms.length > 0 ? (
              trustFirms.map((firm) => (
                <Link
                  key={firm.id}
                  href={`${localePrefix}/firm/${firm.slug}`}
                  className="inline-flex items-center gap-3 text-sm font-semibold text-[#1d1b16] transition-colors hover:text-[#8b5e3c]"
                >
                  <span>{firm.name}</span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[#7a7065]">{firm.platform}</span>
                </Link>
              ))
            ) : (
              <div className="text-sm text-[#6a6258]">
                Firm highlights appear here when the current dataset is available.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <FeaturePanel
            label="Featured firms"
            title="The names showing the strongest payout traction right now."
            copy="A cleaner editorial list keeps the strongest firms visible without turning the page into a wall of boxes."
          >
            <div className="mt-6 divide-y divide-[#1d1b16]/10 border-y border-[#1d1b16]/10">
              {featuredFirms.map((firm, index) => (
                <Link
                  key={firm.id}
                  href={`${localePrefix}/firm/${firm.slug}`}
                  className="grid gap-3 py-4 transition-colors hover:text-[#8b5e3c] sm:grid-cols-[auto_1fr_auto]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b5e3c]">Rank #{index + 1}</p>
                  <div>
                    <h3 className="text-xl font-semibold text-[#1d1b16]">{firm.name}</h3>
                    <p className="mt-2 text-sm text-[#5d564d]">{firm.platform} • {firm.payoutModel}</p>
                  </div>
                  <div className="grid gap-2 text-sm text-[#4e473f] sm:text-right">
                    <span>{formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)} paid out</span>
                    <span>{firm.catalogueStats.accountsCount.toLocaleString()} accounts</span>
                  </div>
                </Link>
              ))}
            </div>
          </FeaturePanel>

          <FeaturePanel
            label="Live deal tape"
            title="Pricing cards that feel like product tiles, not coupon clutter."
            copy="This stays closer to a market tape than a coupon grid, so the pricing signal is easier to scan."
          >
            <div className="mt-6 divide-y divide-[#1d1b16]/10 border-y border-[#1d1b16]/10">
              {leadingDeals.length > 0 ? (
                leadingDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`${localePrefix}/deals`}
                    className="grid gap-3 py-4 transition-colors hover:text-[#8b5e3c] sm:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1d1b16]">{deal.firmName}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#7a7065]">{deal.category} • {deal.platform}</p>
                    </div>
                    <div className="grid gap-2 text-sm text-[#4e473f] sm:text-right">
                      <span>{deal.discountPercent}% off</span>
                      <span>{deal.couponCode} • {formatPrice(deal.challengeFee)}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-6 text-sm text-[#6a6258]">
                  Live deal highlights appear here when active offers are available.
                </div>
              )}
            </div>
          </FeaturePanel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <StoryPanel
            label="Why traders choose Qunt Edge"
            eyebrow="Research without the mess"
            title="A homepage built like a clean product story."
            copy="The Najaf reference leans on spacious sections, strong cards, and simple story rhythm. Here that same feeling is translated into a trading-research surface with real metrics instead of placeholder product copy."
            points={[
              'One place to compare firms, see live deals, and jump to trader performance.',
              'A calmer hierarchy that makes scanning easier on desktop and mobile.',
              'Each block pushes toward a useful next step rather than stacking generic claims.',
            ]}
          />

          <StoryPanel
            label="Decision benefits"
            eyebrow="Built for real comparison"
            title="Move from shortlist to conviction faster."
            copy="Instead of hiding the useful signals below a generic hero, the strongest firms, deal context, and interactive explorer show up immediately."
            points={[
              `${overview.totalAccounts.toLocaleString()} tracked accounts represented in the current view.`,
              `${formatCompactCurrency(overview.totalAccountValue)} in account value across the dataset.`,
              `${overview.totalLiveDeals.toString()} verified discounts available to review right now.`,
            ]}
            accent="sage"
          />
        </section>

        <section className="border-t border-[#1d1b16]/10 pt-8">
          <SectionTag label="Interactive explorer" />
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-semibold tracking-[-0.05em] text-[#1d1b16]">
                The hands-on section of the new home page.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d564d]">
                This is where the page stops talking and starts helping. Search the firm field, narrow by structure, and keep the same visual language all the way into the catalogue.
              </p>
            </div>
            <Link
              href={`${localePrefix}/propfirms`}
              className="inline-flex items-center gap-2 rounded-full border border-[#1d1b16]/10 bg-white/80 px-5 py-3 text-sm font-medium text-[#1d1b16] transition-colors hover:bg-white"
            >
              Open full catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6">
            <PropFirmsExplorer locale={locale} firms={firms} />
          </div>
        </section>
      </main>
    </div>
  )
}

function SectionTag({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#1d1b16]/10 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7065]">
      {label}
    </div>
  )
}

function HeroMetric({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7065]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#1d1b16]">{value}</p>
      <p className="mt-2 text-xs text-[#6a6258]">{helper}</p>
    </div>
  )
}

function SoftStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-[#1d1b16]/10 pt-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#7a7065]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#1d1b16]">{value}</p>
    </div>
  )
}

function StoryLine({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof TrendingUp
  title: string
  copy: string
}) {
  return (
    <div className="border-b border-[#1d1b16]/10 pb-4 last:border-b-0">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1d1b16]/10 bg-white/80">
          <Icon className="h-4 w-4 text-[#1d1b16]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#1d1b16]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#5d564d]">{copy}</p>
        </div>
      </div>
    </div>
  )
}

function FeaturePanel({
  label,
  title,
  copy,
  children,
}: {
  label: string
  title: string
  copy: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-[#1d1b16]/10 pt-6">
      <SectionTag label={label} />
      <h2 className="mt-4 text-[clamp(2rem,4vw,3.1rem)] font-semibold tracking-[-0.05em] text-[#1d1b16]">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d564d]">{copy}</p>
      {children}
    </section>
  )
}

function StoryPanel({
  label,
  eyebrow,
  title,
  copy,
  points,
  accent = 'sand',
}: {
  label: string
  eyebrow: string
  title: string
  copy: string
  points: string[]
  accent?: 'sand' | 'sage'
}) {
  const panelClass =
    accent === 'sage'
      ? 'bg-[#dfe8df]/75 border-[#1d1b16]/10'
      : 'bg-[#eadfce]/75 border-[#1d1b16]/10'

  return (
    <section className={`border-t pt-6 ${panelClass}`}>
      <SectionTag label={label} />
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a7065]">{eyebrow}</p>
      <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.05em] text-[#1d1b16]">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5d564d]">{copy}</p>
      <div className="mt-6 space-y-3">
        {points.map((point) => (
          <div key={point} className="flex items-start gap-3 border-b border-[#1d1b16]/10 pb-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5e3c]" />
            <p className="text-sm leading-6 text-[#4e473f]">{point}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
