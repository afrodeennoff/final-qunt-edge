import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { getI18n } from '@/locales/server'
import { getPropfirmCatalogueData } from './actions/get-propfirm-catalogue'
import type { PropfirmCatalogueStats } from './actions/types'
import { PropFirmCatalogueExperience } from './components/catalogue-experience'
import { getUnifiedFirms } from '@/server/deals'
import { normalizeFirmName } from '@/lib/prop-firms/normalize'
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
  }> = unifiedFirms
    .map((firm) => {
      const normalizedName = normalizeFirmName(firm.name)
      const accountTemplates = Object.values(firm.accountSizes)

      return {
        key: firm.id,
        slug: firm.slug,
        name: firm.name,
        accountTemplatesCount: accountTemplates.length,
        platform: firm.platform,
        payoutModel: firm.payoutModel,
        drawdownType: firm.drawdownType,
        category: firm.category,
        hasInstantFunding: accountTemplates.some((size) => !size.evaluation),
        stats: statsMap.get(normalizedName) ?? buildEmptyStats(firm.name),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
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
