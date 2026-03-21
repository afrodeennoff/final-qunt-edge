import { getActiveDeals, getUnifiedFirms, getDefaultFaqs } from '@/server/deals'
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
  let faqs: Awaited<ReturnType<typeof getDefaultFaqs>> = []
  let hadFetchError = false

  try {
    const results = await Promise.allSettled([
      getActiveDeals(),
      getUnifiedFirms(),
      getDefaultFaqs(),
    ])

    deals = results[0].status === 'fulfilled' ? results[0].value : []
    firms = results[1].status === 'fulfilled' ? results[1].value : []
    faqs = results[2].status === 'fulfilled' ? results[2].value : []

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        hadFetchError = true
        const sources = ['deals', 'firms', 'faqs']
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
      faqs={faqs}
      hadFetchError={hadFetchError}
      lastUpdated={hadFetchError ? null : new Date().toISOString().split('T')[0]}
    />
  )
}
