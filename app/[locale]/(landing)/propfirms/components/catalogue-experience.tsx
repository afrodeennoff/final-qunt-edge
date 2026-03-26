'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { ArrowRight, Banknote, Building2, Search, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PropfirmCatalogueStats } from '../actions/types'
import { StatsSummaryRow } from './stats-summary-row'
import { formatCompactCurrency } from '@/lib/formatting/currency'

interface PropFirmCatalogueExperienceProps {
  locale: string
  title: string
  description: string
  firms: Array<{
    key: string
    slug: string
    name: string
    accountTemplatesCount: number
    platform: string
    payoutModel: string
    drawdownType: string
    category: string
    hasInstantFunding: boolean
    stats: PropfirmCatalogueStats
  }>
}

type SortKey = 'accounts' | 'paidPayout' | 'accountValue' | 'refusedPayout'
type PayoutFilter = 'all' | 'high-paid' | 'low-refused'
type PlatformFilter = 'all' | 'Tradovate' | 'Rithmic' | 'MetaTrader 5' | 'cTrader' | 'DXtrade'
type ChallengeFilter = 'all' | 'instant' | 'evaluation'

const sortOptions: Array<{ key: SortKey; label: string; summaryLabel: string }> = [
  { key: 'accounts', label: 'Most accounts', summaryLabel: 'most accounts' },
  { key: 'paidPayout', label: 'Most paid', summaryLabel: 'most paid' },
  { key: 'accountValue', label: 'Largest value', summaryLabel: 'largest value' },
  { key: 'refusedPayout', label: 'Lowest refused', summaryLabel: 'lowest refused' },
]

const payoutOptions: ReadonlyArray<{ key: PayoutFilter; label: string }> = [
  { key: 'all', label: 'All firms' },
  { key: 'high-paid', label: 'High paid' },
  { key: 'low-refused', label: 'Low refused' },
]

const challengeOptions: ReadonlyArray<{ key: ChallengeFilter; label: string }> = [
  { key: 'all', label: 'All challenges' },
  { key: 'instant', label: 'Instant funded' },
  { key: 'evaluation', label: 'Evaluation' },
]

function matchesSearch(
  firm: PropFirmCatalogueExperienceProps['firms'][number],
  normalizedSearch: string
): boolean {
  if (!normalizedSearch) return true
  return `${firm.name} ${firm.platform} ${firm.payoutModel} ${firm.drawdownType} ${firm.category}`
    .toLowerCase()
    .includes(normalizedSearch)
}

function matchesPayoutFilter(
  firm: PropFirmCatalogueExperienceProps['firms'][number],
  payoutFilter: PayoutFilter
): boolean {
  if (payoutFilter === 'high-paid') return firm.stats.payouts.paidAmount > 0
  if (payoutFilter === 'low-refused') return firm.stats.payouts.refusedAmount <= 0
  return true
}

function matchesPlatformFilter(
  firm: PropFirmCatalogueExperienceProps['firms'][number],
  platformFilter: PlatformFilter
): boolean {
  return platformFilter === 'all' || firm.platform === platformFilter
}

function matchesChallengeFilter(
  firm: PropFirmCatalogueExperienceProps['firms'][number],
  challengeFilter: ChallengeFilter
): boolean {
  if (challengeFilter === 'instant') return firm.hasInstantFunding
  if (challengeFilter === 'evaluation') return !firm.hasInstantFunding
  return true
}

function sortFirms(
  firms: PropFirmCatalogueExperienceProps['firms'],
  sortKey: SortKey
) {
  return [...firms].sort((a, b) => {
    if (sortKey === 'paidPayout') return b.stats.payouts.paidAmount - a.stats.payouts.paidAmount
    if (sortKey === 'refusedPayout') return a.stats.payouts.refusedAmount - b.stats.payouts.refusedAmount
    if (sortKey === 'accountValue') return b.stats.totalAccountValue - a.stats.totalAccountValue
    return b.stats.accountsCount - a.stats.accountsCount
  })
}

export function PropFirmCatalogueExperience({
  locale,
  title,
  description,
  firms,
}: PropFirmCatalogueExperienceProps) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [sortKey, setSortKey] = useState<SortKey>('accounts')
  const [payoutFilter, setPayoutFilter] = useState<PayoutFilter>('all')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [challengeFilter, setChallengeFilter] = useState<ChallengeFilter>('all')

  const filteredFirms = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase()

    const next = firms.filter((firm) => {
      return (
        matchesSearch(firm, normalizedSearch) &&
        matchesPayoutFilter(firm, payoutFilter) &&
        matchesPlatformFilter(firm, platformFilter) &&
        matchesChallengeFilter(firm, challengeFilter)
      )
    })

    return sortFirms(next, sortKey)
  }, [challengeFilter, deferredSearch, firms, payoutFilter, platformFilter, sortKey])

  const overview = useMemo(() => {
    return {
      totalAccounts: firms.reduce((sum, firm) => sum + firm.stats.accountsCount, 0),
      totalValue: firms.reduce((sum, firm) => sum + firm.stats.totalAccountValue, 0),
      totalPaid: firms.reduce((sum, firm) => sum + firm.stats.payouts.paidAmount, 0),
    }
  }, [firms])

  const topFirms = filteredFirms.slice(0, 3)
  const activeSort = sortOptions.find((option) => option.key === sortKey) ?? sortOptions[0]
  const leadingPlatforms = useMemo(() => {
    return Array.from(new Set(firms.map((firm) => firm.platform).filter((platform) => platform !== 'Unknown'))).sort()
  }, [firms])
  const registeredAccountsChartData = useMemo(() => {
    const ranked = firms
      .map((firm) => ({
        name: firm.name,
        accounts: firm.stats.accountsCount,
      }))
      .sort((a, b) => b.accounts - a.accounts)

    const nonZero = ranked.filter((entry) => entry.accounts > 0)
    return (nonZero.length > 0 ? nonZero : ranked).slice(0, 12)
  }, [firms])
  const hasActiveFilters =
    search.trim().length > 0 ||
    payoutFilter !== 'all' ||
    platformFilter !== 'all' ||
    challengeFilter !== 'all' ||
    sortKey !== 'accounts'

  const resetFilters = () => {
    setSearch('')
    setSortKey('accounts')
    setPayoutFilter('all')
    setPlatformFilter('all')
    setChallengeFilter('all')
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_20%,hsl(var(--background))_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-6 rounded-[2rem] border border-border/60 bg-card/50 p-6 shadow-[0_24px_120px_-60px_rgba(0,0,0,0.85)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Prop firm catalogue
            </div>
            <h1 className="mt-5 text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-foreground">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/${locale}/deals`} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                Browse deals
              </Link>
              <Link href={`/${locale}`} className="rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-medium text-foreground">
                Back to home
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Tracked firms" value={firms.length.toString()} icon={Building2} />
            <StatCard label="Live accounts" value={overview.totalAccounts.toLocaleString()} icon={Wallet} />
            <StatCard label="Account value" value={formatCompactCurrency(overview.totalValue)} icon={ShieldCheck} />
            <StatCard label="Paid out" value={formatCompactCurrency(overview.totalPaid)} icon={Banknote} />
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search prop firm"
                className="h-12 w-full rounded-2xl border border-border/70 bg-background/80 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <SortPillGroup<SortKey>
                options={sortOptions}
                selected={sortKey}
                onChange={setSortKey}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <FilterRow<PayoutFilter> options={payoutOptions} selected={payoutFilter} onChange={setPayoutFilter} />
            <FilterRow<ChallengeFilter> options={challengeOptions} selected={challengeFilter} onChange={setChallengeFilter} />
            <FilterRow<PlatformFilter>
              options={[{ key: 'all', label: 'All platforms' }, ...leadingPlatforms.map((platform) => ({ key: platform as PlatformFilter, label: platform }))]}
              selected={platformFilter}
              onChange={setPlatformFilter}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.2rem] border border-border/60 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
            <span>{filteredFirms.length} result{filteredFirms.length === 1 ? '' : 's'}</span>
            <span>Sorted by {activeSort.summaryLabel}</span>
          </div>

          {hasActiveFilters ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.2rem] border border-dashed border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
              <span>Minimal board mode is active. Reset to return to the full catalogue.</span>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card"
              >
                Reset
              </button>
            </div>
          ) : null}
        </section>

        {topFirms.length > 0 ? (
          <>
            <StatsSummaryRow />

            <RegisteredAccountsChart data={registeredAccountsChartData} />

            <section className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Leaders</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Top firms in the current shortlist</h2>
              </div>
              <p className="text-sm text-muted-foreground">Compact ranking before the full board.</p>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              {topFirms.map((firm, index) => (
                <Link
                  key={firm.key}
                  href={`/${locale}/firm/${firm.slug}`}
                  className="rounded-[1.2rem] border border-border/60 bg-background/70 px-4 py-4 transition-colors hover:bg-background"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Rank #{index + 1}</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{firm.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{firm.platform} • {firm.drawdownType}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatCompactCurrency(firm.stats.payouts.paidAmount)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          </>
        ) : null}

        <section className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Catalogue board</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">All tracked firms</h2>
            </div>
            <p className="text-sm text-muted-foreground">The board is the main comparison surface.</p>
          </div>

          {filteredFirms.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filteredFirms.map((firm) => (
                <Link
                  key={firm.key}
                  href={`/${locale}/firm/${firm.slug}`}
                  className="group rounded-[1.4rem] border border-border/60 bg-background/75 p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-foreground">{firm.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {firm.platform} • {firm.payoutModel} • {firm.accountTemplatesCount} templates
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        firm.category === 'Forex'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                          : firm.category === 'Futures'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                            : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      {firm.category}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-2">
                    <PayoutPill
                      label="Paid"
                      amount={firm.stats.payouts.paidAmount}
                      count={firm.stats.payouts.paidCount}
                      variant="paid"
                    />
                    <PayoutPill
                      label="Pending"
                      amount={firm.stats.payouts.pendingAmount}
                      count={firm.stats.payouts.pendingCount}
                      variant="pending"
                    />
                    <PayoutPill
                      label="Refused"
                      amount={firm.stats.payouts.refusedAmount}
                      count={firm.stats.payouts.refusedCount}
                      variant="refused"
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                    <p className="max-w-[75%] text-sm text-muted-foreground">
                      {firm.stats.sizeBreakdown === 'No sized accounts'
                        ? `${firm.stats.accountsCount.toLocaleString()} accounts • ${formatCompactCurrency(firm.stats.totalAccountValue)} total`
                        : firm.stats.sizeBreakdown}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      View firm
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.4rem] border border-dashed border-border bg-background/70 p-8 text-center text-sm text-muted-foreground">
              No firms match the current search and filter stack.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function SortPillGroup<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: ReadonlyArray<{ key: T; label: string }>
  selected: T
  onChange: (value: T) => void
}) {
  return (
    <>
      {options.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
            selected === item.key
              ? 'border-foreground/15 bg-foreground text-background'
              : 'border-border bg-background/70 text-muted-foreground hover:text-foreground'
          }`}
        >
          {item.label}
        </button>
      ))}
    </>
  )
}

function FilterRow<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: ReadonlyArray<{ key: T; label: string }>
  selected: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
            selected === item.key
              ? 'border-foreground/15 bg-foreground text-background'
              : 'border-border bg-background/70 text-muted-foreground hover:text-foreground'
          }`}
        >
          {item.label}
        </button>
      ))}
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
  icon: typeof Building2
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

function PayoutPill({
  label,
  amount,
  count,
  variant,
}: {
  label: string
  amount: number
  count: number
  variant: 'paid' | 'pending' | 'refused'
}) {
  const styles = {
    paid: 'border-emerald-500/30 bg-emerald-500/10 text-foreground',
    pending: 'border-yellow-500/30 bg-yellow-500/10 text-foreground',
    refused: 'border-red-500/30 bg-red-500/10 text-foreground',
  }
  const dotColors = {
    paid: 'bg-emerald-500',
    pending: 'bg-yellow-500',
    refused: 'bg-red-500',
  }
  return (
    <div className={`rounded-[1rem] border p-3 ${styles[variant]}`}>
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1.5 text-sm font-semibold">{formatCompactCurrency(amount)}</p>
      <p className="text-[10px] text-muted-foreground">
        {count} {count === 1 ? 'request' : 'requests'}
      </p>
    </div>
  )
}

function RegisteredAccountsChart({
  data,
}: {
  data: Array<{ name: string; accounts: number }>
}) {
  const topFirm = data[0]
  const totalRegistered = data.reduce((sum, entry) => sum + entry.accounts, 0)
  const maxRegistered = data.reduce((max, entry) => (entry.accounts > max ? entry.accounts : max), 0)

  return (
    <section className="rounded-[1.8rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--background))_100%)] p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.95)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">Chart Insights</p>
          <h2 className="mt-2 text-[clamp(1.4rem,3.2vw,2rem)] font-semibold tracking-tight text-foreground">Registered Accounts by Prop Firm</h2>
        </div>
        <p className="text-sm text-muted-foreground">Top firms ranked by total registered accounts.</p>
      </div>

      {data.length > 0 ? (
        <div className="mt-5 rounded-[1.2rem] border border-border/70 bg-[hsl(var(--background))] p-4 ring-1 ring-white/[0.03] sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-muted-foreground">
              {`Top firm: ${topFirm?.name ?? '—'}`}
            </span>
            <span className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-muted-foreground">
              {`Total shown: ${totalRegistered.toLocaleString()} accounts`}
            </span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {`Peak: ${maxRegistered.toLocaleString()}`}
            </span>
          </div>

          <div className="h-[400px] w-full overflow-x-auto">
            <div className="h-full min-w-[760px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 18, right: 16, left: 6, bottom: 72 }}
              >
                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke="hsl(var(--border) / 0.45)"
                  vertical
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={72}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tickFormatter={(value: string) => (value.length > 16 ? `${value.slice(0, 16)}…` : value)}
                  tick={{
                    fontSize: 12.5,
                    fill: 'hsl(var(--foreground) / 0.88)',
                  }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={44}
                  domain={[0, (max: number) => Math.max(5, Math.ceil(max * 1.18))]}
                  tick={{
                    fontSize: 12.5,
                    fill: 'hsl(var(--foreground) / 0.86)',
                  }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--primary) / 0.08)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--primary) / 0.3)',
                    borderRadius: 12,
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 10px 35px -20px rgba(0, 0, 0, 0.9)',
                  }}
                  formatter={(value: number) => [value.toLocaleString(), 'Registered Accounts']}
                />
                <Bar
                  dataKey="accounts"
                  name="Registered Accounts"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={52}
                  background={{ fill: 'hsl(var(--foreground) / 0.03)' }}
                >
                  <LabelList
                    dataKey="accounts"
                    position="top"
                    offset={8}
                    style={{
                      fill: 'hsl(var(--foreground))',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[1.2rem] border border-dashed border-border/60 bg-background/60 px-4 py-6 text-sm text-muted-foreground">
          No account registrations available yet.
        </div>
      )}
    </section>
  )
}
