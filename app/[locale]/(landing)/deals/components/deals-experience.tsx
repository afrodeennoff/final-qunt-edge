'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type {
  DealItem,
  DealsOverview,
  DealsSpotlightCollection,
  FaqItem,
  MarketType,
  UnifiedFirm,
} from '@/server/deals'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { EvalCostCalculator } from '../calculator/components/eval-cost-calculator'
import { FirmComparisonGrid } from '../compare/components/firm-comparison-grid'
import { GuideLibrary } from '../guides/components/guide-library'

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

const TABS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'deals-board', label: 'Deals Board' },
  { id: 'matchup', label: 'Matchup' },
  { id: 'cost-planner', label: 'Cost Planner' },
  { id: 'playbooks', label: 'Playbooks' },
  { id: 'help', label: 'Help' },
]

const DEALS_SPOTLIGHT_AUTO_SLIDE_MS = 5000

const faqFallbackItems: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: 'What is Qunt Edge Deals?',
    answer:
      'Qunt Edge Deals is a curated deals surface for futures prop firms. It helps you spot active promos quickly, then move into deeper analysis before you commit to a challenge.',
  },
  {
    question: 'Are these offers maintained in real time?',
    answer:
      'Offers are reviewed frequently and refreshed when terms change. Because firms can update campaigns without notice, always confirm the final checkout details before purchase.',
  },
  {
    question: 'Does Qunt Edge guarantee a discount will still be active?',
    answer:
      'No. We track and surface deals, but final eligibility is controlled by each prop firm. If an offer expires, use the matchup and cost-planning tools to evaluate the next best option.',
  },
  {
    question: 'How should I choose between deals?',
    answer:
      'Start with your risk model and payout timeline, not just the biggest headline discount. Fees, drawdown mechanics, and reset costs can matter more than the first promo percentage.',
  },
  {
    question: 'Where can I ask a question that is not listed here?',
    answer:
      'You can reach Qunt Edge support from the support page. Include the firm name and the offer you saw so we can help you verify the best current path.',
  },
]

function DealsTabBar({
  activeTab,
  onTabClick,
}: {
  activeTab: string
  onTabClick: (id: string) => void
}) {
  return (
    <nav className="sticky top-[68px] z-40 bg-[hsl(var(--background)/0.82)]">
      <div className="mx-auto max-w-[1360px] overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="my-2 flex gap-1.5 overflow-x-auto overflow-y-hidden rounded-full bg-[hsl(var(--mk-surface)/0.82)] p-1.5 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabClick(tab.id)}
              className={`relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-5 ${
                activeTab === tab.id
                  ? 'bg-[hsl(var(--mk-surface-muted)/0.95)] text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.22),0_12px_24px_-18px_hsl(var(--primary)/0.55)]'
                  : 'text-muted-foreground hover:bg-[hsl(var(--mk-surface-muted)/0.72)] hover:text-foreground/95'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

function hasActiveDealFilters(
  search: string,
  selectedFirm: string,
  selectedMarket: 'All' | MarketType,
  selectedDiscount: string,
  sortKey: SortKey,
): boolean {
  return (
    search.trim().length > 0 ||
    selectedFirm !== 'All' ||
    selectedMarket !== 'All' ||
    selectedDiscount !== 'all' ||
    sortKey !== 'discount'
  )
}

function formatPrice(value: number): string {
  if (value <= 0) return 'Free'
  return `$${value.toLocaleString()}`
}

function normalizeFirmSlug(slug: string | null | undefined): string | null {
  const normalized = slug?.trim()
  return normalized && normalized.length > 0 ? normalized : null
}

function getFirmHref(locale: string, slug: string | null | undefined): string {
  const normalizedSlug = normalizeFirmSlug(slug)
  return normalizedSlug ? `/${locale}/firm/${normalizedSlug}` : `/${locale}/propfirms`
}

function getFirmHrefFromPrefix(localePrefix: string, slug: string | null | undefined): string {
  const normalizedSlug = normalizeFirmSlug(slug)
  return normalizedSlug ? `${localePrefix}/firm/${normalizedSlug}` : `${localePrefix}/propfirms`
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
      firms={firms}
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
  firms,
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
  firms: UnifiedFirm[]
  overview: DealsOverview
  spotlights: DealsSpotlightCollection
  hadFetchError: boolean
  lastUpdated: string | null
}) {
  const hasActiveFilters = hasActiveDealFilters(search, selectedFirm, selectedMarket, selectedDiscount, sortKey)
  const topDiscountDeal = getTopDiscountDeal(filteredDeals)
  const spotlightDeals = useMemo(() => getSpotlightDeals(filteredDeals), [filteredDeals])
  const expiringCount = filteredDeals.filter(isExpiringDeal).length

  const [activeTab, setActiveTab] = useState('deals-board')

  useEffect(() => {
    const updateFromHash = () => {
      const hash = window.location.hash.slice(1)
      if (hash && TABS.some((t) => t.id === hash)) {
        setActiveTab(hash)
      }
    }
    updateFromHash()
    window.addEventListener('hashchange', updateFromHash)
    return () => window.removeEventListener('hashchange', updateFromHash)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id
            if (TABS.some((t) => t.id === id)) {
              setActiveTab(id)
            }
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )

    for (const tab of TABS) {
      const el = document.getElementById(tab.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToTab = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${id}`)
      setActiveTab(id)
    }
  }, [])

  const resetFilters = () => {
    onSearchChange('')
    onFirmChange('All')
    onMarketChange('All')
    onDiscountChange('all')
    onSortChange('discount')
  }

  const faqItems = faqs.length > 0 ? faqs : faqFallbackItems

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(900px_280px_at_15%_0%,rgba(255,255,255,0.06),transparent_72%),radial-gradient(860px_260px_at_85%_2%,rgba(255,255,255,0.04),transparent_72%),linear-gradient(180deg,hsl(var(--background))_0%,rgba(10,10,10,0.96)_26%,hsl(var(--background))_100%)]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 py-6 sm:px-6 md:px-8 lg:px-12 lg:py-10">
        <DealsHero localePrefix={localePrefix} overview={overview} />
      </div>

      <DealsTabBar activeTab={activeTab} onTabClick={scrollToTab} />

      <section id="deals-board" className="scroll-mt-[120px] overflow-hidden">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 py-8 sm:px-6 md:px-8 lg:px-12">
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
            hadFetchError={hadFetchError}
          />
        </div>
      </section>

      <DealsTabSections locale={locale} firms={firms} faqItems={faqItems} />
    </div>
  )
}

function DealsTabSections({
  locale,
  firms,
  faqItems,
}: {
  locale: string
  firms: UnifiedFirm[]
  faqItems: readonly { question: string; answer: string }[]
}) {
  return (
    <>
      {/* ── Matchup ── */}
      <section id="matchup" className="scroll-mt-[120px] overflow-hidden bg-[hsl(var(--mk-surface)/0.3)] py-16 sm:py-20">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3 rounded-full px-3">Matchup</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tighter text-foreground/95 sm:text-4xl">Compare prop firm tradeoffs before you pay</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">Compare current entry pricing, drawdown model, and payout rhythm. Pick structure-fit over headline hype.</p>
          </div>
          <div className="mx-auto mb-6 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Firms</p>
              <p className="mt-1 text-lg font-bold text-foreground/95">{firms.length}+</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Models</p>
              <p className="mt-1 text-lg font-bold text-foreground/95">3</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">View</p>
              <p className="mt-1 text-lg font-bold text-foreground/95">Live</p>
            </div>
          </div>
          <FirmComparisonGrid firms={firms} />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.66)] p-5 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.005] hover:border-white/[0.14] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]">
              <h3 className="text-base font-bold text-foreground/95">1. Set max month-one spend</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Include evaluation fee, any likely retry budget, and platform costs.</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.66)] p-5 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.005] hover:border-white/[0.14] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]">
              <h3 className="text-base font-bold text-foreground/95">2. Pick executable drawdown</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Favor rule sets you can consistently follow during volatile sessions.</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.66)] p-5 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.005] hover:border-white/[0.14] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]">
              <h3 className="text-base font-bold text-foreground/95">3. Align payout cadence</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Match payout timing with your capital recycling and scaling plan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cost Planner ── */}
      <section id="cost-planner" className="scroll-mt-[120px] overflow-hidden py-16 sm:py-20">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3 rounded-full px-3">Cost Planner</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tighter text-foreground/95 sm:text-4xl">Model your evaluation cost before you start</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">Set realistic expectations for resets, platform costs, and payout targets.</p>
          </div>
          <div className="mx-auto mb-6 grid max-w-xl gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Input Layer</p>
              <p className="mt-1 font-bold text-foreground/95">Fees + resets</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Output Layer</p>
              <p className="mt-1 font-bold text-foreground/95">Net after costs</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Risk Layer</p>
              <p className="mt-1 font-bold text-foreground/95">Ratio signal</p>
            </div>
          </div>
          <EvalCostCalculator />
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.82)] p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
            <h3 className="text-lg font-bold text-foreground/95">Interpretation tips</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.66)] px-3 py-2">If your cost-to-payout ratio rises above 40%, reconsider account size, reset assumptions, or execution pace.</li>
              <li className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.66)] px-3 py-2">Use the Matchup tab to cross-check whether a different drawdown model can reduce expected reset frequency.</li>
              <li className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.66)] px-3 py-2">Pair this with the Playbooks tab to align risk rules with the same assumptions entered here.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Playbooks ── */}
      <section id="playbooks" className="scroll-mt-[120px] overflow-hidden bg-[hsl(var(--mk-surface)/0.3)] py-16 sm:py-20">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3 rounded-full px-3">Playbooks</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tighter text-foreground/95 sm:text-4xl">Prop firm playbooks for disciplined execution</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">Convert policy language into concrete actions you can execute during evaluation and funded phases.</p>
          </div>
          <div className="mx-auto mb-6 grid max-w-xl gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Focus</p>
              <p className="mt-1 font-bold text-foreground/95">Execution Quality</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Mode</p>
              <p className="mt-1 font-bold text-foreground/95">Actionable Steps</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Outcome</p>
              <p className="mt-1 font-bold text-foreground/95">Lower Rule Breaches</p>
            </div>
          </div>
          <GuideLibrary locale={locale} />
        </div>
      </section>

      {/* ── Help / FAQ ── */}
      <section id="help" className="scroll-mt-[120px] overflow-hidden py-16 sm:py-20">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3 rounded-full px-3">Help</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tighter text-foreground/95 sm:text-4xl">Deals FAQ</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">Everything on this page is specific to how Qunt Edge presents and maintains prop firm deal information.</p>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {['Deals basics', 'Offer updates', 'Risk fit', 'Support'].map((chip) => (
              <span key={chip} className="rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.68)] px-3 py-1 text-xs text-muted-foreground">{chip}</span>
            ))}
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`} className="mb-3 rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.84)] px-4 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
                <AccordionTrigger className="py-4 text-left text-base font-bold text-foreground/95 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
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
  const [isAutoSlidePaused, setIsAutoSlidePaused] = useState(false)
  const dealsCount = deals.length

  useEffect(() => {
    if (dealsCount < 2 || isAutoSlidePaused) return

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % dealsCount)
    }, DEALS_SPOTLIGHT_AUTO_SLIDE_MS)

    return () => window.clearTimeout(timer)
  }, [activeIndex, dealsCount, isAutoSlidePaused])

  if (dealsCount === 0) return null

  const normalizedActiveIndex = activeIndex % dealsCount
  const activeDeal = deals[normalizedActiveIndex]
  const previousDeal = deals[(normalizedActiveIndex - 1 + dealsCount) % dealsCount]
  const nextDeal = deals[(normalizedActiveIndex + 1) % dealsCount]
  const claimHref = activeDeal.claimUrl || getFirmHref(locale, activeDeal.firmSlug)
  const isExternalClaim = Boolean(activeDeal.claimUrl)

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + dealsCount) % dealsCount)
  }

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % dealsCount)
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-[hsl(var(--mk-bg-0))] px-6 pb-8 pt-7 text-[hsl(var(--mk-text))] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] sm:px-8 sm:pb-10 sm:pt-8 lg:px-10 lg:pb-14 lg:pt-10"
      onMouseEnter={() => setIsAutoSlidePaused(true)}
      onMouseLeave={() => setIsAutoSlidePaused(false)}
      onFocusCapture={() => setIsAutoSlidePaused(true)}
      onBlurCapture={() => setIsAutoSlidePaused(false)}
    >
      <div className="relative flex items-center justify-between gap-3">
        <h2 className="text-balance text-[clamp(2rem,2.8vw,3.3rem)] font-extrabold leading-tight tracking-tighter text-[hsl(var(--mk-text))]">
          Today&apos;s Biggest &amp; Largest Deals!
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Show previous deal spotlight"
            className="inline-flex h-11 w-11 items-center justify-center text-[hsl(var(--chart-3))] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 hover:brightness-125"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Show next deal spotlight"
            className="inline-flex h-11 w-11 items-center justify-center text-[hsl(var(--chart-3))] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 hover:brightness-125"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="relative mt-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center xl:flex">
          <BackgroundDealTeaser deal={previousDeal} align="left" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center xl:flex">
          <BackgroundDealTeaser deal={nextDeal} align="right" />
        </div>

        <div className="relative mx-auto w-full max-w-[1020px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(var(--mk-bg-0))] px-6 py-8 sm:px-8 sm:py-9 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
          <div className="absolute left-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--chart-3))]">
            <Flame className="h-4 w-4" />
          </div>
          <div className="grid gap-7 lg:grid-cols-[0.97fr_auto_1.03fr] lg:items-center">
            <div className="flex flex-col items-center text-center">
              <div className="relative mt-4 h-36 w-36">
                <div className="absolute -inset-7 rounded-full bg-[radial-gradient(circle,rgba(190,218,255,0.34)_0%,rgba(20,39,70,0.08)_60%,transparent_100%)] blur-2xl" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_26%,rgba(244,250,255,0.94)_0%,rgba(183,204,236,0.36)_20%,rgba(26,47,82,0.7)_48%,rgba(6,13,27,1)_76%)]" />
                <div className="absolute inset-0 rounded-full shadow-[inset_-20px_-20px_36px_rgba(0,0,0,0.82)]" />
                <div className="absolute -left-2 top-1 h-10 w-10 rounded-full bg-[hsl(var(--mk-text)/0.52)] blur-xl" />
              </div>
              <p className="mt-9 font-mono text-[1.9rem] font-bold tracking-tighter text-[hsl(var(--mk-text))] sm:text-[2.1rem]">
                {activeDeal.firmName}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[hsl(var(--chart-3))]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-6 w-6 fill-current" />
                ))}
              </div>
            </div>

            <div className="hidden h-[340px] w-px border-l border-dashed border-white/[0.10] lg:block" />

            <div className="flex flex-col items-center text-center">
              <p className="whitespace-nowrap text-[clamp(3rem,4vw,4.9rem)] font-extrabold tracking-tighter text-[hsl(var(--mk-text))]">
                {activeDeal.discountPercent}% Off
              </p>
              <p className="mt-3 max-w-[400px] text-[1.02rem] leading-8 text-[hsl(var(--mk-text))] leading-relaxed sm:text-[1.05rem]">
                Big savings inside: {activeDeal.discountPercent}% off on {activeDeal.firmName} accounts.
              </p>
              <button
                type="button"
                onClick={() => onCopyCode(activeDeal.couponCode)}
                className="mt-7 text-[1.35rem] font-bold text-[hsl(var(--chart-3))] underline underline-offset-4 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[hsl(var(--chart-3)/0.82)] hover:brightness-110"
              >
                {copiedCode === activeDeal.couponCode ? 'Code copied' : `Copy_Code:_ ${activeDeal.couponCode}`}
              </button>
              {isExternalClaim ? (
                <a
                  href={claimHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex h-16 w-full max-w-[430px] items-center justify-center rounded-full bg-[hsl(var(--chart-3))] px-8 text-[2rem] font-bold text-[hsl(var(--mk-bg-0))] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.005] hover:brightness-110 hover:shadow-[0_0_24px_rgba(139,92,246,0.4)]"
                >
                  Get Deal
                </a>
              ) : (
                <Link
                  href={claimHref}
                  className="mt-8 inline-flex h-16 w-full max-w-[430px] items-center justify-center rounded-full bg-[hsl(var(--chart-3))] px-8 text-[2rem] font-bold text-[hsl(var(--mk-bg-0))] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.005] hover:brightness-110 hover:shadow-[0_0_24px_rgba(139,92,246,0.4)]"
                >
                  Get Deal
                </Link>
              )}
            </div>
          </div>
        </div>

        {dealsCount > 1 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {deals.map((deal, index) => {
              const isActive = index === normalizedActiveIndex

              return (
                <button
                  key={`${deal.firmSlug}-${deal.couponCode}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${deal.firmName} spotlight`}
                  aria-pressed={isActive}
                  className={`h-2.5 rounded-full transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? 'w-10 bg-[hsl(var(--chart-3))] opacity-100'
                      : 'w-2.5 bg-[hsl(var(--mk-border)/0.85)] opacity-55 hover:opacity-100'
                  }`}
                />
              )
            })}
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--mk-text-muted)/0.78)]">
              {normalizedActiveIndex + 1} / {dealsCount}
            </span>
          </div>
        ) : null}
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
      className={`w-[390px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(var(--mk-bg-0))] px-6 py-7 opacity-15 ${
        align === 'left' ? 'translate-x-[-56%]' : 'translate-x-[56%]'
      }`}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div>
          <p className="text-5xl font-bold text-[hsl(var(--mk-text-muted)/0.8)]">{deal.discountPercent}% Off</p>
          <p className="mt-3 text-xl text-[hsl(var(--mk-text-muted)/0.75)]">{deal.firmName}</p>
        </div>
        <div className="hidden h-24 w-px border-l border-dashed border-white/[0.10] lg:block" />
        <div>
          <p className="text-sm text-[hsl(var(--mk-text-muted)/0.78)]">Copy_Code:_ {deal.couponCode}</p>
          <div className="mt-4 h-14 w-full rounded-full bg-[hsl(var(--chart-3)/0.5)]" />
        </div>
      </div>
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
  hadFetchError,
}: {
  locale: string
  featuredDeals: DealItem[]
  expiringDeals: DealItem[]
  browseDeals: DealItem[]
  filteredDeals: DealItem[]
  copiedCode: string | null
  onCopyCode: (code: string) => void
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

      {hadFetchError ? (
        <p className="text-sm leading-relaxed text-amber-500">
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
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.84)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Browse all live deals</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground/95">The active board</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
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
        <div className="mt-6 rounded-2xl border border-dashed border-white/[0.10] bg-[hsl(var(--mk-surface-muted)/0.66)] p-8 text-center text-sm leading-relaxed text-muted-foreground">
          {filteredDeals.length === 0
            ? 'No deals match the current filter stack. Try widening the firm or market selection.'
            : 'All matching deals are already highlighted above.'}
        </div>
      )}
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
    <section className="grid gap-6 overflow-hidden rounded-2xl bg-[linear-gradient(160deg,hsl(var(--mk-surface)/0.88),hsl(var(--background)/0.7))] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Verified prop firm discounts
        </div>
        <h1 className="mt-5 text-balance text-[clamp(2.25rem,5.4vw,4.8rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-foreground/95">
          Open current promos without losing the firm context.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Browse active challenge discounts, compare pricing by market and firm, and move straight into the firm record when you want more context.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`${localePrefix}/propfirms`}
            className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_16px_28px_-14px_hsl(var(--primary)/0.75)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.005] hover:brightness-110"
          >
            Compare firms
          </Link>
          <Link
            href={`${localePrefix}/deals/compare`}
            className="rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.66)] px-5 py-3 text-sm font-medium text-foreground/95 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[hsl(var(--mk-surface-muted)/0.82)] hover:border-white/[0.14]"
          >
            Compare pricing
          </Link>
          <Link
            href={`${localePrefix}/best-trading-journal`}
            className="rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.66)] px-5 py-3 text-sm font-medium text-foreground/95 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[hsl(var(--mk-surface-muted)/0.82)] hover:border-white/[0.14]"
          >
            Best trading journal guide
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Live deals" value={overview.totalLiveDeals.toString()} icon={BadgePercent} />
          <StatCard label="Tracked firms" value={overview.totalTrackedFirms.toString()} icon={Building2} />
          <StatCard label="Account value" value={formatCompactCurrency(overview.totalAccountValue)} icon={Wallet} />
          <StatCard label="Paid payouts" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} icon={Banknote} />
        </div>
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
    <section className="grid gap-6 overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.84)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by firm, coupon, or platform..."
              className="h-11 w-full rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] pl-11 pr-4 text-sm text-foreground/95 outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-muted-foreground/60 focus:border-primary/35"
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
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  selectedDiscount === option.value
                    ? 'border-primary/35 bg-primary text-primary-foreground shadow-[0_12px_20px_-14px_hsl(var(--primary)/0.75)]'
                    : 'border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.65)] text-muted-foreground hover:text-foreground/95 hover:border-white/[0.14]'
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
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  sortKey === item.key
                    ? 'border-primary/35 bg-primary text-primary-foreground shadow-[0_12px_20px_-14px_hsl(var(--primary)/0.75)]'
                    : 'border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.65)] text-muted-foreground hover:text-foreground/95 hover:border-white/[0.14]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/[0.10] bg-[hsl(var(--mk-surface-muted)/0.6)] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            <span>The deal board is narrowed right now. Reset to return to the full live tape.</span>
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.76)] px-3 py-1.5 text-xs font-medium text-foreground/95 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[hsl(var(--mk-surface-muted)/0.72)] hover:border-white/[0.14]"
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.84)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Board snapshot</p>
        <div className="mt-4 space-y-3">
          <RadarRow label="Futures coverage" value={`${spotlights.futures.length} spotlights`} />
          <RadarRow label="CFD coverage" value={`${spotlights.cfd.length} spotlights`} />
          <RadarRow label="Last refreshed" value={lastUpdated ?? spotlights.updatedAt} />
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.62)] p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Top payout firms</p>
          <div className="mt-3 space-y-2">
            {topFirms.map((firm) => (
              <Link
                key={firm.id}
                href={getFirmHrefFromPrefix(localePrefix, firm.slug)}
                className="flex items-center justify-between rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.76)] px-3 py-2 text-sm transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[hsl(var(--mk-surface-muted)/0.7)] hover:border-white/[0.14]"
              >
                <span className="font-medium text-foreground/95">{firm.name}</span>
                <span className="text-muted-foreground">{formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.62)] px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Need policy context?</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">The FAQ covers verification, timing, and risk-fit questions.</p>
          </div>
          <Link
            href={`${localePrefix}/deals/faq`}
            className="shrink-0 rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.76)] px-3 py-2 text-xs font-bold text-foreground/95 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[hsl(var(--mk-surface-muted)/0.72)] hover:border-white/[0.14]"
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
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.84)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
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
  const firmHref = getFirmHref(locale, deal.firmSlug)
  const claimHref = deal.claimUrl || firmHref
  const isExternalClaim = Boolean(deal.claimUrl)

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(155deg,hsl(var(--mk-surface)/0.9),hsl(var(--mk-surface-muted)/0.66))] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.005] hover:border-white/[0.14] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.78)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {deal.category}
          </div>
          <h3 className="mt-3 text-lg font-bold tracking-tight text-foreground/95">{deal.firmName}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {deal.platform} • {deal.payoutModel}
          </p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Discount</p>
          <p className="mt-1 text-xl font-bold text-foreground/95">{deal.discountPercent}%</p>
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
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.78)] px-4 py-2 text-sm font-medium text-foreground/95 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[hsl(var(--mk-surface-muted)/0.72)] hover:border-white/[0.14]"
        >
          <Copy className="h-4 w-4" />
          {copiedCode === deal.couponCode ? 'Copied' : 'Copy code'}
        </button>
        <Link
          href={firmHref}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.78)] px-4 py-2 text-sm font-medium text-foreground/95 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[hsl(var(--mk-surface-muted)/0.72)] hover:border-white/[0.14]"
        >
          View firm
        </Link>
        {isExternalClaim ? (
          <a
            href={claimHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[0_14px_24px_-14px_hsl(var(--primary)/0.8)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.005] hover:brightness-110"
          >
            Claim deal
            <ArrowRight className="h-4 w-4" />
          </a>
        ) : (
          <Link
            href={claimHref}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[0_14px_24px_-14px_hsl(var(--primary)/0.8)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.005] hover:brightness-110"
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
    <div className="overflow-hidden rounded-2xl bg-[hsl(var(--mk-surface-muted)/0.72)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground/95">{value}</p>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.72)] p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground/95">{value}</p>
    </div>
  )
}

function RadarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.66)] px-3 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground/95">{value}</span>
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
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(var(--mk-surface)/0.84)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground/95">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{helper}</p>
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
      className="h-11 rounded-full border border-white/[0.08] bg-[hsl(var(--mk-surface-muted)/0.7)] px-4 text-sm text-foreground/95 outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus:border-primary/35"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
