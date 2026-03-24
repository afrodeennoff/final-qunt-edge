import { Metadata } from 'next'
import { getI18n } from '@/locales/server'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getPropfirmCatalogueData } from './actions/get-propfirm-catalogue'
import type { PropfirmCatalogueStats } from './actions/types'
import { PropFirmCatalogueExperience } from './components/catalogue-experience'
import { getUnifiedFirms } from '@/server/deals'
import { normalizeFirmName } from '@/lib/prop-firms/normalize'

function buildEmptyStats(name: string): PropfirmCatalogueStats {
  return {
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
}

function getUnifiedFirmDisplayData(
  normalizedName: string,
  unifiedFirmMap: Map<string, Awaited<ReturnType<typeof getUnifiedFirms>>[number]>
) {
  const unifiedFirm = unifiedFirmMap.get(normalizedName)

  return {
    platform: unifiedFirm?.platform ?? 'Unknown',
    payoutModel: unifiedFirm?.payoutModel ?? 'Unknown',
    drawdownType: unifiedFirm?.drawdownType ?? 'Unknown',
    category: unifiedFirm?.category ?? 'Unknown',
  }
}

function buildCatalogueFirm(
  key: string,
  firm: (typeof propFirms)[keyof typeof propFirms],
  slugMap: Map<string, string>,
  unifiedFirmMap: Map<string, Awaited<ReturnType<typeof getUnifiedFirms>>[number]>,
  statsMap: Map<string, PropfirmCatalogueStats>
) {
  const normalizedName = normalizeFirmName(firm.name)
  const displayData = getUnifiedFirmDisplayData(normalizedName, unifiedFirmMap)

  return {
    key,
    slug: slugMap.get(normalizedName) ?? key,
    name: firm.name,
    accountTemplatesCount: Object.keys(firm.accountSizes).length,
    ...displayData,
    hasInstantFunding: Object.values(firm.accountSizes).some((size) => !size.evaluation),
    stats: statsMap.get(normalizedName) ?? buildEmptyStats(firm.name),
  }
}

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
    alternates: {
      canonical: `https://quntedge.com/${locale}/propfirms`,
    },
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
  const [catalogue, unifiedFirms] = await Promise.all([
    getPropfirmCatalogueData('allTime'),
    getUnifiedFirms().catch(() => []),
  ])
  const { stats } = catalogue

  const statsMap = new Map(
    stats.map((entry) => [normalizeFirmName(entry.propfirmName), entry])
  )
  const slugMap = new Map(
    unifiedFirms.map((firm) => [normalizeFirmName(firm.name), firm.slug])
  )
  const unifiedFirmMap = new Map(
    unifiedFirms.map((firm) => [normalizeFirmName(firm.name), firm])
  )

  const firms: Array<{
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
  }> = Object.entries(propFirms).map(([key, firm]) => buildCatalogueFirm(key, firm, slugMap, unifiedFirmMap, statsMap))

  return (
    <PropFirmCatalogueExperience
      locale={locale}
      title={t('landing.propfirms.title')}
      description={t('landing.propfirms.description')}
      firms={firms}
    />
  )
}
