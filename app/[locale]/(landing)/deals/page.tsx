import {
  getActiveDeals,
  getDealsOverview,
  getDealsSpotlights,
  getDefaultFaqs,
  getUnifiedFirms,
} from '@/server/deals'
import { DealsExperience } from './components/deals-experience'

export const revalidate = 3600

export default async function DealsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
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
        console.error(`DealsPage: Failed to fetch ${sources[index]}:`, result.reason)
      }
    })
  } catch (error) {
    hadFetchError = true
    console.error('DealsPage: Unexpected error:', error)
  }

  return (
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
  )
}
