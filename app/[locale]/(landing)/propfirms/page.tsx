import { Metadata } from 'next'
import { getI18n } from '@/locales/server'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getPropfirmCatalogueData } from './actions/get-propfirm-catalogue'
import { AccountsBarChart } from './components/accounts-bar-chart'
import { TimeframeControls } from './components/timeframe-controls'
import { FirmFilters } from './components/firm-filters'
import { FirmGrid } from './components/firm-grid'
import type { Timeframe } from './actions/timeframe-utils'
import type { PropfirmCatalogueStats } from './actions/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getI18n()

  return {
    title: `${t('landing.propfirms.title')} | Qunt Edge`,
    description: t('landing.propfirms.description'),
    openGraph: {
      title: `${t('landing.propfirms.title')} | Qunt Edge`,
      description: t('landing.propfirms.description'),
      url: `https://quntedge.com/${locale}/propfirms`,
      siteName: "Qunt Edge",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t('landing.propfirms.title')} | Qunt Edge`,
      description: t('landing.propfirms.description'),
    },
    alternates: {
      canonical: `./${locale}/propfirms`,
      languages: {
        'x-default': `./en/propfirms`,
        'en': `./en/propfirms`,
      },
    },
  };
}

interface PropFirmsPageProps {
  searchParams: Promise<{
    sort?: string
    timeframe?: string
    q?: string
    payout?: string
    page?: string
  }>
}

export default async function PropFirmsPage({ searchParams }: PropFirmsPageProps) {
  const t = await getI18n()
  const resolvedSearchParams = await searchParams
  const timeframe = (resolvedSearchParams.timeframe || '2026') as Timeframe
  const sortBy = resolvedSearchParams.sort || 'accounts'
  const searchQuery = (resolvedSearchParams.q || '').toLowerCase().trim()
  const payoutFilter = resolvedSearchParams.payout || ''

  const { stats } = await getPropfirmCatalogueData(timeframe)

  // Create a map of propfirm name -> stats for quick lookup
  const statsMap = new Map(
    stats.map(s => [s.propfirmName, s])
  )

  // Process config propfirms only
  const configPropfirms: Array<{
    key: string
    name: string
    accountTemplatesCount: number
    stats: PropfirmCatalogueStats
  }> = []

  Object.entries(propFirms).forEach(([key, firm]) => {
    const dbStats = statsMap.get(firm.name)
    const accountTemplatesCount = Object.keys(firm.accountSizes).length

    const fallback: PropfirmCatalogueStats = {
      propfirmName: firm.name,
      accountsCount: 0,
      sizedAccountsCount: 0,
      totalAccountValue: 0,
      sizeBreakdown: 'No sized accounts',
      sizeDistribution: [],
      payouts: {
        propfirmName: firm.name,
        pendingAmount: 0,
        pendingCount: 0,
        refusedAmount: 0,
        refusedCount: 0,
        paidAmount: 0,
        paidCount: 0,
      },
    }

    configPropfirms.push({
      key,
      name: firm.name,
      accountTemplatesCount,
      stats: dbStats ?? fallback,
    })
  })

  // Apply search filter
  let filteredFirms = configPropfirms
  if (searchQuery) {
    filteredFirms = filteredFirms.filter(firm =>
      firm.name.toLowerCase().includes(searchQuery)
    )
  }

  // Apply payout filter
  if (payoutFilter === 'high-paid') {
    filteredFirms = filteredFirms.filter(firm =>
      firm.stats.payouts.paidAmount > 0
    )
  } else if (payoutFilter === 'low-refused') {
    filteredFirms = filteredFirms.filter(firm =>
      firm.stats.payouts.refusedAmount === 0
    )
  }

  // Sort propfirms based on selected sort option
  const sortedFirms = [...filteredFirms].sort((a, b) => {
    const aStats = a.stats
    const bStats = b.stats

    switch (sortBy) {
      case 'paidPayout': {
        const aPaid = aStats?.payouts.paidAmount ?? 0
        const bPaid = bStats?.payouts.paidAmount ?? 0
        return bPaid - aPaid // Descending
      }
      case 'refusedPayout': {
        const aRefused = aStats?.payouts.refusedAmount ?? 0
        const bRefused = bStats?.payouts.refusedAmount ?? 0
        return bRefused - aRefused // Descending
      }
      case 'accountValue': {
        const aValue = aStats?.totalAccountValue ?? 0
        const bValue = bStats?.totalAccountValue ?? 0
        return bValue - aValue
      }
      case 'accounts':
      default: {
        const aAccounts = aStats?.accountsCount ?? 0
        const bAccounts = bStats?.accountsCount ?? 0
        return bAccounts - aAccounts // Descending
      }
    }
  })

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('landing.propfirms.title')}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground/80">
            {t('landing.propfirms.description')}
          </p>
        </div>

        {/* Accounts bar chart */}
        <div className="mb-8">
          <AccountsBarChart
            data={sortedFirms.map(({ name, stats }) => ({
              propfirmName: name,
              accountsCount: stats?.accountsCount ?? 0,
              sizedAccountsCount: stats?.sizedAccountsCount ?? 0,
              totalAccountValue: stats?.totalAccountValue ?? 0,
              paidAmount: stats?.payouts.paidAmount ?? 0,
              pendingAmount: stats?.payouts.pendingAmount ?? 0,
              refusedAmount: stats?.payouts.refusedAmount ?? 0,
              sizeBreakdown: stats?.sizeBreakdown ?? 'No sized accounts',
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
        </div>

        {/* Timeframe Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-border/50 bg-card/30 px-4 py-3">
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
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FirmFilters
            totalCount={configPropfirms.length}
            filteredCount={sortedFirms.length}
          />
        </div>

        {/* Firm Grid with Pagination */}
        <FirmGrid firms={sortedFirms} pageSize={9} />
      </div>
    </div>
  )
}
