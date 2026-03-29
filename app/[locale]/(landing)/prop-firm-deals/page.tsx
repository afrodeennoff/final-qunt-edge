import type { Metadata } from 'next'
import { deals, faqItems, firms } from './data/mock-data'
import { PropFirmDealsExperience } from './components/prop-firm-deals-experience'
import {
  buildPropFirmDealsFaqSchema,
  buildPropFirmDealsMetadata,
  PROP_FIRM_DEALS_LAST_UPDATED,
} from './data/seo'
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
        lastUpdated={PROP_FIRM_DEALS_LAST_UPDATED}
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
