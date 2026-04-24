import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  getActiveDeals,
  getDealsOverview,
  getDealsSpotlights,
  getDefaultFaqs,
  getUnifiedFirms,
} from '@/server/deals'
import { DealsExperience } from './components/deals-experience'
import { RouteLoadingScreen } from '@/components/ui/route-state'
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildSoftwareApplicationSchema,
} from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({
    locale,
    path: "/deals",
    title: "Prop Firm Deals & Challenge Discounts | Qunt Edge",
    description:
      "Browse verified prop-firm discounts, compare challenge costs, and move from deal discovery to full firm research without losing risk context.",
  });
}

export default async function DealsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const organizationSchema = buildOrganizationSchema()
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: "Home", path: "/" },
    { name: "Deals", path: "/deals" },
  ])
  const softwareSchema = buildSoftwareApplicationSchema(locale, "/deals")
  let deals: Awaited<ReturnType<typeof getActiveDeals>> = []
  let firms: Awaited<ReturnType<typeof getUnifiedFirms>> = []
  let overview: Awaited<ReturnType<typeof getDealsOverview>> = {
    totalTrackedFirms: 0,
    totalLiveDeals: 0,
    totalAccounts: 0,
    totalAccountValue: 0,
    totalPaidPayoutAmount: 0,
    totalPaidPayoutCount: 0,
  }
  const spotlights = getDealsSpotlights()
  let faqs: Awaited<ReturnType<typeof getDefaultFaqs>> = []
  let hadFetchError = false

  try {
    const results = await Promise.allSettled([
      getActiveDeals(),
      getUnifiedFirms(),
      getDealsOverview(),
      getDefaultFaqs(),
    ])

    deals = results[0].status === 'fulfilled' ? results[0].value : []
    firms = results[1].status === 'fulfilled' ? results[1].value : []
    overview = results[2].status === 'fulfilled' ? results[2].value : overview
    faqs = results[3].status === 'fulfilled' ? results[3].value : []

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        hadFetchError = true
        const sources = ['deals', 'firms', 'overview', 'faqs']
        console.warn(`DealsPage: Failed to fetch ${sources[index]}:`, result.reason)
      }
    })
  } catch (error) {
    hadFetchError = true
    console.warn('DealsPage: Unexpected error:', error)
  }

  const faqSchema = faqs.length > 0
    ? buildFaqPageSchema(faqs.map((faq) => ({ question: faq.question, answer: faq.answer })))
    : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      {faqSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      ) : null}
      <Suspense fallback={<RouteLoadingScreen eyebrow="Deals" title="Loading deals" description="Gathering the latest firm perks and promotional details." fullScreen={false} />}>
        <DealsExperience
          locale={locale}
          deals={deals}
          firms={firms}
          overview={overview}
          spotlights={spotlights}
          faqs={faqs}
          hadFetchError={hadFetchError}
          lastUpdated={hadFetchError ? null : new Date().toISOString().split('T')[0]}
        />
      </Suspense>
    </>
  )
}
