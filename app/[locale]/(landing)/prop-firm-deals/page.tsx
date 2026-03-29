import type { Metadata } from 'next'
import { getActiveDeals, getDefaultFaqs, getUnifiedFirms } from '@/server/deals'
import { PropFirmDealsExperience } from './components/prop-firm-deals-experience'
import {
  buildPropFirmDealsFaqSchema,
  buildPropFirmDealsMetadata,
} from './data/seo'
import type { DealItem, FaqItem, FirmItem } from './data/types'
import { buildBreadcrumbSchema, buildOrganizationSchema, buildSoftwareApplicationSchema } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPropFirmDealsMetadata(locale)
}

export default async function PropFirmDealsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [liveDeals, liveFirms, liveFaqs] = await Promise.all([
    getActiveDeals(),
    getUnifiedFirms(),
    getDefaultFaqs(),
  ])

  const deals: DealItem[] = liveDeals.map((deal) => ({
    id: deal.id,
    firmId: deal.firmId,
    firmName: deal.firmName,
    logoUrl: deal.logoUrl,
    marketType: deal.category,
    platform: deal.platform,
    payoutModel: deal.payoutModel,
    drawdownType: deal.drawdownType,
    discountPercent: deal.discountPercent,
    couponCode: deal.couponCode,
    challengeFee: deal.challengeFee,
    expiryDate: deal.expiryDate,
    verified: true,
    claimUrl: deal.claimUrl ?? `/${locale}/firm/${deal.firmSlug}`,
  }))

  const firms: FirmItem[] = liveFirms.map((firm) => {
    const challengeFeeCandidates = firm.coupons
      .map((coupon) => coupon.challengeFee)
      .filter((fee): fee is number => typeof fee === 'number' && Number.isFinite(fee) && fee >= 0)

    const challengeFee = challengeFeeCandidates.length > 0
      ? Math.min(...challengeFeeCandidates)
      : 0

    return {
      id: firm.id,
      name: firm.name,
      logoUrl: firm.logoUrl,
      marketType: firm.category,
      platform: firm.platform,
      payoutModel: firm.payoutModel,
      drawdownType: firm.drawdownType,
      challengeFee,
      profitSplit: firm.profitSplit,
      payoutFrequency: firm.payoutModel,
      maxAllocation: firm.maxAllocation,
      rating: firm.liveReviewStats.averageRating ?? 0,
    }
  })

  const faqItems: FaqItem[] = liveFaqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }))

  const lastUpdated = new Date().toISOString().split('T')[0] ?? ''

  const faqSchema = buildPropFirmDealsFaqSchema(faqItems)
  const organizationSchema = buildOrganizationSchema()
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: "Home", path: "/" },
    { name: "Prop Firm Deals", path: "/prop-firm-deals" },
  ])
  const softwareSchema = buildSoftwareApplicationSchema(locale, "/prop-firm-deals")

  return (
    <>
      <PropFirmDealsExperience
        locale={locale}
        deals={deals}
        firms={firms}
        faqs={faqItems}
        lastUpdated={lastUpdated}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
