'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgePercent,
  Banknote,
  Building2,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  Flame,
  Search,
  Sparkles,
  Tag,
  Wallet,
  X,
} from 'lucide-react'
import type {
  DealItem,
  DealsOverview,
  DealsSpotlightCollection,
  FaqItem,
  MarketType,
  UnifiedFirm,
} from '@/server/deals'

type SortKey = 'discount' | 'price-low' | 'price-high' | 'newest'

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
  { value: 'all', label: 'All Discounts' },
  { value: '10', label: '10%+' },
  { value: '20', label: '20%+' },
  { value: '30', label: '30%+' },
  { value: '50', label: '50%+' },
]

function getOriginalPrice(deal: DealItem, firm: UnifiedFirm | undefined): number {
  if (firm && firm.accountSizes) {
    const sizes = Object.values(firm.accountSizes)
    if (sizes.length > 0) {
      const matchingSize = sizes.find(s => s.priceWithPromo === deal.challengeFee)
      if (matchingSize) return matchingSize.price
      const minPrice = Math.min(...sizes.map(s => s.price))
      if (minPrice > 0) return minPrice
    }
  }
  if (deal.challengeFee > 0 && deal.discountPercent > 0) {
    return Math.round(deal.challengeFee / (1 - deal.discountPercent / 100))
  }
  return deal.challengeFee
}

function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  return `$${price.toLocaleString()}`
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

function isHotDeal(deal: DealItem): boolean {
  if (deal.expiryDate === 'No expiry') return false
  const expiry = new Date(deal.expiryDate)
  const now = new Date()
  const daysLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return daysLeft > 0 && daysLeft <= 14
}

function isFeaturedDeal(deal: DealItem): boolean {
  return deal.discountPercent >= 25
}

function getDaysLeft(expiryDate: string): number | null {
  if (expiryDate === 'No expiry') return null
  const expiry = new Date(expiryDate)
  const now = new Date()
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

export function DealsExperience({
  locale,
  deals,
  firms,
  overview,
  hadFetchError,
  lastUpdated,
}: Props) {
  const localePrefix = `/${locale}`
  const [search, setSearch] = useState('')
  const [selectedFirm, setSelectedFirm] = useState<string>('All')
  const [selectedMarket, setSelectedMarket] = useState<'All' | MarketType>('All')
  const [selectedDiscount, setSelectedDiscount] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('discount')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const normalizedSearch = search.trim().toLowerCase()

  const firmNames = useMemo(() => {
    const names = new Set(deals.map(d => d.firmName))
    return ['All', ...Array.from(names).sort()]
  }, [deals])

  const filteredDeals = useMemo(() => {
    const filtered = deals.filter((deal) => {
      const firmOk = selectedFirm === 'All' || deal.firmName === selectedFirm
      const marketOk = selectedMarket === 'All' || deal.category === selectedMarket
      const discountOk = selectedDiscount === 'all' || deal.discountPercent >= Number(selectedDiscount)
      const searchOk = !normalizedSearch ||
        deal.firmName.toLowerCase().includes(normalizedSearch) ||
        deal.couponCode.toLowerCase().includes(normalizedSearch) ||
        deal.category.toLowerCase().includes(normalizedSearch)
      return firmOk && marketOk && discountOk && searchOk
    })

    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'discount':
          return b.discountPercent - a.discountPercent
        case 'price-low':
          return a.challengeFee - b.challengeFee
        case 'price-high':
          return b.challengeFee - a.challengeFee
        case 'newest':
          return a.expiryDate === 'No expiry' ? 1 : b.expiryDate === 'No expiry' ? -1 :
            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        default:
          return 0
      }
    })
  }, [deals, selectedFirm, selectedMarket, selectedDiscount, normalizedSearch, sortKey])

  const featuredDeals = useMemo(() => filteredDeals.filter(isFeaturedDeal), [filteredDeals])
  const hotDeals = useMemo(() => filteredDeals.filter(isHotDeal), [filteredDeals])

  const activeFilterCount = [
    selectedFirm !== 'All',
    selectedMarket !== 'All',
    selectedDiscount !== 'all',
    normalizedSearch.length > 0,
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setSelectedFirm('All')
    setSelectedMarket('All')
    setSelectedDiscount('all')
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(var(--primary)/0.06),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_hsl(var(--primary)/0.04),_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-22">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <BadgePercent className="h-3.5 w-3.5 text-primary" />
                Exclusive Deals
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Prop Firm Deals
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Save on funded account challenges with verified coupon codes and exclusive discounts.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <StatCard label="Active Deals" value={overview.totalLiveDeals.toString()} icon={Tag} />
              <StatCard label="Firms" value={overview.totalTrackedFirms.toString()} icon={Building2} />
              <StatCard label="Accounts" value={overview.totalAccounts.toLocaleString()} icon={Wallet} />
              <StatCard label="Paid Out" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} icon={Banknote} />
            </div>
          </div>


          <div className="mt-8 relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals by firm name, coupon code, or category..."
              className="w-full rounded-xl border border-border bg-card px-11 py-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>


          <div className="mt-4 flex flex-wrap items-center gap-2">

            <div className="relative">
              <select
                value={selectedFirm}
                onChange={(e) => setSelectedFirm(e.target.value)}
                className="appearance-none rounded-full border border-border bg-card px-4 py-2 pr-8 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus:border-primary"
              >
                {firmNames.map(name => (
                  <option key={name} value={name}>{name === 'All' ? 'All Firms' : name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            </div>


            {marketOptions.map(market => (
              <button
                key={market}
                type="button"
                onClick={() => setSelectedMarket(market)}
                className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
                  selectedMarket === market
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {market === 'All' ? 'All Markets' : market}
              </button>
            ))}


            <div className="relative">
              <select
                value={selectedDiscount}
                onChange={(e) => setSelectedDiscount(e.target.value)}
                className="appearance-none rounded-full border border-border bg-card px-4 py-2 pr-8 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus:border-primary"
              >
                {discountOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            </div>


            <div className="relative ml-auto">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="appearance-none rounded-full border border-border bg-card px-4 py-2 pr-8 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus:border-primary"
              >
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Expiring Soon</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            </div>

            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear ({activeFilterCount})
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {hadFetchError ? (
          <div className="mb-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 text-sm text-yellow-600">
            Some deal data is temporarily unavailable. The page will refresh automatically.
          </div>
        ) : null}


        {featuredDeals.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="Featured Deals"
              subtitle="Highest discounts available right now"
              icon={Sparkles}
              badge={`${featuredDeals.length} deals`}
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredDeals.map((deal) => {
                const firm = firms.find(f => f.id === deal.firmId)
                return (
                  <MarketplaceDealCard
                    key={deal.id}
                    deal={deal}
                    firm={firm}
                    localePrefix={localePrefix}
                    onCopyCode={copyCode}
                    copiedCode={copiedCode}
                    featured
                  />
                )
              })}
            </div>
          </section>
        )}


        {hotDeals.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="Hot Deals"
              subtitle="Limited time offers expiring soon"
              icon={Flame}
              badge={`${hotDeals.length} expiring`}
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hotDeals.map((deal) => {
                const firm = firms.find(f => f.id === deal.firmId)
                return (
                  <MarketplaceDealCard
                    key={deal.id}
                    deal={deal}
                    firm={firm}
                    localePrefix={localePrefix}
                    onCopyCode={copyCode}
                    copiedCode={copiedCode}
                    hot
                  />
                )
              })}
            </div>
          </section>
        )}


        <section>
          <SectionHeader
            title="All Deals"
            subtitle="Browse every active discount and promotion"
            icon={Tag}
            badge={`${filteredDeals.length} deals`}
          />
          {filteredDeals.length === 0 ? (
            <EmptyState
              message="No deals match your filters."
              onClear={clearFilters}
              hasFilters={activeFilterCount > 0}
            />
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDeals.map((deal) => {
                const firm = firms.find(f => f.id === deal.firmId)
                return (
                  <MarketplaceDealCard
                    key={deal.id}
                    deal={deal}
                    firm={firm}
                    localePrefix={localePrefix}
                    onCopyCode={copyCode}
                    copiedCode={copiedCode}
                  />
                )
              })}
            </div>
          )}
        </section>


        <p className="mt-12 text-center text-xs text-muted-foreground">
          Last updated: {lastUpdated ?? 'Unavailable'}
        </p>
      </div>
    </div>
  )
}

function MarketplaceDealCard({
  deal,
  firm,
  localePrefix,
  onCopyCode,
  copiedCode,
  featured = false,
  hot = false,
}: {
  deal: DealItem
  firm: UnifiedFirm | undefined
  localePrefix: string
  onCopyCode: (code: string) => void
  copiedCode: string | null
  featured?: boolean
  hot?: boolean
}) {
  const originalPrice = getOriginalPrice(deal, firm)
  const discountedPrice = deal.challengeFee
  const daysLeft = getDaysLeft(deal.expiryDate)
  const isCopied = copiedCode === deal.couponCode

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-lg ${
      featured ? 'border-primary/30 hover:border-primary/50' : 'border-border hover:border-border'
    }`}>

      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <div className="flex items-center gap-2">
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-2.5 w-2.5" />
              Featured
            </span>
          )}
          {hot && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400">
              <Flame className="h-2.5 w-2.5" />
              Hot
            </span>
          )}
        </div>
        {deal.discountPercent > 0 && (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-400">
            -{deal.discountPercent}%
          </span>
        )}
      </div>


      <div className="flex items-center gap-3 px-4 pt-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-bold text-foreground">
          {deal.logoUrl ? (
            <img src={deal.logoUrl} alt={deal.firmName} className="h-6 w-6 rounded object-contain" />
          ) : (
            deal.firmName.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`${localePrefix}/firm/${deal.firmSlug}`}
            className="block truncate text-sm font-bold text-foreground transition-colors hover:text-primary"
          >
            {deal.firmName}
          </Link>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {deal.category} · {deal.platform}
          </p>
        </div>
      </div>


      <div className="px-4 pt-4">
        <div className="flex items-baseline gap-2">
          {originalPrice > discountedPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {formatPrice(discountedPrice)}
          </span>
        </div>
        {originalPrice > discountedPrice && (
          <p className="mt-0.5 text-xs text-emerald-400">
            You save {formatPrice(originalPrice - discountedPrice)}
          </p>
        )}
      </div>


      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Coupon Code</p>
            <p className="font-mono text-sm font-semibold text-foreground">{deal.couponCode}</p>
          </div>
          <button
            type="button"
            onClick={() => onCopyCode(deal.couponCode)}
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Copy code"
          >
            {isCopied ? (
              <span className="text-[10px] font-semibold text-emerald-400">Copied!</span>
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>


      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        <MetaTag>{deal.payoutModel}</MetaTag>
        <MetaTag>{deal.drawdownType}</MetaTag>
        {daysLeft !== null && daysLeft <= 14 && (
          <MetaTag highlight>
            <Clock className="h-2.5 w-2.5" />
            {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
          </MetaTag>
        )}
      </div>


      <div className="mt-auto flex items-center gap-2 p-4 pt-4">
        <Link
          href={`${localePrefix}/firm/${deal.firmSlug}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs font-medium text-foreground transition-all hover:bg-muted"
        >
          View Firm
          <ArrowUpRight className="h-3 w-3" />
        </Link>
        {deal.claimUrl ? (
          <a
            href={deal.claimUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-sm"
          >
            Claim Deal
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <Link
            href={`${localePrefix}/firm/${deal.firmSlug}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-sm"
          >
            Get Deal
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </article>
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
    <div className="rounded-xl border border-border bg-card/80 p-3.5 backdrop-blur-sm sm:p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
}: {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {badge ? (
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {badge}
        </span>
      ) : null}
    </div>
  )
}

function MetaTag({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
      highlight
        ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
        : 'border-border bg-muted/50 text-muted-foreground'
    }`}>
      {children}
    </span>
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Filter className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-base font-medium text-foreground">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">Adjust the filters or check back later for new deals.</p>
      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  )
}
