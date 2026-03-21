import { Metadata } from 'next'
import { ArrowRight, Banknote, Building2, Landmark, Wallet } from 'lucide-react'
import { getI18n } from '@/locales/server'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getPropfirmCatalogueData } from './actions/get-propfirm-catalogue'
import { AccountsBarChart } from './components/accounts-bar-chart'
import { SortControls } from './components/sort-controls'
import { TimeframeControls } from './components/timeframe-controls'
import type { Timeframe } from './actions/timeframe-utils'
import type { PropfirmCatalogueStats } from './actions/types'

type Translator = (key: string, params?: Record<string, unknown>) => string

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getI18n()

  return {
    title: `${t('landing.propfirms.title')} | Qunt Edge`,
    description: t('landing.propfirms.description'),
    openGraph: {
      title: `${t('landing.propfirms.title')} | Qunt Edge`,
      description: t('landing.propfirms.description'),
      url: `https://quntedge.com/${locale}/propfirms`,
      siteName: 'Qunt Edge',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('landing.propfirms.title')} | Qunt Edge`,
      description: t('landing.propfirms.description'),
    },
    alternates: {
      canonical: `./${locale}/propfirms`,
      languages: {
        'x-default': `./en/propfirms`,
        en: `./en/propfirms`,
      },
    },
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(value)
}

function renderPropfirmCard(
  propfirmName: string,
  stat: PropfirmCatalogueStats,
  t: Translator
) {
  const paidAmount = stat.payouts.paidAmount
  const paidCount = stat.payouts.paidCount
  const pendingAmount = stat.payouts.pendingAmount
  const pendingCount = stat.payouts.pendingCount
  const refusedAmount = stat.payouts.refusedAmount
  const refusedCount = stat.payouts.refusedCount

  return (
    <article key={propfirmName} className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Prop firm</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{propfirmName}</h2>
          <p className="mt-2 max-w-sm text-sm leading-7 text-white/58">
            Registered accounts, live account sizing, and payout performance in one compact research card.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/55">
          tracked
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricPill compact label="Accounts" value={stat.accountsCount.toLocaleString()} icon={Building2} />
        <MetricPill compact label="Sized" value={stat.sizedAccountsCount.toLocaleString()} icon={Landmark} />
        <MetricPill compact label="Account value" value={formatCompactCurrency(stat.totalAccountValue)} icon={Wallet} />
        <MetricPill compact label="Paid out" value={formatCompactCurrency(paidAmount)} icon={Banknote} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Size mix</p>
          <p className="mt-2 text-sm font-semibold text-white">{stat.sizeBreakdown}</p>
          <p className="mt-4 text-xs text-white/45">
            Use this page as the higher-level market view before opening specific firm profiles on the deals board.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <PayoutMiniCard label={t('landing.propfirms.payouts.paid.label')} amount={formatCurrency(paidAmount)} count={t('landing.propfirms.payouts.count', { count: paidCount })} tone="success" />
          <PayoutMiniCard label={t('landing.propfirms.payouts.pending.label')} amount={formatCurrency(pendingAmount)} count={t('landing.propfirms.payouts.count', { count: pendingCount })} tone="default" />
          <PayoutMiniCard label={t('landing.propfirms.payouts.refused.label')} amount={formatCurrency(refusedAmount)} count={t('landing.propfirms.payouts.count', { count: refusedCount })} tone="muted" />
        </div>
      </div>
    </article>
  )
}

interface PropFirmsPageProps {
  searchParams: Promise<{ sort?: string; timeframe?: string }>
}

export default async function PropFirmsPage({ searchParams }: PropFirmsPageProps) {
  const t = await getI18n()
  const resolvedSearchParams = await searchParams
  const timeframe = (resolvedSearchParams.timeframe || '2026') as Timeframe
  const sortBy = resolvedSearchParams.sort || 'accounts'
  const { stats } = await getPropfirmCatalogueData(timeframe)

  const statsMap = new Map(stats.map((s) => [s.propfirmName, s]))

  const configPropfirms: Array<{
    key: string
    name: string
    stats: typeof stats[0] | undefined
  }> = []

  Object.entries(propFirms).forEach(([key, firm]) => {
    configPropfirms.push({
      key,
      name: firm.name,
      stats: statsMap.get(firm.name),
    })
  })

  const sortedPropfirms = [...configPropfirms].sort((a, b) => {
    const aStats = a.stats
    const bStats = b.stats

    switch (sortBy) {
      case 'paidPayout': {
        return (bStats?.payouts.paidAmount ?? 0) - (aStats?.payouts.paidAmount ?? 0)
      }
      case 'refusedPayout': {
        return (bStats?.payouts.refusedAmount ?? 0) - (aStats?.payouts.refusedAmount ?? 0)
      }
      case 'accountValue': {
        return (bStats?.totalAccountValue ?? 0) - (aStats?.totalAccountValue ?? 0)
      }
      case 'accounts':
      default:
        return (bStats?.accountsCount ?? 0) - (aStats?.accountsCount ?? 0)
    }
  })

  const totals = stats.reduce(
    (acc, item) => ({
      accounts: acc.accounts + item.accountsCount,
      accountValue: acc.accountValue + item.totalAccountValue,
      paidAmount: acc.paidAmount + item.payouts.paidAmount,
      paidCount: acc.paidCount + item.payouts.paidCount,
    }),
    { accounts: 0, accountValue: 0, paidAmount: 0, paidCount: 0 }
  )

  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/40 p-8 sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(88,129,255,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(28,200,138,0.14),_transparent_34%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                <ArrowRight className="h-3.5 w-3.5 text-v2-accent" />
                Prop firm market index
              </span>
              <h1 className="mt-6 max-w-4xl text-[clamp(2.8rem,5.2vw,4.9rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">
                Ranked firm traction.
                <br />
                Cleaner payout context.
                <br />
                Better scanning.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/66 sm:text-lg">
                A higher-level market view of tracked firms, account size mix, and payout performance. Use this page to compare momentum before jumping into deals or individual firm profiles.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MetricPill label="Tracked firms" value={stats.length.toLocaleString()} icon={Building2} />
              <MetricPill label="Accounts" value={totals.accounts.toLocaleString()} icon={Landmark} />
              <MetricPill label="Account value" value={formatCompactCurrency(totals.accountValue)} icon={Wallet} />
              <MetricPill label="Paid payouts" value={formatCompactCurrency(totals.paidAmount)} icon={Banknote} />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">{t('landing.propfirms.chart.title')}</h2>
            <p className="mt-1 text-sm text-white/55">
              Compare registered accounts, sized accounts, account value, and payout behavior over the selected timeframe.
            </p>
          </div>

          <AccountsBarChart
            data={sortedPropfirms.map(({ name, stats: firmStats }) => ({
              propfirmName: name,
              accountsCount: firmStats?.accountsCount ?? 0,
              sizedAccountsCount: firmStats?.sizedAccountsCount ?? 0,
              totalAccountValue: firmStats?.totalAccountValue ?? 0,
              paidAmount: firmStats?.payouts.paidAmount ?? 0,
              pendingAmount: firmStats?.payouts.pendingAmount ?? 0,
              refusedAmount: firmStats?.payouts.refusedAmount ?? 0,
              sizeBreakdown: firmStats?.sizeBreakdown ?? 'No sized accounts',
            }))}
            chartTitle={t('landing.propfirms.chart.title')}
            legendLabels={{
              registeredAccounts: t('landing.propfirms.registeredAccounts'),
              sizedAccounts: 'Sized Accounts',
              totalAccountValue: 'Total Account Value',
              paid: t('landing.propfirms.payouts.paid.label'),
              pending: t('landing.propfirms.payouts.pending.label'),
              refused: t('landing.propfirms.payouts.refused.label'),
            }}
          />
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
            <TimeframeControls
              timeframeLabel={t('landing.propfirms.timeframe.label')}
              timeframeOptions={{
                currentMonth: t('landing.propfirms.timeframe.currentMonth'),
                last3Months: t('landing.propfirms.timeframe.last3Months'),
                last6Months: t('landing.propfirms.timeframe.last6Months'),
                '2024': t('landing.propfirms.timeframe.2024'),
                '2025': t('landing.propfirms.timeframe.2025'),
                '2026': t('landing.propfirms.timeframe.2026'),
                allTime: t('landing.propfirms.timeframe.allTime'),
              }}
            />
            <SortControls
              sortLabel={t('landing.propfirms.sort.label')}
              sortOptions={{
                accounts: t('landing.propfirms.sort.accounts'),
                paidPayout: t('landing.propfirms.sort.paidPayout'),
                refusedPayout: t('landing.propfirms.sort.refusedPayout'),
                accountValue: 'Account Value',
              }}
            />
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {sortedPropfirms.map(({ name, stats: dbStats }) => {
            const fallback: PropfirmCatalogueStats = {
              propfirmName: name,
              accountsCount: 0,
              sizedAccountsCount: 0,
              totalAccountValue: 0,
              sizeBreakdown: 'No sized accounts',
              sizeDistribution: [],
              payouts: {
                propfirmName: name,
                pendingAmount: 0,
                pendingCount: 0,
                refusedAmount: 0,
                refusedCount: 0,
                paidAmount: 0,
                paidCount: 0,
              },
            }

            return renderPropfirmCard(name, dbStats ?? fallback, t as unknown as Translator)
          })}
        </section>
      </div>
    </div>
  )
}

function MetricPill({
  label,
  value,
  icon: Icon,
  compact = false,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  compact?: boolean
}) {
  return (
    <div className={`rounded-2xl border border-white/10 ${compact ? 'bg-black/20 px-4 py-4' : 'bg-white/[0.04] p-4 sm:p-5'} min-h-[104px]`}>
      <div className="flex items-start gap-3">
        <div className={`flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 ${compact ? 'h-10 w-10' : 'h-11 w-11'}`}>
          <Icon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-v2-accent`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase leading-none tracking-[0.16em] text-white/45">{label}</p>
          <p className={`mt-3 font-semibold leading-none text-white ${compact ? 'text-[clamp(1.5rem,2vw,1.9rem)]' : 'text-[clamp(1.7rem,2.4vw,2.25rem)] tracking-[-0.03em]'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function PayoutMiniCard({
  label,
  amount,
  count,
  tone,
}: {
  label: string
  amount: string
  count: string
  tone: 'success' | 'default' | 'muted'
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-400/20 bg-emerald-400/10'
      : tone === 'default'
        ? 'border-white/10 bg-white/[0.03]'
        : 'border-white/10 bg-black/20'

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{amount}</p>
      <p className="mt-2 text-xs text-white/55">{count}</p>
    </div>
  )
}
