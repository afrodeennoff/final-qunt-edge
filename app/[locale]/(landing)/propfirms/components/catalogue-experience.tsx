'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import {
  ArrowRight,
  Banknote,
  Building2,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import type { PropfirmCatalogueStats } from '../actions/types'
import { StatsSummaryRow } from './stats-summary-row'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'
import {
  unifiedChipClassName,
  unifiedGhostActionClassName,
  unifiedHeroPanelClassName,
  unifiedInsetPanelClassName,
  unifiedMetricPanelClassName,
  unifiedPrimaryActionClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

interface PropFirmCatalogueExperienceProps {
  locale: string
  title: string
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

type PayoutFilter = 'all' | 'high-paid' | 'low-refused'
type PlatformFilter = 'all' | 'Tradovate' | 'Rithmic' | 'MetaTrader 5' | 'cTrader' | 'DXtrade'
type ChallengeFilter = 'all' | 'instant' | 'evaluation'

const RegisteredAccountsChart = dynamic(
  () => import('./registered-accounts-chart').then((mod) => mod.RegisteredAccountsChart),
  {
    ssr: false,
    loading: () => (
      <section className={cn(unifiedSectionPanelClassName, 'min-h-[420px] animate-pulse bg-card/45')} />
    ),
  },
)

function matchesSearch(
  firm: PropFirmCatalogueExperienceProps['firms'][number],
  normalizedSearch: string,
): boolean {
  if (!normalizedSearch) return true
  return `${firm.name} ${firm.platform} ${firm.payoutModel} ${firm.drawdownType} ${firm.category}`
    .toLowerCase()
    .includes(normalizedSearch)
}

function matchesPayoutFilter(
  firm: PropFirmCatalogueExperienceProps['firms'][number],
  payoutFilter: PayoutFilter,
): boolean {
  if (payoutFilter === 'high-paid') return firm.stats.payouts.paidAmount > 0
  if (payoutFilter === 'low-refused') return firm.stats.payouts.refusedAmount <= 0
  return true
}

function matchesPlatformFilter(
  firm: PropFirmCatalogueExperienceProps['firms'][number],
  platformFilter: PlatformFilter,
): boolean {
  return platformFilter === 'all' || firm.platform === platformFilter
}

function matchesChallengeFilter(
  firm: PropFirmCatalogueExperienceProps['firms'][number],
  challengeFilter: ChallengeFilter,
): boolean {
  if (challengeFilter === 'instant') return firm.hasInstantFunding
  if (challengeFilter === 'evaluation') return !firm.hasInstantFunding
  return true
}

function sortFirms(firms: PropFirmCatalogueExperienceProps['firms']) {
  return [...firms].sort((a, b) => b.stats.accountsCount - a.stats.accountsCount)
}

export function PropFirmCatalogueExperience({
  locale,
  title,
  firms,
}: PropFirmCatalogueExperienceProps) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
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

    return sortFirms(next)
  }, [challengeFilter, deferredSearch, firms, payoutFilter, platformFilter])

  const overview = useMemo(() => {
    return {
      totalAccounts: firms.reduce((sum, firm) => sum + firm.stats.accountsCount, 0),
      totalValue: firms.reduce((sum, firm) => sum + firm.stats.totalAccountValue, 0),
      totalPaid: firms.reduce((sum, firm) => sum + firm.stats.payouts.paidAmount, 0),
    }
  }, [firms])

  const topFirms = filteredFirms.slice(0, 3)
  const registeredAccountsChartData = useMemo(() => {
    const ranked = firms
      .map((firm) => ({
        name: firm.name,
        accounts: firm.stats.accountsCount,
        sized: firm.stats.sizedAccountsCount,
        value: firm.stats.totalAccountValue,
        payouts: firm.stats.payouts.paidAmount,
      }))
      .sort((a, b) => b.accounts - a.accounts)

    return ranked
  }, [firms])
  const hasActiveFilters =
    search.trim().length > 0 ||
    payoutFilter !== 'all' ||
    platformFilter !== 'all' ||
    challengeFilter !== 'all'

  const resetFilters = () => {
    setSearch('')
    setPayoutFilter('all')
    setPlatformFilter('all')
    setChallengeFilter('all')
  }

  return (
    <UnifiedPageShell widthClassName="max-w-[1360px]" className="py-12 sm:py-16">
      <div className="flex flex-col gap-6 lg:gap-8">
        <section
          className={cn(
            unifiedHeroPanelClassName,
            'animate-fade-up-smooth grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8',
          )}
        >
          <div>
            <div className={cn(unifiedChipClassName, 'px-4 py-2')}>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Prop firm catalogue
            </div>
            <h1 className="mt-5 text-[clamp(2.25rem,5.4vw,4.8rem)] font-medium leading-[0.98] tracking-[-0.04em] text-foreground">
              {title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/deals`}
                className={cn(unifiedPrimaryActionClassName, 'px-5 py-3')}
              >
                Browse deals
              </Link>
              <Link href={`/${locale}`} className={cn(unifiedGhostActionClassName, 'px-5 py-3')}>
                Back to home
              </Link>
              <Link
                href={`/${locale}/best-trading-journal`}
                className={cn(unifiedGhostActionClassName, 'px-5 py-3')}
              >
                Best trading journal
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Tracked firms" value={firms.length.toString()} icon={Building2} />
            <StatCard
              label="Live accounts"
              value={overview.totalAccounts.toLocaleString()}
              icon={Wallet}
            />
            <StatCard
              label="Account value"
              value={formatCompactCurrency(overview.totalValue)}
              icon={ShieldCheck}
            />
            <StatCard
              label="Paid out"
              value={formatCompactCurrency(overview.totalPaid)}
              icon={Banknote}
            />
          </div>
        </section>

        {topFirms.length > 0 ? (
          <>
            <StatsSummaryRow />

            <RegisteredAccountsChart data={registeredAccountsChartData} />

            <section
              className={cn(
                unifiedSectionPanelClassName,
                'animate-fade-up-smooth animate-fade-up-smooth-d2 p-5 sm:p-6',
              )}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Leaders
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    Top firms in the current shortlist
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Compact ranking before the full board.
                </p>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-3">
                {topFirms.map((firm, index) => (
                  <Link
                    key={firm.key}
                    href={`/${locale}/firm/${firm.slug}`}
                    className={cn(
                      unifiedInsetPanelClassName,
                      'animate-scale-reveal px-4 py-4 transition-[transform,background-color,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/24 hover:bg-card/75',
                      index === 0 && 'animate-scale-reveal-d1',
                      index === 1 && 'animate-scale-reveal-d2',
                      index === 2 && 'animate-scale-reveal-d3',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Rank #{index + 1}
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {firm.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {firm.platform} • {firm.drawdownType}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCompactCurrency(firm.stats.payouts.paidAmount)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : null}

        <section
          className={cn(
            unifiedSectionPanelClassName,
            'animate-fade-up-smooth animate-fade-up-smooth-d3 p-3 sm:p-4',
          )}
        >
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/65" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search firm..."
                className="h-10 w-full rounded-full border border-border/40 bg-card/55 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/55 transition-[border-color,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus:border-primary/35 focus:bg-card/70 focus:shadow-[0_0_0_1px_hsl(var(--primary)/0.12)]"
              />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {filteredFirms.length} result{filteredFirms.length === 1 ? '' : 's'}
            </span>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className={cn(unifiedGhostActionClassName, 'shrink-0 px-3 py-1.5 text-xs')}
              >
                Reset
              </button>
            ) : null}
          </div>
        </section>

        <section
          className={cn(
            unifiedSectionPanelClassName,
            'animate-fade-up-smooth animate-fade-up-smooth-d4 p-5 sm:p-6',
          )}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Catalogue board
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                All tracked firms
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              The board is the main comparison surface.
            </p>
          </div>

          {filteredFirms.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFirms.map((firm, index) => (
                <Link
                  key={firm.key}
                  href={`/${locale}/firm/${firm.slug}`}
                  className={cn(
                    unifiedInsetPanelClassName,
                    'group animate-scale-reveal p-4 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/24 hover:bg-card/78 hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]',
                    index % 3 === 0 && 'animate-scale-reveal-d1',
                    index % 3 === 1 && 'animate-scale-reveal-d2',
                    index % 3 === 2 && 'animate-scale-reveal-d3',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-foreground">
                        {firm.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {firm.platform} • {firm.payoutModel} • {firm.accountTemplatesCount}{' '}
                        templates
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        firm.category === 'Forex'
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : firm.category === 'Futures'
                            ? 'border-success/30 bg-success/10 text-success'
                            : 'border-[hsl(var(--mk-border)/0.38)] bg-[hsl(var(--mk-surface)/0.76)] text-muted-foreground'
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

                  <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--mk-border)/0.38)] pt-4">
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
            <div className="mt-6 rounded-2xl border border-dashed border-border/35 bg-background/65 p-8 text-center text-sm text-muted-foreground">
              No firms match the current search and filter stack.
            </div>
          )}
        </section>
      </div>
    </UnifiedPageShell>
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
    <div className={cn(unifiedMetricPanelClassName, 'p-4')}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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
  const borderStyles = {
    paid: 'bg-[linear-gradient(135deg,hsl(var(--success)/0.12),hsl(var(--mk-surface-muted)/0.72))]',
    pending:
      'bg-[linear-gradient(135deg,hsl(var(--warning)/0.1),hsl(var(--mk-surface-muted)/0.72))]',
    refused:
      'bg-[linear-gradient(135deg,hsl(var(--semantic-error-bg)),hsl(var(--mk-surface-muted)/0.72))]',
  }

  const labelStyles = {
    paid: 'text-success',
    pending: 'text-warning',
    refused: 'text-semantic-error',
  }

  const amountStyles = {
    paid: 'text-success',
    pending: 'text-warning',
    refused: 'text-semantic-error',
  }

  const amountLabel = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  const countLabel = count === 0 ? 'No payouts' : `${count} payout${count === 1 ? '' : 's'}`

  return (
    <div className={cn(unifiedInsetPanelClassName, `px-4 py-3 ${borderStyles[variant]}`)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-base font-medium ${labelStyles[variant]}`}>{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{countLabel}</p>
        </div>
        <p className={`text-xl font-semibold tracking-tight ${amountStyles[variant]}`}>
          {amountLabel}
        </p>
      </div>
    </div>
  )
}

