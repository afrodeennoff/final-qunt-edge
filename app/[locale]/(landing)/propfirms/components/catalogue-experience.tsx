'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { ArrowRight, Banknote, Building2, Search, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import type { PropfirmCatalogueStats } from '../actions/types'
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
    stats: PropfirmCatalogueStats
  }>
}

type SortKey = 'accounts' | 'paidPayout' | 'accountValue' | 'refusedPayout'
type PayoutFilter = 'all' | 'high-paid' | 'low-refused'

const sortOptions: Array<{ key: SortKey; label: string; summaryLabel: string }> = [
  { key: 'accounts', label: 'Most accounts', summaryLabel: 'most accounts' },
  { key: 'paidPayout', label: 'Most paid', summaryLabel: 'most paid' },
  { key: 'accountValue', label: 'Largest value', summaryLabel: 'largest value' },
  { key: 'refusedPayout', label: 'Lowest refused', summaryLabel: 'lowest refused' },
]

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

  const filteredFirms = useMemo(() => {
    const normalized = deferredSearch.trim().toLowerCase()

    const next = firms.filter((firm) => {
      if (normalized && !firm.name.toLowerCase().includes(normalized)) return false
      if (payoutFilter === 'high-paid' && firm.stats.payouts.paidAmount <= 0) return false
      if (payoutFilter === 'low-refused' && firm.stats.payouts.refusedAmount > 0) return false
      return true
    })

    return next.sort((a, b) => {
      if (sortKey === 'paidPayout') return b.stats.payouts.paidAmount - a.stats.payouts.paidAmount
      if (sortKey === 'refusedPayout') return a.stats.payouts.refusedAmount - b.stats.payouts.refusedAmount
      if (sortKey === 'accountValue') return b.stats.totalAccountValue - a.stats.totalAccountValue
      return b.stats.accountsCount - a.stats.accountsCount
    })
  }, [deferredSearch, firms, payoutFilter, sortKey])

  const overview = useMemo(() => {
    return {
      totalAccounts: firms.reduce((sum, firm) => sum + firm.stats.accountsCount, 0),
      totalValue: firms.reduce((sum, firm) => sum + firm.stats.totalAccountValue, 0),
      totalPaid: firms.reduce((sum, firm) => sum + firm.stats.payouts.paidAmount, 0),
    }
  }, [firms])

  const topFirms = filteredFirms.slice(0, 3)
  const boardFirms = topFirms.length > 0 ? filteredFirms.slice(3) : filteredFirms
  const activeSort = sortOptions.find((option) => option.key === sortKey) ?? sortOptions[0]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_24%,hsl(var(--background))_100%)]">
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

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search prop firms..."
                className="h-12 w-full rounded-2xl border border-border/70 bg-background/80 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'all', label: 'All firms' },
                  { key: 'high-paid', label: 'High paid' },
                  { key: 'low-refused', label: 'Low refused' },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPayoutFilter(item.key)}
                    className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                      payoutFilter === item.key
                        ? 'border-foreground/15 bg-foreground text-background'
                        : 'border-border bg-background/70 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((item) => (
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

            <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.2rem] border border-border/60 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
              <span>
                {filteredFirms.length} result{filteredFirms.length === 1 ? '' : 's'} after filters
              </span>
              <span>
                Sorted by {activeSort.summaryLabel}
              </span>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Leaders</p>
            <div className="mt-4 space-y-3">
              {topFirms.map((firm, index) => (
                <Link
                  key={firm.key}
                  href={`/${locale}/firm/${firm.slug}`}
                  className="flex items-center justify-between rounded-[1rem] border border-border/60 bg-background/70 px-4 py-3 transition-colors hover:bg-background"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Rank #{index + 1}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{firm.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{firm.stats.accountsCount.toLocaleString()} accounts</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Catalogue board</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">All tracked firms</h2>
            </div>
          </div>

          {boardFirms.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {boardFirms.map((firm) => (
                <Link
                  key={firm.key}
                  href={`/${locale}/firm/${firm.slug}`}
                  className="group rounded-[1.4rem] border border-border/60 bg-background/75 p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-foreground">{firm.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{firm.accountTemplatesCount} account templates</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card px-3 py-2 text-right">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Paid count</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{firm.stats.payouts.paidCount}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <BoardMetric label="Accounts" value={firm.stats.accountsCount.toLocaleString()} />
                    <BoardMetric label="Account value" value={formatCompactCurrency(firm.stats.totalAccountValue)} />
                    <BoardMetric label="Paid out" value={formatCompactCurrency(firm.stats.payouts.paidAmount)} />
                    <BoardMetric label="Refused" value={formatCompactCurrency(firm.stats.payouts.refusedAmount)} />
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                    <p className="text-sm text-muted-foreground">{firm.stats.sizeBreakdown}</p>
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
              {filteredFirms.length === 0
                ? 'No firms match the current search and payout filters.'
                : 'All matching firms are already highlighted in the leaders panel above.'}
            </div>
          )}
        </section>
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

function BoardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-border/60 bg-card/65 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
