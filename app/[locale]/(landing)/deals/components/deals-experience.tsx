'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ArrowUpRight,
  BadgePercent,
  Banknote,
  Building2,
  ChevronDown,
  ChevronUp,
  Filter,
  Landmark,
  Search,
  SlidersHorizontal,
  Star,
  Wallet,
  X,
} from 'lucide-react'
import type {
  DealItem,
  DealsOverview,
  DealsSpotlightCollection,
  DrawdownType,
  FaqItem,
  MarketType,
  PayoutModel,
  TradingPlatform,
  UnifiedFirm,
} from '@/server/deals'

type SortKey =
  | 'name'
  | 'challengeFee'
  | 'profitSplit'
  | 'drawdownType'
  | 'payoutFrequency'
  | 'maxAllocation'
  | 'rating'
  | 'paidPayoutAmount'
  | 'accountsCount'

type SortDirection = 'asc' | 'desc'

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
const platformOptions: Array<'All' | TradingPlatform> = ['All', 'Tradovate', 'Rithmic', 'MetaTrader 5', 'cTrader', 'DXtrade']
const payoutOptions: Array<'All' | PayoutModel> = ['All', 'Bi-weekly', 'Weekly', 'On-demand', 'Monthly']
const drawdownOptions: Array<'All' | DrawdownType> = ['All', 'Trailing', 'Static', 'End-of-day']

function priceMatch(value: number, range: string): boolean {
  if (range === 'all') return true
  if (range === '0-99') return value <= 99
  if (range === '100-199') return value >= 100 && value <= 199
  return value >= 200
}

function splitToNumber(split: string): number {
  const parsed = Number(split.split('/')[0])
  return Number.isFinite(parsed) ? parsed : 0
}

function allocationToNumber(maxAllocation: string): number {
  const parsed = Number(maxAllocation.replace(/\$/g, '').replace(/K/gi, '000').replace(/M/gi, '000000').replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function getLowestChallengeFee(firm: UnifiedFirm): number | null {
  const fees = firm.coupons
    .map((coupon) => coupon.challengeFee)
    .filter((fee): fee is number => typeof fee === 'number' && Number.isFinite(fee))

  if (fees.length === 0) return null
  return Math.min(...fees)
}

function formatChallengeFee(fee: number | null): string {
  if (fee === null) return 'N/A'
  if (fee === 0) return 'Free'
  return `$${fee.toLocaleString()}`
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

function getActiveFilterCount(
  market: string,
  platform: string,
  payout: string,
  drawdown: string,
  priceRange: string,
  search: string,
): number {
  let count = 0
  if (market !== 'All') count++
  if (platform !== 'All') count++
  if (payout !== 'All') count++
  if (drawdown !== 'All') count++
  if (priceRange !== 'all') count++
  if (search.trim()) count++
  return count
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
  const [market, setMarket] = useState<'All' | MarketType>('All')
  const [platform, setPlatform] = useState<'All' | TradingPlatform>('All')
  const [payout, setPayout] = useState<'All' | PayoutModel>('All')
  const [drawdown, setDrawdown] = useState<'All' | DrawdownType>('All')
  const [priceRange, setPriceRange] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('paidPayoutAmount')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  const normalizedSearch = search.trim().toLowerCase()

  const activeFilterCount = getActiveFilterCount(market, platform, payout, drawdown, priceRange, search)

  const filteredDeals = useMemo(() => deals.filter((deal) => {
    const marketOk = market === 'All' || deal.category === market
    const platformOk = platform === 'All' || deal.platform === platform
    const payoutOk = payout === 'All' || deal.payoutModel === payout
    const drawdownOk = drawdown === 'All' || deal.drawdownType === drawdown
    const priceOk = priceMatch(deal.challengeFee, priceRange)
    const searchOk = !normalizedSearch || deal.firmName.toLowerCase().includes(normalizedSearch)
    return marketOk && platformOk && payoutOk && drawdownOk && priceOk && searchOk
  }), [deals, drawdown, market, normalizedSearch, payout, platform, priceRange])

  const filteredFirms = useMemo(() => {
    const base = firms.filter((firm) => {
      const marketOk = market === 'All' || firm.category === market
      const platformOk = platform === 'All' || firm.platform === platform
      const payoutOk = payout === 'All' || firm.payoutModel === payout
      const drawdownOk = drawdown === 'All' || firm.drawdownType === drawdown
      const lowestFee = getLowestChallengeFee(firm)
      const priceOk = priceRange === 'all' ? true : lowestFee !== null && priceMatch(lowestFee, priceRange)
      const searchOk = !normalizedSearch || firm.name.toLowerCase().includes(normalizedSearch) || (firm.shortDesc ?? '').toLowerCase().includes(normalizedSearch)
      return marketOk && platformOk && payoutOk && drawdownOk && priceOk && searchOk
    })

    return [...base].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name) * dir
        case 'challengeFee': {
          const feeA = getLowestChallengeFee(a) ?? Number.POSITIVE_INFINITY
          const feeB = getLowestChallengeFee(b) ?? Number.POSITIVE_INFINITY
          return (feeA - feeB) * dir
        }
        case 'profitSplit':
          return (splitToNumber(a.profitSplit) - splitToNumber(b.profitSplit)) * dir
        case 'drawdownType':
          return a.drawdownType.localeCompare(b.drawdownType) * dir
        case 'payoutFrequency':
          return a.payoutModel.localeCompare(b.payoutModel) * dir
        case 'maxAllocation':
          return (allocationToNumber(a.maxAllocation) - allocationToNumber(b.maxAllocation)) * dir
        case 'accountsCount':
          return (a.catalogueStats.accountsCount - b.catalogueStats.accountsCount) * dir
        case 'paidPayoutAmount':
          return (a.catalogueStats.paidPayoutAmount - b.catalogueStats.paidPayoutAmount) * dir
        case 'rating':
        default:
          return (a._count.reviews - b._count.reviews) * dir
      }
    })
  }, [drawdown, firms, market, normalizedSearch, payout, platform, priceRange, sortDirection, sortKey])

  const onSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection('desc')
  }

  const clearFilters = () => {
    setSearch('')
    setMarket('All')
    setPlatform('All')
    setPayout('All')
    setDrawdown('All')
    setPriceRange('all')
  }

  return (
    <div className="min-h-screen bg-v2-bg-base">
      <section className="relative overflow-hidden border-b border-v2-border-subtle">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(var(--v2-accent)/0.08),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_hsl(var(--v2-accent)/0.05),_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-v2-text-secondary">
                <BadgePercent className="h-3.5 w-3.5 text-v2-accent" />
                Prop firm deals
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-v2-text-primary sm:text-5xl lg:text-6xl">
                Find the best
                <br />
                prop firm deals.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-v2-text-secondary sm:text-lg">
                Compare firms, track live discounts, and open company profiles with real account data and payout context.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#firm-board"
                  className="inline-flex items-center gap-2 rounded-full bg-v2-accent px-6 py-3 text-sm font-semibold text-v2-accent-foreground transition-all duration-v2-base hover:bg-v2-accent-hover hover:shadow-v2-glow"
                >
                  Browse Firms
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="#deal-board"
                  className="inline-flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-surface px-6 py-3 text-sm font-semibold text-v2-text-primary transition-all duration-v2-base hover:bg-v2-bg-hover hover:border-v2-border-strong"
                >
                  View Deals
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <StatCard label="Tracked firms" value={overview.totalTrackedFirms.toLocaleString()} icon={Building2} />
              <StatCard label="Live deals" value={overview.totalLiveDeals.toLocaleString()} icon={Wallet} />
              <StatCard label="Accounts" value={overview.totalAccounts.toLocaleString()} icon={Landmark} />
              <StatCard label="Paid out" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} icon={Banknote} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="space-y-12">
          {spotlights.futures.length > 0 || spotlights.cfd.length > 0 ? (
            <section className="space-y-4">
              <SectionHeader title="Featured spotlights" subtitle={`Futures and CFD coverage from PropFirmMatch · ${spotlights.updatedAt}`} />
              <div className="grid gap-3 sm:grid-cols-2">
                {[...spotlights.futures.slice(0, 1), ...spotlights.cfd.slice(0, 1)].map((item, index) => (
                  <a
                    key={`${item.slug}-${index}`}
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-v2-border-subtle bg-v2-bg-surface p-5 transition-all duration-v2-base hover:bg-v2-bg-hover hover:border-v2-border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-v2-text-primary">{item.name}</p>
                        <span className="rounded-full bg-v2-accent-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-v2-accent">
                          {item.category}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-v2-text-secondary">{item.promoText}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-v2-text-tertiary transition-colors group-hover:text-v2-accent" />
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader title="Filter & sort" subtitle="Narrow the market to match your criteria" className="mb-0" />
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 rounded-full border border-v2-border bg-v2-bg-surface px-3 py-1.5 text-xs font-medium text-v2-text-secondary transition-colors hover:bg-v2-bg-hover hover:text-v2-text-primary"
                  >
                    <X className="h-3 w-3" />
                    Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-surface px-4 py-2 text-sm font-medium text-v2-text-primary transition-all duration-v2-base hover:bg-v2-bg-hover"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {showFilters ? 'Hide filters' : 'Show filters'}
                  {activeFilterCount > 0 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-v2-accent text-[10px] font-bold text-v2-accent-foreground">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-v2-text-tertiary" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search firms, payout model, or description..."
                className="w-full rounded-2xl border border-v2-border bg-v2-bg-surface px-11 py-3.5 text-sm text-v2-text-primary outline-none transition-colors placeholder:text-v2-text-tertiary focus:border-v2-accent focus:ring-1 focus:ring-v2-accent/30"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-v2-text-tertiary transition-colors hover:text-v2-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            {showFilters ? (
              <div className="grid gap-4 rounded-2xl border border-v2-border-subtle bg-v2-bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3">
                <FilterPillGroup label="Market" value={market} onChange={setMarket} options={marketOptions} />
                <FilterPillGroup label="Platform" value={platform} onChange={setPlatform} options={platformOptions} />
                <FilterPillGroup label="Payout" value={payout} onChange={setPayout} options={payoutOptions} />
                <FilterPillGroup label="Drawdown" value={drawdown} onChange={setDrawdown} options={drawdownOptions} />
                <div className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-v2-text-tertiary">Price Range</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: '0-99', label: '$0–$99' },
                      { value: '100-199', label: '$100–$199' },
                      { value: '200+', label: '$200+' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPriceRange(option.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-v2-fast ${
                          priceRange === option.value
                            ? 'bg-v2-accent text-v2-accent-foreground shadow-v2-sm'
                            : 'border border-v2-border bg-v2-bg-elevated text-v2-text-secondary hover:bg-v2-bg-hover hover:text-v2-text-primary'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium uppercase tracking-wider text-v2-text-tertiary">Sort:</span>
              {([
                { key: 'paidPayoutAmount' as SortKey, label: 'Paid Out' },
                { key: 'accountsCount' as SortKey, label: 'Accounts' },
                { key: 'challengeFee' as SortKey, label: 'Entry Fee' },
                { key: 'profitSplit' as SortKey, label: 'Split' },
                { key: 'name' as SortKey, label: 'Name' },
                { key: 'rating' as SortKey, label: 'Reviews' },
              ]).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onSort(option.key)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-v2-fast ${
                    sortKey === option.key
                      ? 'bg-v2-accent/15 text-v2-accent border border-v2-accent/30'
                      : 'border border-v2-border-subtle bg-v2-bg-surface text-v2-text-secondary hover:bg-v2-bg-hover hover:text-v2-text-primary'
                  }`}
                >
                  {option.label}
                  {sortKey === option.key ? (
                    sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          {hadFetchError ? (
            <div className="rounded-2xl border border-v2-warning/30 bg-v2-warning/10 px-5 py-4 text-sm text-v2-warning">
              Some deal data is temporarily unavailable. The catalogue will refresh automatically.
            </div>
          ) : null}

          <section id="firm-board" className="space-y-6">
            <SectionHeader
              title="Firm board"
              subtitle="Company cards with real account data, payout context, and quick actions"
              badge={`${filteredFirms.length} firms`}
            />
            {filteredFirms.length === 0 ? (
              <EmptyState message="No firms match your filters." onClear={clearFilters} hasFilters={activeFilterCount > 0} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredFirms.map((firm, index) => (
                  <FirmCard key={firm.id} firm={firm} localePrefix={localePrefix} index={index} />
                ))}
              </div>
            )}
          </section>

          <section id="deal-board" className="space-y-6">
            <SectionHeader
              title="Live deals"
              subtitle="Active discounts and promotions from verified prop firms"
              badge={`${filteredDeals.length} deals`}
            />
            {filteredDeals.length === 0 ? (
              <EmptyState message="No matching deals right now." onClear={clearFilters} hasFilters={activeFilterCount > 0} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDeals.map((deal, index) => {
                  const firm = firms.find((candidate) => candidate.id === deal.firmId)
                  return <DealCard key={deal.id} deal={deal} firm={firm} localePrefix={localePrefix} index={index} />
                })}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <SectionHeader title="FAQ" subtitle="Everything you need to know about the deals board" />
            <div className="rounded-2xl border border-v2-border-subtle bg-v2-bg-surface">
              <Accordion type="single" collapsible className="divide-y divide-v2-border-subtle">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`} className="border-0 px-6">
                    <AccordionTrigger className="py-5 text-left text-sm font-medium text-v2-text-primary hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-v2-text-secondary">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <p className="text-xs text-v2-text-tertiary">
              Last updated: {lastUpdated ?? 'Unavailable'}
            </p>
          </section>
        </div>
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
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border border-v2-border-subtle bg-v2-bg-surface/80 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-v2-accent/10">
          <Icon className="h-4 w-4 text-v2-accent" />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-v2-text-tertiary">{label}</p>
          <p className="mt-0.5 text-lg font-bold text-v2-text-primary">{value}</p>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
  badge,
  className = '',
}: {
  title: string
  subtitle?: string
  badge?: string
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-v2-text-primary">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-v2-text-secondary">{subtitle}</p> : null}
      </div>
      {badge ? (
        <span className="rounded-full border border-v2-border bg-v2-bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-v2-text-secondary">
          {badge}
        </span>
      ) : null}
    </div>
  )
}

function EmptyState({
  message,
  onClear,
  hasFilters,
}: {
  message: string
  onClear: () => void
  hasFilters: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-v2-border-subtle bg-v2-bg-surface px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-v2-bg-elevated">
        <Filter className="h-5 w-5 text-v2-text-tertiary" />
      </div>
      <p className="text-base font-medium text-v2-text-primary">{message}</p>
      <p className="mt-1 text-sm text-v2-text-secondary">Adjust the filters or check again after the next catalogue refresh.</p>
      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-full border border-v2-border bg-v2-bg-elevated px-4 py-2 text-sm font-medium text-v2-text-primary transition-colors hover:bg-v2-bg-hover"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  )
}

function FirmCard({
  firm,
  localePrefix,
  index,
}: {
  firm: UnifiedFirm
  localePrefix: string
  index: number
}) {
  const lowestFee = getLowestChallengeFee(firm)
  const hasActiveDeal = firm.coupons.length > 0

  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-v2-border-subtle bg-v2-bg-surface transition-all duration-v2-base hover:border-v2-border hover:bg-v2-bg-hover hover:shadow-v2-lg"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-4 p-5 pb-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-v2-border bg-v2-bg-elevated text-sm font-bold text-v2-accent transition-colors group-hover:border-v2-accent/30">
          {firm.logoUrl ? (
            <img src={firm.logoUrl} alt={firm.name} className="h-8 w-8 rounded-lg object-contain" />
          ) : (
            firm.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`${localePrefix}/firm/${firm.slug}`}
              className="truncate text-base font-bold text-v2-text-primary transition-colors hover:text-v2-accent"
            >
              {firm.name}
            </Link>
            {hasActiveDeal ? (
              <span className="shrink-0 rounded-full bg-v2-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-v2-success">
                Deal
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-v2-text-tertiary">
            {firm.category} · {firm.platform}
          </p>
        </div>
        {firm._count.reviews > 0 ? (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-v2-bg-elevated px-2 py-1">
            <Star className="h-3 w-3 text-v2-accent" />
            <span className="text-xs font-semibold text-v2-text-primary">{firm._count.reviews}</span>
          </div>
        ) : null}
      </div>

      <div className="px-5 pt-3">
        <p className="line-clamp-2 text-sm leading-relaxed text-v2-text-secondary">
          {firm.shortDesc ?? firm.description ?? 'No editorial summary available yet.'}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 px-5">
        <MetricPill label="Entry" value={formatChallengeFee(lowestFee)} />
        <MetricPill label="Accounts" value={firm.catalogueStats.accountsCount.toLocaleString()} />
        <MetricPill label="Paid out" value={formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)} highlight />
        <MetricPill label="Allocation" value={firm.maxAllocation} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 px-5">
        <Tag>{firm.payoutModel}</Tag>
        <Tag>{firm.drawdownType}</Tag>
        <Tag>{firm.profitSplit} split</Tag>
      </div>

      <div className="mt-auto flex items-center gap-3 p-5 pt-4">
        <Link
          href={`${localePrefix}/firm/${firm.slug}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-v2-accent px-4 py-2.5 text-sm font-semibold text-v2-accent-foreground transition-all duration-v2-base hover:bg-v2-accent-hover hover:shadow-v2-sm"
        >
          View Profile
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        {firm.referralUrl ? (
          <a
            href={firm.referralUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-v2-border bg-v2-bg-elevated px-4 py-2.5 text-sm font-medium text-v2-text-primary transition-all duration-v2-base hover:bg-v2-bg-hover hover:border-v2-border-strong"
          >
            Site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </article>
  )
}

function DealCard({
  deal,
  firm,
  localePrefix,
  index,
}: {
  deal: DealItem
  firm: UnifiedFirm | undefined
  localePrefix: string
  index: number
}) {
  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-v2-border-subtle bg-v2-bg-surface transition-all duration-v2-base hover:border-v2-border hover:bg-v2-bg-hover hover:shadow-v2-lg"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-4 p-5 pb-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-v2-border bg-v2-bg-elevated text-sm font-bold text-v2-accent">
          {deal.firmName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`${localePrefix}/firm/${deal.firmSlug}`}
            className="text-sm font-bold text-v2-text-primary transition-colors hover:text-v2-accent"
          >
            {deal.firmName}
          </Link>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-v2-text-tertiary">
            {deal.category} · {deal.platform}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-v2-success/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-v2-success">
          Verified
        </span>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-bold tracking-tight text-v2-text-primary">
              {deal.discountPercent}%
              <span className="ml-1 text-lg font-medium text-v2-text-secondary">OFF</span>
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-v2-border bg-v2-bg-elevated px-3 py-1.5 text-sm">
              <span className="text-v2-text-tertiary">Code</span>
              <span className="font-mono text-sm font-semibold text-v2-accent">{deal.couponCode}</span>
            </div>
          </div>
          <span className="rounded-full border border-v2-border-subtle bg-v2-bg-elevated px-2.5 py-1 text-[10px] uppercase tracking-wider text-v2-text-tertiary">
            {deal.expiryDate}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 px-5">
        <MetricPill label="Fee" value={formatChallengeFee(deal.challengeFee)} />
        <MetricPill label="Payout" value={deal.payoutModel} />
        {firm ? (
          <>
            <MetricPill label="Accounts" value={firm.catalogueStats.accountsCount.toLocaleString()} />
            <MetricPill label="Paid out" value={formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)} highlight />
          </>
        ) : null}
      </div>

      <div className="mt-auto flex items-center gap-3 p-5 pt-4">
        <Link
          href={`${localePrefix}/firm/${deal.firmSlug}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-v2-border bg-v2-bg-elevated px-4 py-2.5 text-sm font-medium text-v2-text-primary transition-all duration-v2-base hover:bg-v2-bg-hover hover:border-v2-border-strong"
        >
          Profile
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        {deal.claimUrl ? (
          <a
            href={deal.claimUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-v2-accent px-4 py-2.5 text-sm font-semibold text-v2-accent-foreground transition-all duration-v2-base hover:bg-v2-accent-hover hover:shadow-v2-sm"
          >
            Claim Deal
            <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </article>
  )
}

function MetricPill({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-v2-border-subtle bg-v2-bg-elevated px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-v2-text-tertiary">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${highlight ? 'text-v2-success' : 'text-v2-text-primary'}`}>{value}</p>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-v2-border-subtle bg-v2-bg-elevated px-2.5 py-1 text-[11px] font-medium text-v2-text-secondary">
      {children}
    </span>
  )
}

function FilterPillGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: readonly T[]
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-v2-text-tertiary">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-v2-fast ${
              value === option
                ? 'bg-v2-accent text-v2-accent-foreground shadow-v2-sm'
                : 'border border-v2-border bg-v2-bg-elevated text-v2-text-secondary hover:bg-v2-bg-hover hover:text-v2-text-primary'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
