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
  Wallet,
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

  const normalizedSearch = search.trim().toLowerCase()

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

  const sortLabel = (key: SortKey) => {
    if (sortKey !== key) return ''
    return sortDirection === 'asc' ? 'ascending' : 'descending'
  }

  const onSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection('desc')
  }

  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/40 p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(88,129,255,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(28,200,138,0.14),_transparent_34%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  <BadgePercent className="h-3.5 w-3.5 text-v2-accent" />
                  Prop firm deals board
                </span>
                <h1 className="mt-6 max-w-4xl text-[clamp(2.9rem,6vw,5.8rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">
                  Compare deals faster.
                  <br />
                  Open firm profiles.
                  <br />
                  Validate the details.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/66 sm:text-lg">
                  This page is designed like a modern prop-firm marketplace: deal-first scanning up top, company cards with real context underneath, and a denser comparison table when you need to sort the whole market.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#firm-board" className="inline-flex items-center gap-2 rounded-full bg-v2-accent px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-v2-accent-hover">
                    Browse Firms
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a href="#deal-board" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]">
                    View Deals
                  </a>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricPanel label="Tracked firms" value={overview.totalTrackedFirms.toLocaleString()} icon={Building2} />
                <MetricPanel label="Live deals" value={overview.totalLiveDeals.toLocaleString()} icon={Wallet} />
                <MetricPanel label="Accounts tracked" value={overview.totalAccounts.toLocaleString()} icon={Landmark} />
                <MetricPanel label="Paid payouts" value={formatCompactCurrency(overview.totalPaidPayoutAmount)} icon={Banknote} />
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr]">
            <BoardPanel
              title="Featured deals radar"
              subtitle={`Futures and CFD coverage refreshed from PropFirmMatch on ${spotlights.updatedAt}`}
            >
              <div className="grid gap-3 md:grid-cols-2">
                {[...spotlights.futures.slice(0, 1), ...spotlights.cfd.slice(0, 1)].map((item, index) => (
                  <a
                    key={`${item.slug}-${index}`}
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/[0.04]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">{item.category} spotlight</p>
                      <p className="mt-2 text-sm text-white/60">{item.promoText}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/45" />
                  </a>
                ))}
              </div>
            </BoardPanel>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Filter className="h-5 w-5 text-v2-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Filter the market</h2>
                <p className="text-sm text-white/55">A cleaner control bar with less visual noise and stronger spacing.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative sm:col-span-2 lg:col-span-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search firms, payout model, or description..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-11 py-3 text-white outline-none placeholder:text-white/35 focus:border-v2-accent/50"
                />
              </div>
              <FilterSelect label="Market Type" value={market} onChange={setMarket} options={marketOptions} />
              <FilterSelect label="Platform" value={platform} onChange={setPlatform} options={platformOptions} />
              <FilterSelect label="Payout Model" value={payout} onChange={setPayout} options={payoutOptions} />
              <FilterSelect label="Drawdown Type" value={drawdown} onChange={setDrawdown} options={drawdownOptions} />
              <label className="space-y-2 text-sm">
                <span className="text-white/55">Price Range</span>
                <div className="relative">
                  <select
                    value={priceRange}
                    onChange={(event) => setPriceRange(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-v2-accent/50"
                  >
                    <option value="all">All prices</option>
                    <option value="0-99">$0 - $99</option>
                    <option value="100-199">$100 - $199</option>
                    <option value="200+">$200+</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                </div>
              </label>
            </div>
          </section>

          {hadFetchError ? (
            <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              Some deal data is temporarily unavailable, so parts of the market board may be incomplete while the catalogue refreshes.
            </section>
          ) : null}

          <section id="firm-board" className="space-y-5">
            <SectionIntro
              title="Firm board"
              body="A company-first board inspired by the better prop-firm directory layouts: quick facts, short descriptions, and clear next actions."
              count={`${filteredFirms.length} firms`}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredFirms.map((firm) => (
                <FirmBoardCard key={firm.id} localePrefix={localePrefix} firm={firm} />
              ))}
            </div>
          </section>

          <section id="deal-board" className="space-y-5">
            <SectionIntro
              title="Live deals"
              body="Deals stay front and center, but each card now carries enough company context to avoid blind clicking."
              count={`${filteredDeals.length} deals`}
            />
            {filteredDeals.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
                <p className="text-lg font-medium text-white">No matching deals right now.</p>
                <p className="mt-2 text-sm text-white/55">Adjust the filters or check again after the next catalogue refresh.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredDeals.map((deal) => {
                  const firm = firms.find((candidate) => candidate.id === deal.firmId)
                  return <DealCard key={deal.id} deal={deal} firm={firm} localePrefix={localePrefix} />
                })}
              </div>
            )}
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Comparison table</h2>
              <p className="mt-1 text-sm text-white/55">A dense market table for users who want the full directory view after scanning the cards.</p>
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 bg-white/[0.03] hover:bg-white/[0.03]">
                    <SortableHead label="Firm" onClick={() => onSort('name')} active={sortKey === 'name'} indicator={sortLabel('name')} />
                    <SortableHead label="Entry Fee" onClick={() => onSort('challengeFee')} active={sortKey === 'challengeFee'} indicator={sortLabel('challengeFee')} />
                    <SortableHead label="Split" onClick={() => onSort('profitSplit')} active={sortKey === 'profitSplit'} indicator={sortLabel('profitSplit')} />
                    <SortableHead label="Payout" onClick={() => onSort('payoutFrequency')} active={sortKey === 'payoutFrequency'} indicator={sortLabel('payoutFrequency')} />
                    <SortableHead label="Accounts" onClick={() => onSort('accountsCount')} active={sortKey === 'accountsCount'} indicator={sortLabel('accountsCount')} />
                    <SortableHead label="Paid Out" onClick={() => onSort('paidPayoutAmount')} active={sortKey === 'paidPayoutAmount'} indicator={sortLabel('paidPayoutAmount')} />
                    <SortableHead label="Reviews" onClick={() => onSort('rating')} active={sortKey === 'rating'} indicator={sortLabel('rating')} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFirms.map((firm) => (
                    <TableRow key={firm.id} className="border-white/10 hover:bg-white/[0.03]">
                      <TableCell className="font-medium text-white">
                        <Link href={`${localePrefix}/firm/${firm.slug}`} className="hover:text-v2-accent">{firm.name}</Link>
                      </TableCell>
                      <TableCell className="text-white/72">{formatChallengeFee(getLowestChallengeFee(firm))}</TableCell>
                      <TableCell className="text-white/72">{firm.profitSplit}</TableCell>
                      <TableCell className="text-white/72">{firm.payoutModel}</TableCell>
                      <TableCell className="text-white/72">{firm.catalogueStats.accountsCount.toLocaleString()}</TableCell>
                      <TableCell className="text-emerald-300">{formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)}</TableCell>
                      <TableCell className="text-white/72">{firm._count.reviews.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-4 md:hidden">
              {filteredFirms.map((firm) => (
                <article key={firm.id} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`${localePrefix}/firm/${firm.slug}`} className="text-lg font-semibold text-white hover:text-v2-accent">{firm.name}</Link>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60">
                      {firm.category}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <Term label="Entry Fee" value={formatChallengeFee(getLowestChallengeFee(firm))} />
                    <Term label="Payout" value={firm.payoutModel} />
                    <Term label="Accounts" value={firm.catalogueStats.accountsCount.toLocaleString()} />
                    <Term label="Paid Out" value={formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)} />
                    <Term label="Allocation" value={firm.maxAllocation} />
                    <Term label="Reviews" value={firm._count.reviews.toLocaleString()} />
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr]">
            <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">FAQ</h2>
              <p className="mt-1 text-sm text-white/55">Everything you need to know about this market board.</p>
              <Accordion type="single" collapsible className="mt-6">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`} className="mb-3 rounded-2xl border border-white/10 bg-black/20 px-5">
                    <AccordionTrigger className="text-left text-white hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/60">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-4 text-xs text-white/45">
                Updated: {lastUpdated ?? 'Unavailable'}
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  )
}

function MetricPanel({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
          <Icon className="h-5 w-5 text-v2-accent" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function BoardPanel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-white/55">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function SectionIntro({ title, body, count }: { title: string; body: string; count: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/55">{body}</p>
      </div>
      <p className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
        {count}
      </p>
    </div>
  )
}

function FirmBoardCard({
  firm,
  localePrefix,
}: {
  firm: UnifiedFirm
  localePrefix: string
}) {
  return (
    <article className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-sm font-semibold text-v2-accent">
              {firm.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <Link href={`${localePrefix}/firm/${firm.slug}`} className="text-lg font-semibold text-white hover:text-v2-accent">
                {firm.name}
              </Link>
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">{firm.category} • {firm.platform}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/62">
            {firm.shortDesc ?? firm.description ?? 'No editorial summary available yet.'}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
          {firm.spotlight ? 'Tracked' : 'Internal'}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Lowest entry" value={formatChallengeFee(getLowestChallengeFee(firm))} />
        <MiniMetric label="Accounts" value={firm.catalogueStats.accountsCount.toLocaleString()} />
        <MiniMetric label="Value tracked" value={formatCompactCurrency(firm.catalogueStats.totalAccountValue)} />
        <MiniMetric label="Paid payouts" value={formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/55">
        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1">{firm.payoutModel} payouts</span>
        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1">{firm.drawdownType} drawdown</span>
        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1">{firm.profitSplit} split</span>
        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1">{firm.maxAllocation} max allocation</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`${localePrefix}/firm/${firm.slug}`} className="inline-flex items-center gap-2 rounded-full bg-v2-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-v2-accent-hover">
          Open Company
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        {firm.referralUrl ? (
          <a href={firm.referralUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]">
            Visit Site
            <ArrowUpRight className="h-4 w-4" />
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
}: {
  deal: DealItem
  firm: UnifiedFirm | undefined
  localePrefix: string
}) {
  return (
    <article className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-sm font-semibold text-v2-accent">
            {deal.firmName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <Link href={`${localePrefix}/firm/${deal.firmSlug}`} className="font-semibold text-white hover:text-v2-accent">
              {deal.firmName}
            </Link>
            <p className="text-xs uppercase tracking-[0.14em] text-white/45">{deal.category} • {deal.platform}</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
          Verified
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-semibold tracking-[-0.04em] text-white">{deal.discountPercent}% OFF</p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm font-medium text-white/72">
            Code <span className="text-v2-accent">{deal.couponCode}</span>
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55">
          {deal.expiryDate}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-white/60">
        {firm?.shortDesc ?? firm?.description ?? 'Open the company profile for rule details, payouts, and tracked account metrics.'}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MiniMetric label="Challenge Fee" value={formatChallengeFee(deal.challengeFee)} />
        <MiniMetric label="Payout model" value={deal.payoutModel} />
        <MiniMetric label="Accounts" value={firm ? firm.catalogueStats.accountsCount.toLocaleString() : '0'} />
        <MiniMetric label="Paid Out" value={firm ? formatCompactCurrency(firm.catalogueStats.paidPayoutAmount) : '$0'} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`${localePrefix}/firm/${deal.firmSlug}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]">
          Open Company
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        {deal.claimUrl ? (
          <a href={deal.claimUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-v2-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-v2-accent-hover">
            Claim Deal
            <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </article>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
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
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
          active ? 'text-v2-accent' : 'text-white/55 hover:text-white'
        }`}
        aria-label={`Sort by ${label}${indicator ? ` (${indicator})` : ''}`}
      >
        {label}
        {active ? (
          indicator.includes('ascending') ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">{label}</dt>
      <dd className="mt-1 font-medium text-white">{value}</dd>
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
      <span className="text-white/55">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="w-full appearance-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-v2-accent/50"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
      </div>
    </label>
  )
}
