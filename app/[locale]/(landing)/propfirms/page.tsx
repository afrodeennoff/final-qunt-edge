import { Metadata } from 'next'
import { getI18n } from '@/locales/server'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getPropfirmCatalogueData } from './actions/get-propfirm-catalogue'
import type { PropfirmCatalogueStats } from './actions/types'
import { PropFirmCatalogueExperience } from './components/catalogue-experience'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
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
  }
}

export default async function PropFirmsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getI18n()
  const { stats } = await getPropfirmCatalogueData('allTime')

  const statsMap = new Map(stats.map((entry) => [entry.propfirmName, entry]))

  const firms: Array<{
    key: string
    slug: string
    name: string
    accountTemplatesCount: number
    stats: PropfirmCatalogueStats
  }> = Object.entries(propFirms).map(([key, firm]) => ({
    key,
    slug: key,
    name: firm.name,
    accountTemplatesCount: Object.keys(firm.accountSizes).length,
    stats: statsMap.get(firm.name) ?? {
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
    },
  }))

  return (
    <PropFirmCatalogueExperience
      locale={locale}
      title={t('landing.propfirms.title')}
      description={t('landing.propfirms.description')}
      firms={firms}
    />
  )
}
