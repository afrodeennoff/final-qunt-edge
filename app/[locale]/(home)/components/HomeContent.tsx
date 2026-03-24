import Link from 'next/link'
import {
  ArrowRight,
  BadgePercent,
  BookOpenText,
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

export default function HomeContent({ locale, firms, deals, overview }: HomeContentProps) {
  const localePrefix = `/${locale}`

  const leadingFirms = [...firms]
    .sort((a, b) => {
      if (b.catalogueStats.paidPayoutAmount !== a.catalogueStats.paidPayoutAmount) {
        return b.catalogueStats.paidPayoutAmount - a.catalogueStats.paidPayoutAmount
      }
      return b.catalogueStats.accountsCount - a.catalogueStats.accountsCount
    })
    .slice(0, 3)

  const leadingDeals = [...deals]
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 4)

  return (
    <div className="relative overflow-x-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_18%,hsl(var(--background))_100%)] selection:bg-[hsl(var(--primary)/0.3)] selection:text-primary-foreground [--home-display:var(--font-geist)] [--home-copy:var(--font-manrope)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(65%_55%_at_50%_0%,hsl(var(--foreground)/0.10),transparent_72%)]" />
        <div className="absolute left-[-10%] top-[18rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.10),transparent_68%)] blur-3xl" />
        <div className="absolute right-[-8%] top-[8rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,hsl(var(--foreground)/0.06),transparent_70%)] blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-[1420px] flex-col gap-12 px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:gap-14 lg:pb-24 lg:pt-12">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2.25rem] border border-border/60 bg-card/50 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Qunt Edge for prop traders
            </div>

            <div className="mt-6 max-w-4xl">
              <h1 className="text-[clamp(2.9rem,8vw,6.6rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-foreground [font-family:var(--home-display)]">
                A sharper home base
                <span className="block text-muted-foreground">for picking firms and reviewing performance.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Compare prop firms, spot live discounts, and move into trader-grade review with a homepage built more like a control room than a generic landing page.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`${localePrefix}/propfirms`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Explore firms
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`${localePrefix}/deals`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                See live deals
                <BadgePercent className="h-4 w-4" />
              </Link>
              <Link
                href={`${localePrefix}/leaderboard`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Open leaderboard
                <Trophy className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <PulseTile label="Tracked Firms" value={overview.totalTrackedFirms.toString()} helper="Comparison-ready catalogue" />
              <PulseTile label="Active Deals" value={overview.totalLiveDeals.toString()} helper="Verified promos in the board" />
              <PulseTile label="Paid Payouts" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} helper={`${overview.totalPaidPayoutCount.toLocaleString()} payout events tracked`} />
            </div>
          </div>

          <div className="grid gap-4">
            <Panel
              eyebrow="Workflow"
              title="One homepage, three jobs"
              copy="Research the firm, validate the deal, and keep the review mindset attached from the first click."
              icon={Radar}
            />
            <Panel
              eyebrow="Filtering"
              title="Built for decision speed"
              copy="Use the explorer below to narrow by platform, challenge structure, and drawdown logic before you go deeper."
              icon={ShieldCheck}
            />
            <Panel
              eyebrow="Review mode"
              title="Not just a comparison site"
              copy="The page speaks the same language as the performance tools, so discovery and execution review feel connected."
              icon={BookOpenText}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-border/60 bg-card/45 p-6">
            <SectionLabel label="Signals" />
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Where traders are leaning right now.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              A quick read on the firms showing the strongest payout traction and live-account activity across the current dataset.
            </p>

            <div className="mt-6 space-y-3">
              {leadingFirms.map((firm, index) => (
                <Link
                  key={firm.id}
                  href={`${localePrefix}/firm/${firm.slug}`}
                  className="group flex items-center justify-between rounded-[1.3rem] border border-border/60 bg-background/75 px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-foreground/15"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card text-sm font-semibold text-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{firm.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {firm.platform} • {firm.payoutModel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)}</p>
                    <p className="text-xs text-muted-foreground">{firm.catalogueStats.accountsCount.toLocaleString()} tracked accounts</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card/45 p-6">
            <SectionLabel label="Live Deal Tape" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">Strong discounts worth checking.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  A fresh tape of the best live promos so pricing context is visible before you dive into firm detail.
                </p>
              </div>
              <Link href={`${localePrefix}/deals`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Open deals board
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {leadingDeals.length > 0 ? (
                leadingDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`${localePrefix}/deals`}
                    className="group rounded-[1.35rem] border border-border/60 bg-background/75 p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/15"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{deal.firmName}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {deal.category} • {deal.platform}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-card px-3 py-2 text-right">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Off</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{deal.discountPercent}%</p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <MiniMetric label="Coupon" value={deal.couponCode} />
                      <MiniMetric label="Challenge fee" value={formatPrice(deal.challengeFee)} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground md:col-span-2">
                  Live deal highlights will appear here when active offers are available.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-border/60 bg-card/45 p-6">
            <SectionLabel label="How It Works" />
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">A cleaner path from first scan to deeper conviction.</h2>
            <div className="mt-6 space-y-4">
              <JourneyStep
                index="01"
                title="Scan the board"
                copy="Start with the home signals, shortlist firms, and let the market pulse guide where you spend more attention."
              />
              <JourneyStep
                index="02"
                title="Stress-test the setup"
                copy="Use the explorer to narrow by platform, challenge structure, and drawdown model instead of reading generic summaries."
              />
              <JourneyStep
                index="03"
                title="Carry that context forward"
                copy="Move into deals, firm detail, and review workflows without losing the logic behind why you chose a firm."
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card/45 p-6">
            <SectionLabel label="Explorer" />
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Search the firm field with a fresh board layout.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              This is the hands-on section of the homepage: less brochure, more decision surface.
            </p>
            <div className="mt-6">
              <PropFirmsExplorer locale={locale} firms={firms} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-border/60 bg-card/45 p-6">
            <SectionLabel label="Confidence Layer" />
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Keep the same logic from discovery to due diligence.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <PulseTile label="Live accounts" value={overview.totalAccounts.toLocaleString()} helper="Real tracked trader accounts" />
              <PulseTile label="Account value" value={formatCompactCurrency(overview.totalAccountValue)} helper="Capital represented in the dataset" />
              <PulseTile label="Firm detail" value={firms.length > 0 ? 'Ready' : 'Pending'} helper="Research pages connect to the same data surface" />
            </div>
            <div className="mt-6 rounded-[1.3rem] border border-border/60 bg-background/70 p-5 text-sm leading-7 text-muted-foreground">
              The point of the homepage is not to win a design contest. It should help you narrow the field fast, preserve context, and send you into deals and firm pages without repeating the same discovery work twice.
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card/45 p-6">
            <SectionLabel label="Next Move" />
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Pick the surface that matches what you need right now.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <CrossLinkCard
                href={`${localePrefix}/propfirms`}
                title="Compare firms"
                copy="Open the full catalogue for broader payout, value, and account-board comparison."
                icon={ShieldCheck}
              />
              <CrossLinkCard
                href={`${localePrefix}/deals`}
                title="Check active deals"
                copy="Move straight into current offers when pricing is the deciding factor."
                icon={BadgePercent}
              />
              <CrossLinkCard
                href={`${localePrefix}/leaderboard`}
                title="Review trader results"
                copy="See how public traders are actually performing before you trust the marketing."
                icon={TrendingUp}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </div>
  )
}

function PulseTile({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/60 bg-background/70 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

function Panel({
  eyebrow,
  title,
  copy,
  icon: Icon,
}: {
  eyebrow: string
  title: string
  copy: string
  icon: typeof TrendingUp
}) {
  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-card/55 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-background/75">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-border/60 bg-card/60 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function JourneyStep({
  index,
  title,
  copy,
}: {
  index: string
  title: string
  copy: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/60 bg-background/70 p-4">
      <div className="flex items-start gap-4">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{index}</div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
        </div>
      </div>
    </div>
  )
}

function CrossLinkCard({
  href,
  title,
  copy,
  icon: Icon,
}: {
  href: string
  title: string
  copy: string
  icon: typeof ShieldCheck
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.35rem] border border-border/60 bg-background/75 p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/15"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground">
        Open
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}
