'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgePercent,
  Banknote,
  Building2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Flame,
  Search,
  Sparkles,
  Star,
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

const sortOptions: ReadonlyArray<{ key: SortKey; label: string }> = [
  { key: 'discount', label: 'Best discount' },
  { key: 'expiring', label: 'Expiring soon' },
  { key: 'price-low', label: 'Lowest price' },
  { key: 'price-high', label: 'Highest price' },
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

function buildFirmOptions(deals: DealItem[]): string[] {
  return ['All', ...Array.from(new Set(deals.map((deal) => deal.firmName))).sort((a, b) => a.localeCompare(b))]
}

function matchesDealFilters(
  deal: DealItem,
  filters: {
    selectedFirm: string
    selectedMarket: 'All' | MarketType
    selectedDiscount: string
    normalizedSearch: string
  }
): boolean {
  if (filters.selectedFirm !== 'All' && deal.firmName !== filters.selectedFirm) return false
  if (filters.selectedMarket !== 'All' && deal.category !== filters.selectedMarket) return false
  if (filters.selectedDiscount !== 'all' && deal.discountPercent < Number(filters.selectedDiscount)) return false
  if (!filters.normalizedSearch) return true

  const haystack = `${deal.firmName} ${deal.couponCode} ${deal.platform} ${deal.category}`.toLowerCase()
  return haystack.includes(filters.normalizedSearch)
}

function sortDeals(deals: DealItem[], sortKey: SortKey): DealItem[] {
  return [...deals].sort((a, b) => {
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
}

function partitionDeals(filteredDeals: DealItem[]) {
  const featuredDeals = filteredDeals.filter(isFeaturedDeal).slice(0, 4)
  const featuredDealIds = new Set(featuredDeals.map((deal) => deal.id))
  const expiringDeals = filteredDeals
    .filter((deal) => !featuredDealIds.has(deal.id) && isExpiringDeal(deal))
    .slice(0, 4)
  const highlightedDealIds = new Set([...featuredDeals, ...expiringDeals].map((deal) => deal.id))

  return {
    featuredDeals,
    expiringDeals,
    browseDeals: filteredDeals.filter((deal) => !highlightedDealIds.has(deal.id)),
  }
}

function getTopPayoutFirms(firms: UnifiedFirm[]): UnifiedFirm[] {
  return [...firms]
    .sort((a, b) => b.catalogueStats.paidPayoutAmount - a.catalogueStats.paidPayoutAmount)
    .slice(0, 3)
}

function getTopDiscountDeal(deals: DealItem[]): DealItem | null {
  return deals.length > 0 ? deals[0] : null
}

function getSpotlightDeals(deals: DealItem[]): DealItem[] {
  return sortDeals(deals, 'discount').slice(0, 8)
}

function EmptyDealsState({ localePrefix }: { localePrefix: string }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-[0_28px_90px_-64px_rgba(0,0,0,0.95)]">
          <BadgePercent className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">No live deals in the current snapshot</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            We are still tracking firms and pricing, but no active coupons surfaced in the current dataset.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`${localePrefix}/propfirms`} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
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
  const firmOptions = useMemo(() => buildFirmOptions(deals), [deals])

  const filteredDeals = useMemo(() => {
    const next = deals.filter((deal) =>
      matchesDealFilters(deal, {
        selectedFirm,
        selectedMarket,
        selectedDiscount,
        normalizedSearch,
      })
    )

    return sortDeals(next, sortKey)
  }, [deals, normalizedSearch, selectedDiscount, selectedFirm, selectedMarket, sortKey])

  const { featuredDeals, expiringDeals, browseDeals } = useMemo(
    () => partitionDeals(filteredDeals),
    [filteredDeals]
  )
  const topFirms = useMemo(() => getTopPayoutFirms(firms), [firms])

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  if (deals.length === 0 && !hadFetchError) {
    return <EmptyDealsState localePrefix={localePrefix} />
  }

  return (
    <DealsBoard
      locale={locale}
      localePrefix={localePrefix}
      search={search}
      selectedFirm={selectedFirm}
      selectedMarket={selectedMarket}
      selectedDiscount={selectedDiscount}
      sortKey={sortKey}
      copiedCode={copiedCode}
      onSearchChange={setSearch}
      onFirmChange={setSelectedFirm}
      onMarketChange={setSelectedMarket}
      onDiscountChange={setSelectedDiscount}
      onSortChange={setSortKey}
      onCopyCode={copyCode}
      firmOptions={firmOptions}
      topFirms={topFirms}
      featuredDeals={featuredDeals}
      expiringDeals={expiringDeals}
      browseDeals={browseDeals}
      filteredDeals={filteredDeals}
      faqs={faqs}
      overview={overview}
      spotlights={spotlights}
      hadFetchError={hadFetchError}
      lastUpdated={lastUpdated}
    />
  )
}

function DealsBoard({
  locale,
  localePrefix,
  search,
  selectedFirm,
  selectedMarket,
  selectedDiscount,
  sortKey,
  copiedCode,
  onSearchChange,
  onFirmChange,
  onMarketChange,
  onDiscountChange,
  onSortChange,
  onCopyCode,
  firmOptions,
  topFirms,
  featuredDeals,
  expiringDeals,
  browseDeals,
  filteredDeals,
  faqs,
  overview,
  spotlights,
  hadFetchError,
  lastUpdated,
}: {
  locale: string
  localePrefix: string
  search: string
  selectedFirm: string
  selectedMarket: 'All' | MarketType
  selectedDiscount: string
  sortKey: SortKey
  copiedCode: string | null
  onSearchChange: (value: string) => void
  onFirmChange: (value: string) => void
  onMarketChange: (value: 'All' | MarketType) => void
  onDiscountChange: (value: string) => void
  onSortChange: (value: SortKey) => void
  onCopyCode: (code: string) => void
  firmOptions: string[]
  topFirms: UnifiedFirm[]
  featuredDeals: DealItem[]
  expiringDeals: DealItem[]
  browseDeals: DealItem[]
  filteredDeals: DealItem[]
  faqs: FaqItem[]
  overview: DealsOverview
  spotlights: DealsSpotlightCollection
  hadFetchError: boolean
  lastUpdated: string | null
}) {
  const hasActiveFilters =
    search.trim().length > 0 ||
    selectedFirm !== 'All' ||
    selectedMarket !== 'All' ||
    selectedDiscount !== 'all' ||
    sortKey !== 'discount'
  const topDiscountDeal = getTopDiscountDeal(filteredDeals)
  const spotlightDeals = useMemo(() => getSpotlightDeals(filteredDeals), [filteredDeals])
  const expiringCount = filteredDeals.filter(isExpiringDeal).length

  const resetFilters = () => {
    onSearchChange('')
    onFirmChange('All')
    onMarketChange('All')
    onDiscountChange('all')
    onSortChange('discount')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <DealsHero localePrefix={localePrefix} overview={overview} />

        {spotlightDeals.length > 0 ? (
          <BiggestDealsCarousel
            locale={locale}
            deals={spotlightDeals}
            copiedCode={copiedCode}
            onCopyCode={onCopyCode}
          />
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          <InsightCard
            label="Best visible discount"
            value={topDiscountDeal ? `${topDiscountDeal.discountPercent}% off` : 'No current match'}
            helper={topDiscountDeal ? `${topDiscountDeal.firmName} • ${topDiscountDeal.couponCode}` : 'Widen filters to surface a current promo'}
          />
          <InsightCard
            label="Expiring soon"
            value={expiringCount.toString()}
            helper="Deals ending in the next two weeks inside the current board"
          />
          <InsightCard
            label="Current board"
            value={`${filteredDeals.length}`}
            helper={`Sorted by ${sortOptions.find((item) => item.key === sortKey)?.label.toLowerCase() ?? 'best discount'}`}
          />
        </section>

        <DealsFilterPanel
          localePrefix={localePrefix}
          search={search}
          selectedFirm={selectedFirm}
          selectedMarket={selectedMarket}
          selectedDiscount={selectedDiscount}
          sortKey={sortKey}
          onSearchChange={onSearchChange}
          onFirmChange={onFirmChange}
          onMarketChange={onMarketChange}
          onDiscountChange={onDiscountChange}
          onSortChange={onSortChange}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
          firmOptions={firmOptions}
          spotlights={spotlights}
          lastUpdated={lastUpdated}
          topFirms={topFirms}
        />

        <DealsContentSections
          locale={locale}
          featuredDeals={featuredDeals}
          expiringDeals={expiringDeals}
          browseDeals={browseDeals}
          filteredDeals={filteredDeals}
          copiedCode={copiedCode}
          onCopyCode={onCopyCode}
          faqs={faqs}
          hadFetchError={hadFetchError}
        />
      </div>
    </div>
  )
}

function BiggestDealsCarousel({
  locale,
  deals,
  copiedCode,
  onCopyCode,
}: {
  locale: string
  deals: DealItem[]
  copiedCode: string | null
  onCopyCode: (code: string) => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (deals.length === 0) return null

  const normalizedActiveIndex = activeIndex % deals.length
  const activeDeal = deals[normalizedActiveIndex]
  const previousDeal = deals[(normalizedActiveIndex - 1 + deals.length) % deals.length]
  const nextDeal = deals[(normalizedActiveIndex + 1) % deals.length]
  const claimHref = activeDeal.claimUrl || `/${locale}/firm/${activeDeal.firmSlug}`
  const isExternalClaim = Boolean(activeDeal.claimUrl)

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + deals.length) % deals.length)
  }

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % deals.length)
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-bg-0))] p-6 text-[hsl(var(--mk-text))] shadow-[0_38px_120px_-76px_rgba(0,0,0,0.95)] sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-24 bg-[hsl(var(--mk-bg-2))]" />
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[hsl(var(--mk-border)/0.65)]" />
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[hsl(var(--chart-3)/0.17)] blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[hsl(var(--chart-3)/0.12)] blur-3xl" />
      </div>

      <div className="relative flex items-center justify-between gap-3">
        <h2 className="text-[clamp(1.85rem,3.1vw,3rem)] font-semibold leading-tight tracking-tight text-[hsl(var(--mk-text))]">
          Today&apos;s Biggest &amp; Largest Deals!
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Show previous deal spotlight"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--chart-3))] transition-colors hover:bg-[hsl(var(--mk-surface))]"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Show next deal spotlight"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--chart-3))] transition-colors hover:bg-[hsl(var(--mk-surface))]"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="relative mt-7">
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center xl:flex">
          <BackgroundDealTeaser deal={previousDeal} align="left" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center xl:flex">
          <BackgroundDealTeaser deal={nextDeal} align="right" />
        </div>

        <div className="relative mx-auto max-w-5xl rounded-3xl border border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-bg-1)/0.96)] p-5 backdrop-blur-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--chart-3)/0.35)] bg-[hsl(var(--chart-3)/0.15)] text-[hsl(var(--chart-3))]">
                <Flame className="h-4 w-4" />
              </div>
              <div className="relative mt-5 h-32 w-32">
                <div className="absolute -inset-3 rounded-full bg-[hsl(var(--chart-3)/0.2)] blur-2xl" />
                <div className="absolute inset-0 rounded-full border border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-surface-muted))]" />
                <div className="absolute inset-3 rounded-full bg-[hsl(var(--mk-bg-0))]" />
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-tight text-[hsl(var(--mk-text))] sm:text-3xl">{activeDeal.firmName}</p>
              <p className="mt-1 text-sm text-[hsl(var(--mk-text-muted))]">
                {activeDeal.platform} • {activeDeal.category}
              </p>
              <div className="mt-3 flex items-center gap-1 text-[hsl(var(--chart-3))]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>

            <div className="hidden h-56 w-px bg-[hsl(var(--mk-border)/0.9)] lg:block" />

            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <p className="text-5xl font-semibold tracking-tight text-[hsl(var(--mk-text))] sm:text-7xl">{activeDeal.discountPercent}% Off</p>
              <p className="mt-3 max-w-xl text-base leading-7 text-[hsl(var(--mk-text-muted))]">
                Big savings inside: {activeDeal.discountPercent}% off on {activeDeal.firmName} accounts.
              </p>
              <button
                type="button"
                onClick={() => onCopyCode(activeDeal.couponCode)}
                className="mt-6 text-base font-semibold text-[hsl(var(--chart-3))] underline underline-offset-4 transition-colors hover:text-[hsl(var(--chart-3)/0.8)]"
              >
                {copiedCode === activeDeal.couponCode ? 'Code copied' : `Copy Code: ${activeDeal.couponCode}`}
              </button>
              {isExternalClaim ? (
                <a
                  href={claimHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex min-w-60 items-center justify-center rounded-full bg-[hsl(var(--chart-3))] px-8 py-3 text-lg font-semibold text-[hsl(var(--mk-bg-0))] transition hover:brightness-110"
                >
                  Get Deal
                </a>
              ) : (
                <Link
                  href={claimHref}
                  className="mt-6 inline-flex min-w-60 items-center justify-center rounded-full bg-[hsl(var(--chart-3))] px-8 py-3 text-lg font-semibold text-[hsl(var(--mk-bg-0))] transition hover:brightness-110"
                >
                  Get Deal
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-center gap-2">
        {deals.map((deal, index) => (
          <button
            key={deal.id}
            type="button"
            aria-label={`Show ${deal.firmName} spotlight`}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === normalizedActiveIndex ? 'w-9 bg-[hsl(var(--chart-3))]' : 'w-2.5 bg-[hsl(var(--mk-text-muted))] hover:bg-[hsl(var(--mk-text-muted)/0.7)]'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

function BackgroundDealTeaser({
  deal,
  align,
}: {
  deal: DealItem
  align: 'left' | 'right'
}) {
  return (
    <div
      className={`w-56 rounded-2xl border border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-bg-1)/0.85)] p-4 opacity-45 backdrop-blur-sm ${
        align === 'left' ? 'translate-x-[-30%]' : 'translate-x-[30%]'
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Deal preview</p>
      <p className="mt-3 text-lg font-semibold text-[hsl(var(--mk-text))]">{deal.firmName}</p>
      <p className="mt-1 text-3xl font-semibold text-[hsl(var(--mk-text))]">{deal.discountPercent}% Off</p>
      <p className="mt-1 text-xs text-[hsl(var(--mk-text-muted))]">{deal.platform}</p>
    </div>
  )
}

function DealsContentSections({
  locale,
  featuredDeals,
  expiringDeals,
  browseDeals,
  filteredDeals,
  copiedCode,
  onCopyCode,
  faqs,
  hadFetchError,
}: {
  locale: string
  featuredDeals: DealItem[]
  expiringDeals: DealItem[]
  browseDeals: DealItem[]
  filteredDeals: DealItem[]
  copiedCode: string | null
  onCopyCode: (code: string) => void
  faqs: FaqItem[]
  hadFetchError: boolean
}) {
  return (
    <>
      {featuredDeals.length > 0 ? (
        <DealsSection
          title="Featured deals"
          description="The strongest price drops in the live board right now."
          deals={featuredDeals}
          locale={locale}
          copiedCode={copiedCode}
          onCopyCode={onCopyCode}
        />
      ) : null}

      {expiringDeals.length > 0 ? (
        <DealsSection
          title="Closing soon"
          description="Promos with the shortest remaining runway."
          deals={expiringDeals}
          locale={locale}
          copiedCode={copiedCode}
          onCopyCode={onCopyCode}
        />
      ) : null}

      <BrowseDealsSection
        locale={locale}
        browseDeals={browseDeals}
        filteredDeals={filteredDeals}
        copiedCode={copiedCode}
        onCopyCode={onCopyCode}
      />

      {faqs.length > 0 ? <DealsFaqSection faqs={faqs} localePrefix={`/${locale}`} /> : null}

      {hadFetchError ? (
        <p className="text-sm text-amber-500">
          Some deal data could not be refreshed fully. The page is showing the best available snapshot.
        </p>
      ) : null}
    </>
  )
}

function BrowseDealsSection({
  locale,
  browseDeals,
  filteredDeals,
  copiedCode,
  onCopyCode,
}: {
  locale: string
  browseDeals: DealItem[]
  filteredDeals: DealItem[]
  copiedCode: string | null
  onCopyCode: (code: string) => void
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Browse all live deals</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">The active board</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {browseDeals.length} remaining result{browseDeals.length === 1 ? '' : 's'}
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
              onCopyCode={onCopyCode}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {filteredDeals.length === 0
            ? 'No deals match the current filter stack. Try widening the firm or market selection.'
            : 'All matching deals are already highlighted above.'}
        </div>
      )}
    </section>
  )
}

function DealsFaqSection({ faqs, localePrefix }: { faqs: FaqItem[]; localePrefix: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">FAQ</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Questions traders usually ask before checkout</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            These answers cover verification, timing, and risk-fit so you can make the next move with less guesswork.
          </p>
        </div>
        <Link
          href={`${localePrefix}/deals/faq`}
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-input"
        >
          Open full FAQ
        </Link>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {faqs.slice(0, 6).map((faq) => (
          <div key={faq.question} className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">{faq.question}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function DealsHero({
  localePrefix,
  overview,
}: {
  localePrefix: string
  overview: DealsOverview
}) {
  return (
    <section className="grid gap-6 rounded-3xl border border-border bg-card p-5 shadow-[0_34px_110px_-72px_rgba(0,0,0,0.95)] lg:grid-cols-[1.1fr_0.9fr] lg:p-7">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Verified prop firm discounts
        </div>
        <h1 className="mt-5 text-[clamp(2.4rem,6vw,5.2rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-foreground">
          Open current promos without losing the firm context.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          Browse active challenge discounts, compare pricing by market and firm, and move straight into the firm record when you want more context.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`${localePrefix}/propfirms`} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
            Compare firms
          </Link>
          <Link href={`${localePrefix}/deals/compare`} className="rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground">
            Compare pricing
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
  )
}

function DealsFilterPanel({
  localePrefix,
  search,
  selectedFirm,
  selectedMarket,
  selectedDiscount,
  sortKey,
  onSearchChange,
  onFirmChange,
  onMarketChange,
  onDiscountChange,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
  firmOptions,
  spotlights,
  lastUpdated,
  topFirms,
}: {
  localePrefix: string
  search: string
  selectedFirm: string
  selectedMarket: 'All' | MarketType
  selectedDiscount: string
  sortKey: SortKey
  onSearchChange: (value: string) => void
  onFirmChange: (value: string) => void
  onMarketChange: (value: 'All' | MarketType) => void
  onDiscountChange: (value: string) => void
  onSortChange: (value: SortKey) => void
  onResetFilters: () => void
  hasActiveFilters: boolean
  firmOptions: string[]
  spotlights: DealsSpotlightCollection
  lastUpdated: string | null
  topFirms: UnifiedFirm[]
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by firm, coupon, or platform..."
              className="h-11 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <SelectLike value={selectedFirm} onChange={onFirmChange} options={firmOptions} />
            <SelectLike value={selectedMarket} onChange={(value) => onMarketChange(value as 'All' | MarketType)} options={marketOptions} />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {discountOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onDiscountChange(option.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedDiscount === option.value
                    ? 'border-foreground/15 bg-foreground text-background'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onSortChange(item.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortKey === item.key
                    ? 'border-foreground/15 bg-foreground text-background'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span>The deal board is narrowed right now. Reset to return to the full live tape.</span>
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-input"
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Board snapshot</p>
        <div className="mt-4 space-y-3">
          <RadarRow label="Futures coverage" value={`${spotlights.futures.length} spotlights`} />
          <RadarRow label="CFD coverage" value={`${spotlights.cfd.length} spotlights`} />
          <RadarRow label="Last refreshed" value={lastUpdated ?? spotlights.updatedAt} />
        </div>
        <div className="mt-5 rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top payout firms</p>
          <div className="mt-3 space-y-2">
            {topFirms.map((firm) => (
              <Link
                key={firm.id}
                href={`${localePrefix}/firm/${firm.slug}`}
                className="flex items-center justify-between rounded-xl border border-border bg-input px-3 py-2 text-sm transition-colors hover:bg-card"
              >
                <span className="font-medium text-foreground">{firm.name}</span>
                <span className="text-muted-foreground">{formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Need policy context?</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">The FAQ covers verification, timing, and risk-fit questions.</p>
          </div>
          <Link
            href={`${localePrefix}/deals/faq`}
            className="shrink-0 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-input"
          >
            FAQ
          </Link>
        </div>
      </div>
    </section>
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
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] sm:p-6">
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
  const claimHref = deal.claimUrl || `/${locale}/firm/${deal.firmSlug}`
  const isExternalClaim = Boolean(deal.claimUrl)

  return (
    <div className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/15">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center rounded-full border border-border bg-input px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {deal.category}
          </div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{deal.firmName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {deal.platform} • {deal.payoutModel}
          </p>
        </div>
        <div className="rounded-2xl border border-success/30 bg-success/10 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Discount</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{deal.discountPercent}%</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatPill label="Challenge fee" value={formatPrice(deal.challengeFee)} />
        <StatPill label="Drawdown" value={deal.drawdownType} />
        <StatPill label="Coupon" value={deal.couponCode} />
        <StatPill label="Expiry" value={daysLeft === null ? 'No expiry' : daysLeft === 0 ? 'Ends today' : `${daysLeft}d left`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCopyCode(deal.couponCode)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-input px-4 py-2 text-sm font-medium text-foreground"
        >
          <Copy className="h-4 w-4" />
          {copiedCode === deal.couponCode ? 'Copied' : 'Copy code'}
        </button>
        <Link
          href={`/${locale}/firm/${deal.firmSlug}`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-input px-4 py-2 text-sm font-medium text-foreground"
        >
          View firm
        </Link>
        {isExternalClaim ? (
          <a
            href={claimHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Claim deal
            <ArrowRight className="h-4 w-4" />
          </a>
        ) : (
          <Link
            href={claimHref}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Claim deal
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
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
    <div className="rounded-2xl border border-border bg-card p-4">
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
    <div className="rounded-xl border border-border bg-input p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function RadarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function InsightCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_18px_80px_-65px_rgba(0,0,0,0.95)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
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
      className="h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
