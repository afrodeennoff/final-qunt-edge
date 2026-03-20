import { getActiveDeals, getUnifiedFirms, getDefaultFaqs } from '@/server/deals'
import { DealsExperience } from './components/deals-experience'

export const revalidate = 3600

export default async function DealsPage() {
  const [deals, firms, faqs] = await Promise.all([
    getActiveDeals(),
    getUnifiedFirms(),
    getDefaultFaqs(),
  ])

  return (
    <DealsExperience
      deals={deals}
      firms={firms}
      faqs={faqs}
      lastUpdated={new Date().toISOString().split('T')[0]}
    />
  )
}
