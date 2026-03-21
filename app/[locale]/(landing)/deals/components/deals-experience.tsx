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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Filter, Star, ChevronDown, ChevronUp, CheckCircle2, Clock, TrendingUp, Shield } from 'lucide-react'
import type {
  DealItem,
  DrawdownType,
  FaqItem,
  UnifiedFirm,
  MarketType,
  TradingPlatform,
  PayoutModel,
} from '@/server/deals'


type SortKey =
  | 'name'
  | 'challengeFee'
  | 'profitSplit'
  | 'drawdownType'
  | 'payoutFrequency'
  | 'maxAllocation'
  | 'rating'

type SortDirection = 'asc' | 'desc'

interface Props {
  deals: DealItem[]
  firms: UnifiedFirm[]
  faqs: FaqItem[]
  lastUpdated: string
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
  const parsed = Number(maxAllocation.replace('$', '').replace('K', '000').replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function DealsExperience({ deals, firms, faqs, lastUpdated }: Props) {
  const [search, setSearch] = useState('')
  const [market, setMarket] = useState<'All' | MarketType>('All')
  const [platform, setPlatform] = useState<'All' | TradingPlatform>('All')
  const [payout, setPayout] = useState<'All' | PayoutModel>('All')
  const [drawdown, setDrawdown] = useState<'All' | DrawdownType>('All')
  const [priceRange, setPriceRange] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('rating')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const normalizedSearch = search.trim().toLowerCase()

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const marketOk = market === 'All' || deal.category === market
      const platformOk = platform === 'All' || deal.platform === platform
      const payoutOk = payout === 'All' || deal.payoutModel === payout
      const drawdownOk = drawdown === 'All' || deal.drawdownType === drawdown
      const priceOk = priceMatch(deal.challengeFee, priceRange)
      const searchOk = !normalizedSearch || deal.firmName.toLowerCase().includes(normalizedSearch)
      return marketOk && platformOk && payoutOk && drawdownOk && priceOk && searchOk
    })
  }, [deals, market, platform, payout, drawdown, priceRange, normalizedSearch])

  const filteredFirms = useMemo(() => {
    const base = firms.filter((firm) => {
      const marketOk = market === 'All' || firm.category === market
      const platformOk = platform === 'All' || firm.platform === platform
      const payoutOk = payout === 'All' || firm.payoutModel === payout
      const drawdownOk = drawdown === 'All' || firm.drawdownType === drawdown
      const priceOk = priceMatch(firm.coupons[0]?.challengeFee ?? 0, priceRange)
      const searchOk = !normalizedSearch || firm.name.toLowerCase().includes(normalizedSearch)
      return marketOk && platformOk && payoutOk && drawdownOk && priceOk && searchOk
    })

    return [...base].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name) * dir
        case 'challengeFee': {
          const feeA = a.coupons[0]?.challengeFee ?? 0
          const feeB = b.coupons[0]?.challengeFee ?? 0
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
        case 'rating':
        default:
          return (a._count.reviews - b._count.reviews) * dir
      }
    })
  }, [firms, market, platform, payout, drawdown, priceRange, normalizedSearch, sortKey, sortDirection])

  const onSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection('desc')
  }

  const sortLabel = (key: SortKey) => {
    if (sortKey !== key) return ''
    return sortDirection === 'asc' ? 'ascending' : 'descending'
  }

  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="max-w-5xl mx-auto px-v2-6 py-v2-16">
        <div className="space-y-10">
          <div className="space-y-10">
            <div className="space-y-10">
              {/* Hero Section with V2 Glassmorphism */}
              <section className="relative overflow-hidden rounded-v2-lg border border-v2-border bg-v2-bg-surface p-8 sm:p-12">
                <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-v2-accent/15 blur-[100px]" />
                <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-v2-accent/10 blur-[80px]" />
                <div className="pointer-events-none absolute top-1/2 left-1/3 h-32 w-32 rounded-full bg-v2-accent/8 blur-[60px]" />

                <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-v2-border-accent bg-v2-accent-subtle px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-v2-accent">
                      <Star className="h-3.5 w-3.5" />
                      Prop Firm Deals & Comparison
                    </span>
                    <h1 className="mt-6 text-4xl font-black tracking-tight text-v2-text-primary sm:text-5xl lg:text-6xl">
                      Find verified{' '}
                      <span className="bg-gradient-to-r from-v2-accent via-v2-accent/80 to-v2-accent/60 bg-clip-text text-transparent">
                        discounts
                      </span>{' '}
                      and compare firms fast
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg text-v2-text-secondary leading-relaxed">
                      Explore fresh promo codes, filter by your preferred rule set, and evaluate firm structures before committing.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      <a 
                        href="#deals-grid" 
                        className="inline-flex items-center gap-2 rounded-full bg-v2-accent px-6 py-3 text-sm font-semibold text-v2-accent-foreground transition-all duration-200 hover:bg-v2-accent-hover hover:shadow-lg hover:shadow-v2-accent/25"
                      >
                        Browse Deals
                        <ChevronDown className="h-4 w-4" />
                      </a>
                      <a 
                        href="#comparison-table" 
                        className="inline-flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-elevated px-6 py-3 text-sm font-semibold text-v2-text-primary transition-all duration-200 hover:bg-v2-bg-hover"
                      >
                        Compare Firms
                      </a>
                    </div>
                  </div>
                  
                  {/* Stats Panel with V2 Glass Effect */}
                  <div className="rounded-v2-lg border border-v2-border bg-v2-bg-surface p-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3 rounded-v2-md border border-v2-border-subtle bg-v2-bg-elevated p-4 transition-all duration-200 hover:border-v2-border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-v2-sm bg-v2-accent-subtle">
                          <Shield className="h-5 w-5 text-v2-accent" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.1em] text-v2-text-tertiary">Tracked Firms</p>
                          <p className="text-2xl font-bold text-v2-text-primary">{firms.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-v2-md border border-v2-border-subtle bg-v2-bg-elevated p-4 transition-all duration-200 hover:border-v2-border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-v2-sm bg-v2-accent-subtle">
                          <TrendingUp className="h-5 w-5 text-v2-accent" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.1em] text-v2-text-tertiary">Live Deals</p>
                          <p className="text-2xl font-bold text-v2-text-primary">{deals.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-v2-md border border-v2-border-subtle bg-v2-bg-elevated p-4 transition-all duration-200 hover:border-v2-border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-v2-sm bg-v2-accent-subtle">
                          <Clock className="h-5 w-5 text-v2-accent" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.1em] text-v2-text-tertiary">Last Updated</p>
                          <p className="text-lg font-semibold text-v2-text-primary">{lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Enhanced Filter Section with Glassmorphism */}
              <section className="rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-xl sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                    <Filter className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Filter and Search</h2>
                    <p className="text-sm text-muted-foreground">Narrow down to find your perfect match</p>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="relative sm:col-span-2 lg:col-span-3">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search for a firm name..."
                      className="w-full rounded-xl border border-primary/20 bg-background/80 px-12 py-3 text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <FilterSelect label="Market Type" value={market} onChange={setMarket} options={marketOptions} />
                  <FilterSelect label="Platform" value={platform} onChange={setPlatform} options={platformOptions} />
                  <FilterSelect label="Payout Model" value={payout} onChange={setPayout} options={payoutOptions} />
                  <FilterSelect label="Drawdown Type" value={drawdown} onChange={setDrawdown} options={drawdownOptions} />
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Price Range</span>
                    <div className="relative">
                      <select
                        value={priceRange}
                        onChange={(event) => setPriceRange(event.target.value)}
                        className="w-full appearance-none rounded-xl border border-primary/20 bg-background/80 px-4 py-3 text-foreground outline-none transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="all">All prices</option>
                        <option value="0-99">$0 - $99</option>
                        <option value="100-199">$100 - $199</option>
                        <option value="200+">$200+</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </label>
                </div>
              </section>

              {/* Featured Deals Section with Enhanced Cards */}
              <section id="deals-grid" className="space-y-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured & Latest Deals</h2>
                    <p className="mt-1 text-muted-foreground">Handpicked offers with exclusive discount codes</p>
                  </div>
                  <p className="rounded-full bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary">
                    {filteredDeals.length} results
                  </p>
                </div>
                
                {filteredDeals.length === 0 ? (
                  <div className="rounded-2xl border border-primary/20 bg-card/60 p-12 text-center backdrop-blur-xl">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No Deals Available</h3>
                    <p className="mt-2 text-muted-foreground">
                      Deals are currently being updated. Check back soon for exclusive prop firm discounts.
                    </p>
                  </div>
                ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDeals.map((deal, index) => (
                    <article 
                      key={deal.id} 
                      className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      
                      <div className="relative">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                              {deal.firmName.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="font-semibold text-foreground">{deal.firmName}</p>
                          </div>
                          <span className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        </div>
                        
                        <div className="mt-5">
                          <p className="text-4xl font-black text-foreground">{deal.discountPercent}% OFF</p>
                          <p className="mt-2 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-foreground">
                            <span className="text-primary">Code:</span> {deal.couponCode}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Expires: {deal.expiryDate}</span>
                        </div>
                        
                        <a
                          href={deal.claimUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
                        >
                          Claim Deal
                          <TrendingUp className="h-4 w-4" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
                )}
              </section>

              {/* Enhanced Comparison Table */}
              <section id="comparison-table" className="rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-xl sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Comparison Table</h2>
                  <p className="mt-1 text-muted-foreground">Sortable columns — click to reorder</p>
                </div>

                <div className="hidden overflow-hidden rounded-xl border border-primary/20 bg-card/40 md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-primary/20 bg-primary/5 hover:bg-primary/10">
                        <SortableHead label="Firm" onClick={() => onSort('name')} active={sortKey === 'name'} indicator={sortLabel('name')} />
                        <SortableHead label="Challenge Fee" onClick={() => onSort('challengeFee')} active={sortKey === 'challengeFee'} indicator={sortLabel('challengeFee')} />
                        <SortableHead label="Profit Split" onClick={() => onSort('profitSplit')} active={sortKey === 'profitSplit'} indicator={sortLabel('profitSplit')} />
                        <SortableHead label="Drawdown" onClick={() => onSort('drawdownType')} active={sortKey === 'drawdownType'} indicator={sortLabel('drawdownType')} />
                        <SortableHead label="Payout Frequency" onClick={() => onSort('payoutFrequency')} active={sortKey === 'payoutFrequency'} indicator={sortLabel('payoutFrequency')} />
                        <SortableHead label="Max Allocation" onClick={() => onSort('maxAllocation')} active={sortKey === 'maxAllocation'} indicator={sortLabel('maxAllocation')} />
                        <SortableHead label="Reviews" onClick={() => onSort('rating')} active={sortKey === 'rating'} indicator={sortLabel('rating')} />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFirms.map((firm) => (
                        <TableRow key={firm.id} className="border-primary/10 transition-colors hover:bg-primary/5">
                          <TableCell className="font-semibold text-foreground">
                            <Link href={`/firm/${firm.slug}`} className="hover:text-primary hover:underline">
                              {firm.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-foreground">
                            ${firm.coupons[0]?.challengeFee ?? '-'}
                          </TableCell>
                          <TableCell className="text-foreground">{firm.profitSplit}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                              {firm.drawdownType}
                            </span>
                          </TableCell>
                          <TableCell className="text-foreground">{firm.payoutModel}</TableCell>
                          <TableCell className="text-foreground">{firm.maxAllocation}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-foreground">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="font-semibold">{firm._count.reviews}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 grid gap-4 md:hidden">
                  {filteredFirms.map((firm) => (
                    <article key={firm.id} className="rounded-xl border border-primary/20 bg-card/60 p-5 backdrop-blur-xl transition-all duration-200 hover:border-primary/40">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          <Link href={`/firm/${firm.slug}`} className="hover:text-primary hover:underline">
                            {firm.name}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-semibold text-foreground">{firm._count.reviews} reviews</span>
                        </div>
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-4">
                        <Term label="Challenge Fee" value={`$${firm.coupons[0]?.challengeFee ?? '-'}`} />
                        <Term label="Profit Split" value={firm.profitSplit} />
                        <Term label="Drawdown" value={firm.drawdownType} />
                        <Term label="Payout" value={firm.payoutModel} />
                        <Term label="Allocation" value={firm.maxAllocation} />
                        <Term label="Platform" value={firm.platform} />
                      </dl>
                    </article>
                  ))}
                </div>
              </section>

              {/* Trust Section with Icons */}
              <section className="rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-xl sm:p-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">How trust is built</h2>
                
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="group relative overflow-hidden rounded-xl border border-primary/20 bg-card/40 p-5 transition-all duration-200 hover:border-primary/40">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">1. Deal Review</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Deal link and code are manually reviewed by our team.</p>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-xl border border-primary/20 bg-card/40 p-5 transition-all duration-200 hover:border-primary/40">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">2. Terms Validation</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Terms are validated against current checkout rules.</p>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-xl border border-primary/20 bg-card/40 p-5 transition-all duration-200 hover:border-primary/40">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">3. Active Maintenance</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Expired offers are regularly removed from the board.</p>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>Last updated: {lastUpdated}</p>
                  <p className="text-xs">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-primary">●</span> Affiliate disclosure:
                    </span>{' '}
                    some claim links may include referral parameters. This does not increase your purchase cost.
                  </p>
                </div>
              </section>

              {/* CTA Sections */}
              <section className="grid gap-5 md:grid-cols-2">
                <article className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Join the community</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Discuss rule changes, strategy fit, and new offers with other traders.</p>
                    <Link 
                      href="/community" 
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
                    >
                      Open Community
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Link>
                  </div>
                </article>
                
                <article className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Use trader tools</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Launch your planner workflow with matchup and cost tools.</p>
                    <Link 
                      href="/deals/calculator" 
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-card/50 px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-card/80"
                    >
                      Open Tracker / Calculator
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Link>
                  </div>
                </article>
              </section>

              {/* Enhanced FAQ Accordion */}
              <section className="rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-xl sm:p-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
                <p className="mt-1 text-muted-foreground">Everything you need to know about prop firm deals</p>
                
                <Accordion type="single" collapsible className="mt-6">
                  {faqs.map((faq, index) => (
                    <AccordionItem 
                      key={faq.question} 
                      value={`item-${index}`} 
                      className="mb-3 rounded-xl border border-primary/20 bg-card/40 px-5 transition-all duration-200 hover:border-primary/40"
                    >
                      <AccordionTrigger className="py-4 text-left font-semibold text-foreground hover:no-underline [&[data-state=open]>svg]:text-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}

function SortableHead({
  label,
  onClick,
  active,
  indicator,
}: {
  label: string
  onClick: () => void
  active: boolean
  indicator: string
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left font-semibold transition-all duration-200 ${
          active 
            ? 'bg-primary/10 text-primary' 
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
        }`}
        aria-label={`Sort by ${label}${indicator ? ` (${indicator})` : ''}`}
      >
        {label}
        <span aria-hidden="true" className="flex flex-col">
          {active ? (
            indicator.includes('ascending') ? (
              <ChevronUp className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-primary" />
            )
          ) : (
            <div className="flex flex-col -space-y-1">
              <ChevronUp className="h-2.5 w-2.5 opacity-40" />
              <ChevronDown className="h-2.5 w-2.5 opacity-40" />
            </div>
          )}
        </span>
      </button>
    </TableHead>
  )
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

function FilterSelect<T extends string>({
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
    <label className="space-y-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="w-full appearance-none rounded-xl border border-primary/20 bg-background/80 px-4 py-3 text-foreground outline-none transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  )
}
