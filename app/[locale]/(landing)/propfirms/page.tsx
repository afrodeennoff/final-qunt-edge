import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { getI18n } from '@/locales/server'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getPropfirmCatalogueData } from './actions/get-propfirm-catalogue'
import type { PropfirmCatalogueStats } from './actions/types'
import { PropFirmCatalogueExperience } from './components/catalogue-experience'
import { getUnifiedFirms } from '@/server/deals'
import { normalizeFirmName } from '@/lib/prop-firms/normalize'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'
import { buildBreadcrumbSchema, buildOrganizationSchema, buildPublicMetadata } from '@/lib/seo'

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
  const profile = unifiedFirm ? undefined : getVerifiedPropFirmProfileByName(normalizedName)

  return {
    platform: unifiedFirm?.platform ?? profile?.platform ?? 'Unknown',
    payoutModel: unifiedFirm?.payoutModel ?? profile?.payoutModel ?? 'Unknown',
    drawdownType: unifiedFirm?.drawdownType ?? profile?.drawdownType ?? 'Unknown',
    category: unifiedFirm?.category ?? profile?.category ?? 'Unknown',
    fallbackSlug: profile?.slug,
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
    slug: slugMap.get(normalizedName) ?? displayData.fallbackSlug ?? key,
    name: firm.name,
    accountTemplatesCount: Object.keys(firm.accountSizes).length,
    platform: displayData.platform,
    payoutModel: displayData.payoutModel,
    drawdownType: displayData.drawdownType,
    category: displayData.category,
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
  return buildPublicMetadata({
    locale,
    path: "/propfirms",
    title: `${t('landing.propfirms.title')} | Qunt Edge`,
    description: t('landing.propfirms.description'),
  });
}

export default async function PropFirmsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
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
  const organizationSchema = buildOrganizationSchema()
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: "Home", path: "/" },
    { name: "Prop Firms", path: "/propfirms" },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PropFirmCatalogueExperience
        locale={locale}
        title={t('landing.propfirms.title')}
        description={t('landing.propfirms.description')}
        firms={firms}
      />
    </>
  )
}
