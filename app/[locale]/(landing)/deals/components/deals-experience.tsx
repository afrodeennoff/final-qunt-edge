'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgePercent,
  Banknote,
  Building2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Search,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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
const dealsPanelClassName = 'rounded-xl bg-card'
const dealsInsetPanelClassName = 'rounded-xl bg-muted/40'
const dealsChipClassName = 'rounded-full bg-muted/50'
const dealsGhostButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-full bg-muted/40 px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground'
const dealsPrimaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90'

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
    <nav className="sticky top-16 z-40 border-y border-transparent bg-background/95">
      <div className="mx-auto max-w-[1360px] overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="my-3 flex gap-1.5 overflow-x-auto overflow-y-hidden rounded-full border-0 bg-card p-1.5 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabClick(tab.id)}
              className={`relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-5 ${
                activeTab === tab.id
                  ? 'bg-muted text-foreground border-0'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
  return [
    'All',
    ...Array.from(new Set(deals.map((deal) => deal.firmName))).sort((a, b) => a.localeCompare(b)),
  ]
}

function matchesDealFilters(
  deal: DealItem,
  filters: {
    selectedFirm: string
    selectedMarket: 'All' | MarketType
    selectedDiscount: string
    normalizedSearch: string
  },
): boolean {
  if (filters.selectedFirm !== 'All' && deal.firmName !== filters.selectedFirm) return false
  if (filters.selectedMarket !== 'All' && deal.category !== filters.selectedMarket) return false
  if (filters.selectedDiscount !== 'all' && deal.discountPercent < Number(filters.selectedDiscount))
    return false
  if (!filters.normalizedSearch) return true

  const haystack =
    `${deal.firmName} ${deal.couponCode} ${deal.platform} ${deal.category}`.toLowerCase()
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

function DealsExperienceInner({
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
      }),
    )

    return sortDeals(next, sortKey)
  }, [deals, normalizedSearch, selectedDiscount, selectedFirm, selectedMarket, sortKey])

  const { featuredDeals, expiringDeals, browseDeals } = useMemo(
    () => partitionDeals(filteredDeals),
    [filteredDeals],
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
  const hasActiveFilters = hasActiveDealFilters(
    search,
    selectedFirm,
    selectedMarket,
    selectedDiscount,
    sortKey,
  )
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
    <div className="min-h-dvh overflow-hidden bg-background">
      <UnifiedPageShell
        widthClassName="max-w-[1360px]"
        density="compact"
        className="pb-3 pt-6 sm:pt-8 lg:pt-10"
      >
        <DealsHero localePrefix={localePrefix} overview={overview} />
      </UnifiedPageShell>

      <DealsTabBar activeTab={activeTab} onTabClick={scrollToTab} />

      <section id="deals-board" className="scroll-mt-[120px] overflow-hidden">
        <UnifiedPageShell
          widthClassName="max-w-[1360px]"
          density="compact"
          className="py-6 sm:py-8"
        >
          <div className="space-y-6 lg:space-y-8">
            {/* Spotlight carousel removed for cleaner propfirmperk-style all-deals focus */}

            <section className="grid gap-4 lg:grid-cols-3">
              <InsightCard
                label="Best visible discount"
                value={
                  topDiscountDeal ? `${topDiscountDeal.discountPercent}% off` : 'No current match'
                }
                helper={
                  topDiscountDeal
                    ? `${topDiscountDeal.firmName} • ${topDiscountDeal.couponCode}`
                    : 'Widen filters to surface a current promo'
                }
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

            {/* PropFirmPerk-style All Deals header */}
            <div className="mb-4 flex items-end justify-between gap-4 border-b pb-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-primary">ALL PROP FIRM DEALS</div>
                <h2 className="text-2xl font-semibold tracking-tight mt-1">Compare challenge fees &amp; verified discounts</h2>
                <p className="text-sm text-muted-foreground mt-1">See your true cost after promo. Click any firm for full rules.</p>
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {filteredDeals.length} active offers
              </div>
            </div>

            <AllDealsGrid
              locale={locale}
              deals={filteredDeals}
              copiedCode={copiedCode}
              onCopyCode={onCopyCode}
              hadFetchError={hadFetchError}
            />
          </div>
        </UnifiedPageShell>
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
      <section
        id="matchup"
        className="scroll-mt-[120px] overflow-hidden bg-card py-12 sm:py-16"
      >
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3 rounded-full px-3">
              Matchup
            </Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
              Compare prop firm tradeoffs before you pay
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Compare current entry pricing, drawdown model, and payout rhythm. Pick structure-fit
              over headline hype.
            </p>
          </div>
          <div className="mx-auto mb-6 grid max-w-2xl grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={cn(dealsInsetPanelClassName, 'p-3 text-center')}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Firms</p>
              <p className="mt-1 text-lg font-bold text-foreground">{firms.length}+</p>
            </div>
            <div className={cn(dealsInsetPanelClassName, 'p-3 text-center')}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Models</p>
              <p className="mt-1 text-lg font-bold text-foreground">3</p>
            </div>
            <div className={cn(dealsInsetPanelClassName, 'p-3 text-center')}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">View</p>
              <p className="mt-1 text-lg font-bold text-foreground">Live</p>
            </div>
          </div>
          <FirmComparisonGrid firms={firms} />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div
              className={cn(
                dealsInsetPanelClassName,
                'p-6 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-transparent',
              )}
            >
              <h3 className="text-base font-bold text-foreground">1. Set max month-one spend</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Include evaluation fee, any likely retry budget, and platform costs.
              </p>
            </div>
            <div
              className={cn(
                dealsInsetPanelClassName,
                'p-6 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-transparent',
              )}
            >
              <h3 className="text-base font-bold text-foreground">2. Pick executable drawdown</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Favor rule sets you can consistently follow during volatile sessions.
              </p>
            </div>
            <div
              className={cn(
                dealsInsetPanelClassName,
                'p-6 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-transparent',
              )}
            >
              <h3 className="text-base font-bold text-foreground">3. Align payout cadence</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Match payout timing with your capital recycling and scaling plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cost Planner ── */}
      <section id="cost-planner" className="scroll-mt-[120px] overflow-hidden py-12 sm:py-16">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3 rounded-full px-3">
              Cost Planner
            </Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
              Model your evaluation cost before you start
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Set realistic expectations for resets, platform costs, and payout targets.
            </p>
          </div>
          <div className="mx-auto mb-6 grid max-w-xl gap-2 grid-cols-1 sm:grid-cols-3">
            <div className={cn(dealsInsetPanelClassName, 'p-3 text-center')}>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Input Layer
              </p>
              <p className="mt-1 font-bold text-foreground">Fees + resets</p>
            </div>
            <div className={cn(dealsInsetPanelClassName, 'p-3 text-center')}>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Output Layer
              </p>
              <p className="mt-1 font-bold text-foreground">Net after costs</p>
            </div>
            <div className={cn(dealsInsetPanelClassName, 'p-3 text-center')}>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Risk Layer
              </p>
              <p className="mt-1 font-bold text-foreground">Ratio signal</p>
            </div>
          </div>
          <EvalCostCalculator />
          <div className={cn(dealsPanelClassName, 'mt-6 p-4 sm:p-6')}>
            <h3 className="text-lg font-bold text-foreground">Interpretation tips</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li className={cn(dealsInsetPanelClassName, 'px-3 py-2')}>
                If your cost-to-payout ratio rises above 40%, reconsider account size, reset
                assumptions, or execution pace.
              </li>
              <li className={cn(dealsInsetPanelClassName, 'px-3 py-2')}>
                Use the Matchup tab to cross-check whether a different drawdown model can reduce
                expected reset frequency.
              </li>
              <li className={cn(dealsInsetPanelClassName, 'px-3 py-2')}>
                Pair this with the Playbooks tab to align risk rules with the same assumptions
                entered here.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Playbooks ── */}
      <section
        id="playbooks"
        className="scroll-mt-[120px] overflow-hidden bg-card py-12 sm:py-16"
      >
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3 rounded-full px-3">
              Playbooks
            </Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
              Prop firm playbooks for disciplined execution
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Convert policy language into concrete actions you can execute during evaluation and
              funded phases.
            </p>
          </div>
          <div className="mx-auto mb-6 grid max-w-xl gap-2 grid-cols-1 sm:grid-cols-3">
            <div className={cn(dealsInsetPanelClassName, 'p-3 text-center')}>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Focus</p>
              <p className="mt-1 font-bold text-foreground">Execution Quality</p>
            </div>
            <div className={cn(dealsInsetPanelClassName, 'p-3 text-center')}>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Mode</p>
              <p className="mt-1 font-bold text-foreground">Actionable Steps</p>
            </div>
            <div className={cn(dealsInsetPanelClassName, 'p-3 text-center')}>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Outcome</p>
              <p className="mt-1 font-bold text-foreground">Lower Rule Breaches</p>
            </div>
          </div>
          <GuideLibrary locale={locale} />
        </div>
      </section>

      {/* ── Help / FAQ ── */}
      <section id="help" className="scroll-mt-[120px] overflow-hidden py-12 sm:py-16">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3 rounded-full px-3">
              Help
            </Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
              Deals FAQ
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Everything on this page is specific to how Qunt Edge presents and maintains prop firm
              deal information.
            </p>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {['Deals basics', 'Offer updates', 'Risk fit', 'Support'].map((chip) => (
              <span
                key={chip}
                className={cn(dealsChipClassName, 'px-3 py-1 text-xs text-muted-foreground')}
              >
                {chip}
              </span>
            ))}
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`item-${index}`}
                className={cn(dealsPanelClassName, 'mb-3 rounded-2xl px-4')}
              >
                <AccordionTrigger className="py-4 text-left text-base font-bold text-foreground hover:no-underline">
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
      className={cn(
        dealsPanelClassName,
        'relative overflow-hidden p-4 sm:p-6 lg:p-8',
      )}
      onMouseEnter={() => setIsAutoSlidePaused(true)}
      onMouseLeave={() => setIsAutoSlidePaused(false)}
      onFocusCapture={() => setIsAutoSlidePaused(true)}
      onBlurCapture={() => setIsAutoSlidePaused(false)}
    >
      <div className="relative flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit rounded-full px-3">
            Deal spotlight
          </Badge>
          <h2 className="text-balance text-[clamp(1.8rem,2.8vw,3rem)] font-extrabold leading-tight tracking-tighter text-foreground">
            Today&apos;s strongest live setup
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            A cleaner read on the top board offer, with the pricing details and next action in one
            place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Show previous deal spotlight"
            className={cn(dealsGhostButtonClassName, 'h-10 w-11 px-0')}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Show next deal spotlight"
            className={cn(dealsGhostButtonClassName, 'h-10 w-11 px-0')}
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

        <div
          className={cn(
            dealsInsetPanelClassName,
            'relative mx-auto w-full max-w-[1080px] overflow-hidden px-6 py-6 sm:px-8 sm:py-8',
          )}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-start">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    dealsChipClassName,
                    'px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground',
                  )}
                >
                  {activeDeal.category}
                </span>
                <span
                  className={cn(
                    dealsChipClassName,
                    'px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground',
                  )}
                >
                  {activeDeal.platform}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Lead spotlight
                </p>
                <h3 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {activeDeal.firmName}
                </h3>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {activeDeal.discountPercent}% off on {activeDeal.platform}{' '}
                  {activeDeal.payoutModel.toLowerCase()} accounts with{' '}
                  {activeDeal.drawdownType.toLowerCase()} rules. Use the coupon below, then jump
                  straight into the firm page if you want deeper context first.
                </p>
              </div>

              <div className={cn(dealsInsetPanelClassName, 'p-4')}>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Coupon code
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    {activeDeal.couponCode}
                  </p>
                  <button
                    type="button"
                    onClick={() => onCopyCode(activeDeal.couponCode)}
                    className={dealsGhostButtonClassName}
                  >
                    <Copy className="h-4 w-4" />
                    {copiedCode === activeDeal.couponCode ? 'Code copied' : 'Copy code'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={getFirmHref(locale, activeDeal.firmSlug)}
                  className={dealsGhostButtonClassName}
                >
                  View firm
                </Link>
                {isExternalClaim ? (
                  <a
                    href={claimHref}
                    target="_blank"
                    rel="noreferrer"
                    className={dealsPrimaryButtonClassName}
                  >
                    Claim deal
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <Link href={claimHref} className={dealsPrimaryButtonClassName}>
                    Claim deal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatPill label="Discount" value={`${activeDeal.discountPercent}% off`} />
              <StatPill label="Challenge fee" value={formatPrice(activeDeal.challengeFee)} />
              <StatPill label="Drawdown" value={activeDeal.drawdownType} />
              <StatPill
                label="Expiry"
                value={
                  getDaysLeft(activeDeal.expiryDate) === null
                    ? 'No expiry'
                    : getDaysLeft(activeDeal.expiryDate) === 0
                      ? 'Ends today'
                      : `${getDaysLeft(activeDeal.expiryDate)}d left`
                }
              />
              <StatPill label="Payout model" value={activeDeal.payoutModel} />
              <StatPill
                label="Claim route"
                value={isExternalClaim ? 'Direct link' : 'Firm detail'}
              />
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
                  className={`h-2.5 rounded-full transition-[width,background-color,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? 'w-10 bg-primary opacity-100'
                       : 'w-2.5 bg-transparent opacity-55 hover:opacity-100'
                  }`}
                />
              )
            })}
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {normalizedActiveIndex + 1} / {dealsCount}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function BackgroundDealTeaser({ deal, align }: { deal: DealItem; align: 'left' | 'right' }) {
  return (
    <div
      className={`w-[360px] overflow-hidden rounded-xl border-0 bg-card px-6 py-6 opacity-20 ${
        align === 'left' ? 'translate-x-[-56%]' : 'translate-x-[56%]'
      }`}
    >
      <div className="space-y-4">
        <div>
          <p className="text-4xl font-bold text-foreground">{deal.discountPercent}% off</p>
          <p className="mt-2 text-lg text-foreground">{deal.firmName}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={cn(dealsInsetPanelClassName, 'p-3')}>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Coupon</p>
            <p className="mt-1 text-sm font-semibold text-foreground/70">{deal.couponCode}</p>
          </div>
          <div className={cn(dealsInsetPanelClassName, 'p-3')}>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fee</p>
            <p className="mt-1 text-sm font-semibold text-foreground/70">
              {formatPrice(deal.challengeFee)}
            </p>
          </div>
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
        <p className="text-sm leading-relaxed text-warning">
          Some deal data could not be refreshed fully. The page is showing the best available
          snapshot.
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
    <section className={cn(dealsPanelClassName, 'overflow-hidden p-4 sm:p-6')}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Browse all live deals
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            The active board
          </h2>
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
        <div className="mt-6 rounded-2xl border-0 bg-card p-8 text-center text-sm leading-relaxed text-muted-foreground">
          {filteredDeals.length === 0
            ? 'No deals match the current filter stack. Try widening the firm or market selection.'
            : 'All matching deals are already highlighted above.'}
        </div>
      )}
    </section>
  )
}

function DealsHero({ localePrefix, overview }: { localePrefix: string; overview: DealsOverview }) {
  return (
    <section
      className={cn(
        dealsPanelClassName,
        'grid gap-6 overflow-hidden p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8',
      )}
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-transparent bg-primary/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Verified prop firm discounts
        </div>
        <h1 className="mt-5 text-balance text-[clamp(2.25rem,5.4vw,4.8rem)] font-extrabold leading-[0.98] tracking-tight text-foreground">
          Open current promos without losing the firm context.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Browse active challenge discounts, compare pricing by market and firm, and move from
          discovery to the firm record without losing your risk and payout context.
        </p>
        <div className={cn(dealsInsetPanelClassName, 'grid gap-3 p-4 sm:grid-cols-3')}>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              1. Scan the board
            </p>
            <p className="text-sm font-semibold text-foreground">Find live pricing fast</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              2. Validate fit
            </p>
            <p className="text-sm font-semibold text-foreground">
              Check drawdown and payout structure
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              3. Move with context
            </p>
            <p className="text-sm font-semibold text-foreground">Compare firms before you claim</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`${localePrefix}/propfirms`} className={dealsPrimaryButtonClassName}>
            Compare firms
          </Link>
          <Link href={`${localePrefix}/deals/compare`} className={dealsGhostButtonClassName}>
            Compare pricing
          </Link>
          <Link href={`${localePrefix}/best-trading-journal`} className={dealsGhostButtonClassName}>
            Best trading journal guide
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            label="Live deals"
            value={overview.totalLiveDeals.toString()}
            icon={BadgePercent}
          />
          <StatCard
            label="Tracked firms"
            value={overview.totalTrackedFirms.toString()}
            icon={Building2}
          />
          <StatCard
            label="Account value"
            value={formatCompactCurrency(overview.totalAccountValue)}
            icon={Wallet}
          />
          <StatCard
            label="Paid payouts"
            value={formatCompactCurrency(overview.totalPaidPayoutAmount)}
            icon={Banknote}
          />
        </div>
        <div className={cn(dealsInsetPanelClassName, 'p-4 sm:p-6')}>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Board rhythm
          </p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            Start with the headline, finish with the rules.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Use discounts to narrow the tape, then compare drawdown model, pricing, and payout
            cadence before committing capital.
          </p>
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
      <div className={cn(dealsPanelClassName, 'overflow-hidden p-6')}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by firm, coupon, or platform..."
              className="h-10 w-full rounded-full border-0 bg-card pl-11 pr-4 text-sm text-foreground outline-none transition-[background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-muted-foreground/60 focus:border-primary/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <SelectLike value={selectedFirm} onChange={onFirmChange} options={firmOptions} />
            <SelectLike
              value={selectedMarket}
              onChange={(value) => onMarketChange(value as 'All' | MarketType)}
              options={marketOptions}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {discountOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onDiscountChange(option.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  selectedDiscount === option.value
                     ? 'border-primary/30 bg-primary text-primary-foreground'
                    : 'border-transparent bg-card text-muted-foreground hover:border-transparent hover:text-foreground'
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
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  sortKey === item.key
                     ? 'border-primary/30 bg-primary text-primary-foreground'
                    : 'border-transparent bg-card text-muted-foreground hover:border-transparent hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-0 bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            <span>
              The deal board is narrowed right now. Reset to return to the full live tape.
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className={cn(dealsGhostButtonClassName, 'px-3 py-1.5 text-xs')}
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </div>

      <div className={cn(dealsPanelClassName, 'overflow-hidden p-6')}>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Board snapshot
        </p>
        <div className="mt-4 space-y-3">
          <RadarRow label="Futures coverage" value={`${spotlights.futures.length} spotlights`} />
          <RadarRow label="CFD coverage" value={`${spotlights.cfd.length} spotlights`} />
          <RadarRow label="Last refreshed" value={lastUpdated ?? spotlights.updatedAt} />
        </div>
        <div className={cn(dealsInsetPanelClassName, 'mt-5 overflow-hidden p-4')}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Top payout firms
          </p>
          <div className="mt-3 space-y-2">
            {topFirms.map((firm) => (
              <Link
                key={firm.id}
                href={getFirmHrefFromPrefix(localePrefix, firm.slug)}
                 className="flex items-center justify-between rounded-full border-0 bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span className="font-medium text-foreground">{firm.name}</span>
                <span className="text-muted-foreground">
                  {formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div
          className={cn(
            dealsInsetPanelClassName,
            'mt-5 flex items-center justify-between gap-4 overflow-hidden px-4 py-4',
          )}
        >
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Need policy context?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              The FAQ covers verification, timing, and risk-fit questions.
            </p>
          </div>
          <Link
            href={`${localePrefix}/deals/faq`}
            className={cn(dealsGhostButtonClassName, 'shrink-0 px-3 py-2 text-xs font-bold')}
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
    <section className={cn(dealsPanelClassName, 'overflow-hidden p-4 sm:p-6')}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            locale={locale}
            copiedCode={copiedCode}
            onCopyCode={onCopyCode}
          />
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
    <div className="group overflow-hidden rounded-xl border-0 bg-card p-4 transition-colors hover:bg-muted">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className={cn(
              dealsChipClassName,
              'inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground',
            )}
          >
            {deal.category}
          </div>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">{deal.firmName}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {deal.platform} • {deal.payoutModel}
          </p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Discount</p>
          <p className="mt-1 text-xl font-bold text-foreground">{deal.discountPercent}%</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatPill label="Challenge fee" value={formatPrice(deal.challengeFee)} />
        <StatPill label="Drawdown" value={deal.drawdownType} />
        <StatPill label="Coupon" value={deal.couponCode} />
        <StatPill
          label="Expiry"
          value={
            daysLeft === null ? 'No expiry' : daysLeft === 0 ? 'Ends today' : `${daysLeft}d left`
          }
        />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onCopyCode(deal.couponCode)}
          className={dealsGhostButtonClassName}
        >
          <Copy className="h-4 w-4" />
          {copiedCode === deal.couponCode ? 'Copied' : 'Copy code'}
        </button>
        <Link href={firmHref} className={dealsGhostButtonClassName}>
          View firm
        </Link>
      </div>
      <div className="mt-2">
        {isExternalClaim ? (
          <a
            href={claimHref}
            target="_blank"
            rel="noreferrer"
            className={cn(dealsPrimaryButtonClassName, 'w-full')}
          >
            Claim deal
            <ArrowRight className="h-4 w-4" />
          </a>
        ) : (
          <Link href={claimHref} className={cn(dealsPrimaryButtonClassName, 'w-full')}>
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
    <div className={cn(dealsInsetPanelClassName, 'overflow-hidden p-4')}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(dealsInsetPanelClassName, 'rounded-xl p-3')}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}

function RadarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(dealsInsetPanelClassName, 'flex items-center justify-between px-3 py-3')}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}

function InsightCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className={cn(dealsPanelClassName, 'overflow-hidden p-6')}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
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
      className="h-10 rounded-full border-0 bg-card px-4 text-sm text-foreground outline-none transition-[background-color,border-color,color,box-shadow] duration-200 ease-out focus:border-primary/50"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NEW: PropFirmPerk-style clean All Deals grid + cards
   Clean, data-dense, focused on True Cost after discount.
═══════════════════════════════════════════════════════════════ */

function AllDealsGrid({
  locale,
  deals,
  copiedCode,
  onCopyCode,
  hadFetchError,
}: {
  locale: string
  deals: DealItem[]
  copiedCode: string | null
  onCopyCode: (code: string) => void
  hadFetchError: boolean
}) {
  if (hadFetchError) {
    return (
      <div className="rounded-2xl border-0 bg-card p-10 text-center">
        <p className="text-muted-foreground">Live deals temporarily unavailable. Please refresh in a moment.</p>
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="rounded-2xl border-0 bg-card p-10 text-center">
        <p className="text-muted-foreground">No deals match your current filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {deals.map((deal) => (
        <DealRowCard
          key={deal.id}
          deal={deal}
          locale={locale}
          copiedCode={copiedCode}
          onCopyCode={onCopyCode}
        />
      ))}
    </div>
  )
}

function DealRowCard({
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
  const trueCost = Math.round(deal.challengeFee * (1 - deal.discountPercent / 100))
  const savings = deal.challengeFee - trueCost
  const firmHref = getFirmHref(locale, deal.firmSlug)
  const buyHref = deal.claimUrl || firmHref
  const isExternal = Boolean(deal.claimUrl)
  const daysLeft = getDaysLeft(deal.expiryDate)

  return (
    <div className="group rounded-xl bg-card overflow-hidden flex flex-col transition-all hover:border-primary/30 hover:shadow-lg">
      {/* Top bar: Firm + Discount */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b">
        <div className="flex items-center gap-3 min-w-0">
          {deal.logoUrl ? (
            <img
              src={deal.logoUrl}
              alt={deal.firmName}
              className="h-9 w-9 rounded-lg object-cover border"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-muted/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              {deal.firmName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <Link href={firmHref} className="font-semibold text-[15px] tracking-tight hover:underline truncate block">
              {deal.firmName}
            </Link>
            <div className="text-[11px] text-muted-foreground truncate">
              {deal.platform} • {deal.payoutModel}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary">
            {deal.discountPercent}% OFF
          </div>
        </div>
      </div>

      {/* Specs row - compact like propfirmperk */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Drawdown</span>
          <span className="font-medium tabular-nums">{deal.drawdownType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Coupon</span>
          <span className="font-mono font-medium">{deal.couponCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Original</span>
          <span className="line-through text-muted-foreground/70 tabular-nums">${deal.challengeFee}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Expires</span>
          <span className="font-medium">
            {daysLeft === null ? 'No expiry' : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
          </span>
        </div>
      </div>

      {/* True Cost highlight - the star of the card */}
      <div className="mx-4 mb-3 rounded-xl bg-muted/40 px-4 py-3 flex items-end justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your true cost</div>
          <div className="text-3xl font-semibold tabular-nums tracking-tighter text-primary mt-0.5">
            ${trueCost}
          </div>
        </div>
        {savings > 0 && (
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">You save</div>
            <div className="text-lg font-semibold tabular-nums text-primary">+${savings}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto border-t px-4 py-3 flex gap-2 bg-card">
        <button
          onClick={() => onCopyCode(deal.couponCode)}
          className="flex-1 rounded-xl border py-2 text-sm font-medium hover:bg-muted/40 transition"
        >
          {copiedCode === deal.couponCode ? 'Copied ✓' : 'Copy code'}
        </button>

        {isExternal ? (
          <a
            href={buyHref}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-xl bg-primary py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            Buy Now →
          </a>
        ) : (
          <Link
            href={buyHref}
            className="flex-1 rounded-xl bg-primary py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            Buy Now →
          </Link>
        )}
      </div>
    </div>
  )
}

const DealsExperience = React.memo(DealsExperienceInner)

export { DealsExperience }
