import Link from 'next/link'
import { ArrowRight, BadgePercent, ChartColumnBig, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
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

export default function HomeContent({ locale, firms, deals, overview }: HomeContentProps) {
  const localePrefix = `/${locale}`
  const featuredFirms = [...firms]
    .sort((a, b) => {
      if (b.catalogueStats.accountsCount !== a.catalogueStats.accountsCount) {
        return b.catalogueStats.accountsCount - a.catalogueStats.accountsCount
      }
      return b.catalogueStats.paidPayoutAmount - a.catalogueStats.paidPayoutAmount
    })
    .slice(0, 4)

  const liveDeals = [...deals].sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 3)

  return (
    <div className="relative overflow-x-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_22%,hsl(var(--background))_100%)] selection:bg-[hsl(var(--primary)/0.3)] selection:text-primary-foreground [--home-display:var(--font-geist)] [--home-copy:var(--font-manrope)] [--home-mono:var(--font-geist)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(60%_45%_at_50%_0%,hsl(var(--foreground)/0.08),transparent_72%)]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(40%_40%_at_80%_20%,hsl(var(--primary)/0.08),transparent_72%)]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-[1380px] flex-col gap-14 px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
        <section className="grid gap-8 rounded-[2rem] border border-border/60 bg-card/50 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.10)] backdrop-blur-sm lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Prop Firm Intelligence Hub
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-[clamp(2.6rem,7vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-foreground [font-family:var(--home-display)]">
                Find the right prop firm.
                <span className="block text-muted-foreground">Review performance like a desk.</span>
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Qunt Edge combines prop-firm discovery, live deal tracking, and trader-grade performance review into one cleaner workflow for serious futures traders.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`${localePrefix}/propfirms`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Explore Firms
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`${localePrefix}/deals`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Browse Live Deals
                <BadgePercent className="h-4 w-4" />
              </Link>
              <Link
                href={`${localePrefix}/leaderboard`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                View Leaderboard
                <Trophy className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Tracked firms" value={overview.totalTrackedFirms.toString()} helper="Live comparison directory" />
              <StatTile label="Active deals" value={overview.totalLiveDeals.toString()} helper="Verified discounts and promos" />
              <StatTile label="Paid payouts" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} helper={`${overview.totalPaidPayoutCount.toLocaleString()} confirmed payouts`} />
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] border border-border/50 bg-background/75 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Why traders start here</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">A sharper first read on the market.</h2>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
                Built for futures first
              </div>
            </div>

            <FeatureRow
              icon={ChartColumnBig}
              title="Firm discovery with real context"
              copy="Compare payout cadence, drawdown style, challenge structures, and account size coverage without bouncing between review sites."
            />
            <FeatureRow
              icon={ShieldCheck}
              title="Risk-aware evaluation lens"
              copy="See the policies that matter operationally: trailing loss logic, evaluation shape, and practical funding constraints."
            />
            <FeatureRow
              icon={Sparkles}
              title="Performance review workflow"
              copy="Move from choosing a firm to reviewing your execution inside the same product language, instead of juggling disconnected tools."
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.8rem] border border-border/60 bg-card/55 p-6">
            <SectionEyebrow label="Featured firms" />
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Start with the firms traders are actually sizing up.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  This shortlist leans on account activity and payout traction so the first scan feels grounded, not random.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {featuredFirms.map((firm) => (
                <Link
                  key={firm.id}
                  href={`${localePrefix}/firm/${firm.slug}`}
                  className="group rounded-[1.4rem] border border-border/60 bg-background/70 p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-background"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{firm.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {firm.platform} • {firm.payoutModel}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
                      {firm.drawdownType}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MiniMetric label="Accounts" value={firm.catalogueStats.accountsCount.toLocaleString()} />
                    <MiniMetric label="Paid out" value={formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)} />
                    <MiniMetric label="Profit split" value={firm.profitSplit} />
                    <MiniMetric label="Allocation" value={firm.maxAllocation} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/60 bg-card/55 p-6">
            <SectionEyebrow label="Live discounts" />
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">The strongest deals right now.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Verified promos pulled from the same firm ecosystem, so your discovery and price check stay in sync.
            </p>

            <div className="mt-6 space-y-3">
              {liveDeals.length > 0 ? (
                liveDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`${localePrefix}/deals`}
                    className="group flex items-center justify-between gap-3 rounded-[1.2rem] border border-border/60 bg-background/75 p-4 transition-colors hover:bg-background"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{deal.firmName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {deal.category} • {deal.platform} • {deal.couponCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">{deal.discountPercent}% off</p>
                      <p className="text-xs text-muted-foreground">from {formatPrice(deal.challengeFee)}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
                  Live deals will appear here as soon as active promos are available.
                </div>
              )}
            </div>
          </div>
        </section>

        <PropFirmsExplorer locale={locale} firms={firms} />
      </main>
    </div>
  )
}

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </div>
  )
}

function StatTile({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-[1.3rem] border border-border/60 bg-background/70 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function FeatureRow({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof ChartColumnBig
  title: string
  copy: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/50 bg-card/65 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/80">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p>
        </div>
      </div>
    </div>
  )
}
