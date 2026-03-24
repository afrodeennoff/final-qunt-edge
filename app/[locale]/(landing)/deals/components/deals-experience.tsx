'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgePercent,
  Banknote,
  Building2,
  Copy,
  Search,
  Sparkles,
  Wallet,
} from 'lucide-react'
import type {
  DealItem,
  DealsOverview,
  DealsSpotlightCollection,
  FaqItem,
  MarketType,
  UnifiedFirm,
} from '@/server/deals'
import { formatCompactCurrency } from '@/lib/formatting/currency'

type SortKey = 'discount' | 'price-low' | 'price-high' | 'expiring'

interface Props {
  locale: string
  deals: DealItem[]
  firms: UnifiedFirm[]
  faqs: FaqItem[]
  overview: DealsOverview
  spotlights: DealsSpotlightCollection
  hadFetchError: boolean
  lastUpdated: string | null
}

const marketOptions: Array<'All' | MarketType> = ['All', 'Futures', 'Forex', 'Crypto']
const discountOptions = [
  { value: 'all', label: 'All discounts' },
  { value: '10', label: '10%+' },
  { value: '20', label: '20%+' },
  { value: '30', label: '30%+' },
]

function formatPrice(value: number): string {
  if (value <= 0) return 'Free'
  return `$${value.toLocaleString()}`
}

function getDaysLeft(expiryDate: string): number | null {
  if (expiryDate === 'No expiry') return null
  const diff = new Date(expiryDate).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

function isFeaturedDeal(deal: DealItem): boolean {
  return deal.discountPercent >= 25
}

function isExpiringDeal(deal: DealItem): boolean {
  const daysLeft = getDaysLeft(deal.expiryDate)
  return daysLeft !== null && daysLeft <= 14
}

export function DealsExperience({
  locale,
  deals,
  firms,
  faqs,
  overview,
  spotlights,
  hadFetchError,
  lastUpdated,
}: Props) {
  const localePrefix = `/${locale}`
  const [search, setSearch] = useState('')
  const [selectedFirm, setSelectedFirm] = useState('All')
  const [selectedMarket, setSelectedMarket] = useState<'All' | MarketType>('All')
  const [selectedDiscount, setSelectedDiscount] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('discount')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const normalizedSearch = search.trim().toLowerCase()
  const firmOptions = useMemo(() => ['All', ...new Set(deals.map((deal) => deal.firmName))], [deals])

  const filteredDeals = useMemo(() => {
    const next = deals.filter((deal) => {
      if (selectedFirm !== 'All' && deal.firmName !== selectedFirm) return false
      if (selectedMarket !== 'All' && deal.category !== selectedMarket) return false
      if (selectedDiscount !== 'all' && deal.discountPercent < Number(selectedDiscount)) return false
      if (normalizedSearch) {
        const haystack = `${deal.firmName} ${deal.couponCode} ${deal.platform} ${deal.category}`.toLowerCase()
        if (!haystack.includes(normalizedSearch)) return false
      }
      return true
    })

    return next.sort((a, b) => {
      if (sortKey === 'price-low') return a.challengeFee - b.challengeFee
      if (sortKey === 'price-high') return b.challengeFee - a.challengeFee
      if (sortKey === 'expiring') {
        const aDays = getDaysLeft(a.expiryDate)
        const bDays = getDaysLeft(b.expiryDate)
        if (aDays === null) return 1
        if (bDays === null) return -1
        return aDays - bDays
      }
      return b.discountPercent - a.discountPercent
    })
  }, [deals, normalizedSearch, selectedDiscount, selectedFirm, selectedMarket, sortKey])

  const featuredDeals = filteredDeals.filter(isFeaturedDeal).slice(0, 4)
  const featuredDealIds = new Set(featuredDeals.map((deal) => deal.id))
  const expiringDeals = filteredDeals
    .filter((deal) => !featuredDealIds.has(deal.id) && isExpiringDeal(deal))
    .slice(0, 4)
  const highlightedDealIds = new Set([...featuredDeals, ...expiringDeals].map((deal) => deal.id))
  const browseDeals = filteredDeals.filter((deal) => !highlightedDealIds.has(deal.id))
  const topFirms = [...firms]
    .sort((a, b) => b.catalogueStats.paidPayoutAmount - a.catalogueStats.paidPayoutAmount)
    .slice(0, 3)

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  if (deals.length === 0 && !hadFetchError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-border/60 bg-card/55 p-8 text-center">
            <BadgePercent className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">No live deals right now</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              We are still tracking firms and pricing, but there are no active coupons in the dataset at the moment.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={`${localePrefix}/propfirms`} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                Explore firms
              </Link>
              <Link href={localePrefix} className="rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground">
                Back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-6 rounded-[2rem] border border-border/60 bg-card/50 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Verified prop firm discounts
            </div>
            <h1 className="mt-5 text-[clamp(2.4rem,6vw,5.2rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-foreground">
              Deals that are worth opening right now.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Browse active challenge discounts, filter by market and firm, and move from pricing to firm research without leaving the same board.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`${localePrefix}/propfirms`} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                Compare firms
              </Link>
              <Link href={`${localePrefix}/deals/compare`} className="rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-medium text-foreground">
                Compare deal economics
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Live deals" value={overview.totalLiveDeals.toString()} icon={BadgePercent} />
            <StatCard label="Tracked firms" value={overview.totalTrackedFirms.toString()} icon={Building2} />
            <StatCard label="Account value" value={formatCompactCurrency(overview.totalAccountValue)} icon={Wallet} />
            <StatCard label="Paid payouts" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} icon={Banknote} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by firm, coupon, or platform..."
                  className="h-12 w-full rounded-2xl border border-border/70 bg-background/80 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <SelectLike value={selectedFirm} onChange={setSelectedFirm} options={firmOptions} />
                <SelectLike value={selectedMarket} onChange={(value) => setSelectedMarket(value as 'All' | MarketType)} options={marketOptions} />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {discountOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedDiscount(option.value)}
                    className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                      selectedDiscount === option.value
                        ? 'border-foreground/15 bg-foreground text-background'
                        : 'border-border bg-background/70 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'discount', label: 'Best discount' },
                  { key: 'expiring', label: 'Expiring soon' },
                  { key: 'price-low', label: 'Lowest price' },
                  { key: 'price-high', label: 'Highest price' },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSortKey(item.key)}
                    className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                      sortKey === item.key
                        ? 'border-foreground/15 bg-foreground text-background'
                        : 'border-border bg-background/70 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Editorial radar</p>
            <div className="mt-4 space-y-3">
              <RadarRow label="Market coverage" value={`${spotlights.futures.length} futures spotlights`} />
              <RadarRow label="CFD spotlights" value={`${spotlights.cfd.length} tracked firms`} />
              <RadarRow label="Source updated" value={lastUpdated ?? spotlights.updatedAt} />
            </div>
            <div className="mt-5 rounded-[1.2rem] border border-border/60 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top payout firms</p>
              <div className="mt-3 space-y-2">
                {topFirms.map((firm) => (
                  <Link key={firm.id} href={`${localePrefix}/firm/${firm.slug}`} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/70 px-3 py-2 text-sm transition-colors hover:bg-card">
                    <span className="font-medium text-foreground">{firm.name}</span>
                    <span className="text-muted-foreground">{formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {featuredDeals.length > 0 ? (
          <DealsSection
            title="Featured deals"
            description="The strongest price drops in the live board right now."
            deals={featuredDeals}
            locale={locale}
            copiedCode={copiedCode}
            onCopyCode={copyCode}
          />
        ) : null}

        {expiringDeals.length > 0 ? (
          <DealsSection
            title="Closing soon"
            description="Promos with the shortest remaining runway."
            deals={expiringDeals}
            locale={locale}
            copiedCode={copiedCode}
            onCopyCode={copyCode}
          />
        ) : null}

        <section className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Browse all live deals</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">The active board</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {browseDeals.length} result{browseDeals.length === 1 ? '' : 's'}
            </p>
          </div>

          {browseDeals.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {browseDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  locale={locale}
                  copiedCode={copiedCode}
                  onCopyCode={copyCode}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.4rem] border border-dashed border-border bg-background/70 p-8 text-center text-sm text-muted-foreground">
              {filteredDeals.length === 0
                ? 'No deals match the current filter stack. Try widening the firm or market selection.'
                : 'All matching deals are already highlighted above.'}
            </div>
          )}
        </section>

        {faqs.length > 0 ? (
          <section className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">FAQ</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">What traders usually ask before they click through</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {faqs.slice(0, 6).map((faq) => (
                <div key={faq.question} className="rounded-[1.3rem] border border-border/60 bg-background/70 p-4">
                  <h3 className="text-sm font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {hadFetchError ? (
          <p className="text-sm text-amber-500">
            Some deal data could not be refreshed fully. The page is showing the best available snapshot.
          </p>
        ) : null}
      </div>
    </div>
  )
}

function DealsSection({
  title,
  description,
  deals,
  locale,
  copiedCode,
  onCopyCode,
}: {
  title: string
  description: string
  deals: DealItem[]
  locale: string
  copiedCode: string | null
  onCopyCode: (code: string) => void
}) {
  return (
    <section className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} locale={locale} copiedCode={copiedCode} onCopyCode={onCopyCode} />
        ))}
      </div>
    </section>
  )
}

function DealCard({
  deal,
  locale,
  copiedCode,
  onCopyCode,
}: {
  deal: DealItem
  locale: string
  copiedCode: string | null
  onCopyCode: (code: string) => void
}) {
  const daysLeft = getDaysLeft(deal.expiryDate)

  return (
    <div className="rounded-[1.4rem] border border-border/60 bg-background/75 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center rounded-full border border-border/60 bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {deal.category}
          </div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{deal.firmName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {deal.platform} • {deal.payoutModel}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Discount</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{deal.discountPercent}%</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatPill label="Challenge fee" value={formatPrice(deal.challengeFee)} />
        <StatPill label="Drawdown" value={deal.drawdownType} />
        <StatPill label="Coupon" value={deal.couponCode} />
        <StatPill label="Expiry" value={daysLeft === null ? 'No expiry' : `${daysLeft}d left`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCopyCode(deal.couponCode)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
        >
          <Copy className="h-4 w-4" />
          {copiedCode === deal.couponCode ? 'Copied' : 'Copy code'}
        </button>
        <Link
          href={`/${locale}/firm/${deal.firmSlug}`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
        >
          View firm
        </Link>
        <Link
          href={deal.claimUrl || `/${locale}/firm/${deal.firmSlug}`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Claim deal
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Wallet
}) {
  return (
    <div className="rounded-[1.3rem] border border-border/60 bg-background/75 p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-border/60 bg-card/65 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function RadarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1rem] border border-border/60 bg-background/70 px-3 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function SelectLike<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: readonly T[] | T[]
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm text-foreground outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
