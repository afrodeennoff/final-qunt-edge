'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { ArrowRight, Banknote, Building2, Search, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts'
import type { PropfirmCatalogueStats } from '../actions/types'
import { StatsSummaryRow } from './stats-summary-row'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { CardV2 as Card, CardV2Content as CardContent, CardV2Header as CardHeader, CardV2Title as CardTitle } from '@/components/ui/v2'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

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

type PayoutFilter = 'all' | 'high-paid' | 'low-refused'
type PlatformFilter = 'all' | 'Tradovate' | 'Rithmic' | 'MetaTrader 5' | 'cTrader' | 'DXtrade'
type ChallengeFilter = 'all' | 'instant' | 'evaluation'

const registeredAccountsChartConfig = {
  accounts: {
    label: 'Registered Accounts',
    color: 'hsl(var(--chart-1))',
  },
  value: {
    label: 'Account Value',
    color: 'hsl(var(--chart-2))',
  },
  payouts: {
    label: 'Payouts',
    color: 'hsl(var(--chart-3))',
  },
  sized: {
    label: 'Sized Accounts',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

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
  firms: PropFirmCatalogueExperienceProps['firms']
) {
  return [...firms].sort((a, b) => b.stats.accountsCount - a.stats.accountsCount)
}

export function PropFirmCatalogueExperience({
  locale,
  title,
  description,
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
    <div className="min-h-screen bg-[radial-gradient(860px_290px_at_14%_4%,hsl(var(--primary)/0.1),transparent_72%),radial-gradient(760px_260px_at_85%_4%,hsl(var(--accent)/0.09),transparent_74%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card)/0.22)_24%,hsl(var(--background))_100%)]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-7 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-6 rounded-[2rem] border border-[hsl(var(--mk-border)/0.74)] bg-[linear-gradient(160deg,hsl(var(--mk-surface)/0.88),hsl(var(--background)/0.7))] p-6 shadow-[0_34px_90px_-62px_hsl(var(--foreground)/0.95)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Prop firm catalogue
            </div>
            <h1 className="mt-5 text-[clamp(2.25rem,5.4vw,4.8rem)] font-medium leading-[0.98] tracking-[-0.04em] text-foreground">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-[1.55] text-muted-foreground sm:text-base">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/deals`}
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_28px_-14px_hsl(var(--primary)/0.75)]"
              >
                Browse deals
              </Link>
              <Link
                href={`/${locale}`}
                className="rounded-full border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface-muted)/0.66)] px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[hsl(var(--mk-surface-muted)/0.82)]"
              >
                Back to home
              </Link>
              <Link
                href={`/${locale}/best-trading-journal`}
                className="rounded-full border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface-muted)/0.66)] px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[hsl(var(--mk-surface-muted)/0.82)]"
              >
                Best trading journal
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

        {topFirms.length > 0 ? (
          <>
            <StatsSummaryRow />

            <RegisteredAccountsChart data={registeredAccountsChartData} />

            <section className="rounded-3xl border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface)/0.82)] p-5 shadow-[0_24px_60px_-44px_hsl(var(--foreground)/0.9)] sm:p-6">
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
                  className="rounded-2xl border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface-muted)/0.7)] px-4 py-4 transition-colors hover:bg-[hsl(var(--mk-surface-muted)/0.84)]"
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

        <section className="rounded-3xl border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface)/0.82)] p-3 shadow-[0_20px_44px_-34px_hsl(var(--foreground)/0.9)] sm:p-4">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/65" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search firm..."
                className="h-9 w-full rounded-full border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface-muted)/0.7)] pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/55 focus:border-primary/35"
              />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {filteredFirms.length} result{filteredFirms.length === 1 ? '' : 's'}
            </span>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="shrink-0 rounded-full border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface)/0.75)] px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-[hsl(var(--mk-surface-muted)/0.72)]"
              >
                Reset
              </button>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface)/0.82)] p-5 shadow-[0_24px_60px_-44px_hsl(var(--foreground)/0.9)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Catalogue board</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">All tracked firms</h2>
            </div>
            <p className="text-sm text-muted-foreground">The board is the main comparison surface.</p>
          </div>

          {filteredFirms.length > 0 ? (
            <div className="mt-6 px-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFirms.map((firm) => (
                <Link
                  key={firm.key}
                  href={`/${locale}/firm/${firm.slug}`}
                  className="group rounded-2xl p-4 bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/25"
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
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : firm.category === 'Futures'
                            ? 'border-success/30 bg-success/10 text-success'
                            : 'border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface)/0.76)] text-muted-foreground'
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

                  <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--mk-border)/0.72)] pt-4">
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
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-background/65 p-8 text-center text-sm text-muted-foreground">
              No firms match the current search and filter stack.
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
    <div className="rounded-3xl border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface-muted)/0.72)] p-4 shadow-[0_16px_30px_-24px_hsl(var(--foreground)/0.85)]">
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
    paid: 'border-success/35 bg-[linear-gradient(135deg,hsl(var(--success)/0.18),hsl(var(--mk-surface-muted)/0.65))]',
    pending: 'border-warning/35 bg-[linear-gradient(135deg,hsl(var(--warning)/0.16),hsl(var(--mk-surface-muted)/0.65))]',
    refused: 'border-destructive/35 bg-[linear-gradient(135deg,hsl(var(--destructive)/0.16),hsl(var(--mk-surface-muted)/0.65))]',
  }

  const labelStyles = {
    paid: 'text-success/90',
    pending: 'text-warning/90',
    refused: 'text-destructive/90',
  }

  const amountStyles = {
    paid: 'text-success',
    pending: 'text-warning',
    refused: 'text-destructive',
  }

  const amountLabel = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  const countLabel = count === 0 ? 'No payouts' : `${count} payout${count === 1 ? '' : 's'}`

  return (
    <div className={`rounded-3xl border px-4 py-3 shadow-[0_14px_26px_-22px_hsl(var(--foreground)/0.85)] ${borderStyles[variant]}`}>
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

function RegisteredAccountsChart({
  data,
}: {
  data: Array<{ name: string; accounts: number; sized: number; value: number; payouts: number }>
}) {
  type MetricKey = 'payouts' | 'value' | 'accounts' | 'sized'
  const [activeMetric, setActiveMetric] = useState<MetricKey>('accounts')
  const metricTabs: Array<{ key: MetricKey; label: string }> = [
    { key: 'payouts', label: 'Payouts' },
    { key: 'value', label: 'Value' },
    { key: 'accounts', label: 'Reg' },
    { key: 'sized', label: 'Sized' },
  ]
  const formatMetricValue = (value: number, key: MetricKey) => {
    if (key === 'value' || key === 'payouts') return formatCompactCurrency(value)
    return value.toLocaleString()
  }
  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => b[activeMetric] - a[activeMetric])
        .map((entry) => ({
          firm: entry.name,
          shortFirm: entry.name.length > 9 ? `${entry.name.slice(0, 9)}...` : entry.name,
          metricValue: entry[activeMetric],
        })),
    [activeMetric, data]
  )
  const renderBottomLabel = (props: {
    x?: string | number
    y?: string | number
    width?: string | number
    height?: string | number
    value?: string | number
  }) => {
    const { x, y, width, height, value } = props
    const numericX = typeof x === 'number' ? x : Number(x)
    const numericY = typeof y === 'number' ? y : Number(y)
    const numericWidth = typeof width === 'number' ? width : Number(width)
    const numericHeight = typeof height === 'number' ? height : Number(height)
    if (!Number.isFinite(numericX) || !Number.isFinite(numericY) || !Number.isFinite(numericWidth) || !Number.isFinite(numericHeight)) {
      return null
    }
    const label = String(value ?? '')
    return (
      <text
        x={numericX + numericWidth / 2}
        y={numericY + numericHeight + 14}
        textAnchor="middle"
        dominantBaseline="hanging"
        className="fill-muted-foreground text-[10px]"
      >
        {label}
      </text>
    )
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface)/0.82)] shadow-[0_30px_66px_-48px_hsl(var(--foreground)/0.92)]">
      <CardHeader className="border-b border-[hsl(var(--mk-border)/0.72)] bg-[linear-gradient(180deg,hsl(var(--mk-surface-muted)/0.62)_0%,transparent_100%)] px-6 pb-3 pt-4">
        <div className="flex flex-col gap-2">
          <div className="min-w-0">
            <CardTitle className="text-[clamp(1.2rem,2.4vw,1.55rem)] leading-tight tracking-tight">Registered Accounts by Prop Firm</CardTitle>
          </div>
          <div className="flex w-full items-center justify-between gap-3 overflow-x-auto">
            <span className="shrink-0 text-xs text-muted-foreground">
              {registeredAccountsChartConfig[activeMetric].label}
            </span>
            <div className="inline-flex shrink-0 rounded-full border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface-muted)/0.68)] p-1">
              {metricTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveMetric(tab.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeMetric === tab.key
                      ? 'bg-primary text-primary-foreground shadow-[0_12px_20px_-14px_hsl(var(--primary)/0.75)]'
                      : 'text-muted-foreground hover:bg-[hsl(var(--mk-surface-muted)/0.8)] hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {chartData.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-[hsl(var(--mk-border)/0.72)] bg-[hsl(var(--mk-surface-muted)/0.72)] p-3">
            <ChartContainer config={registeredAccountsChartConfig} className="h-[360px] w-full overflow-hidden">
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 28, right: 10, left: 10, bottom: 52 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="shortFirm"
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _name, item) => {
                        const firmName = (item?.payload as { firm?: string } | undefined)?.firm ?? 'Firm'
                        return [formatMetricValue(Number(value), activeMetric), String(firmName)]
                      }}
                    />
                  }
                />
                <Bar dataKey="metricValue" fill={`var(--color-${activeMetric})`} radius={10} maxBarSize={60}>
                  <LabelList
                    dataKey="metricValue"
                    position="top"
                    offset={10}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => formatMetricValue(value, activeMetric)}
                  />
                  <LabelList
                    dataKey="shortFirm"
                    position="bottom"
                    content={renderBottomLabel}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-background/60 px-4 py-6 text-sm text-muted-foreground">
            No account registrations available yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
