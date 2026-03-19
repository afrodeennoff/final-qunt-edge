import { getActiveDeals, getUnifiedFirms, getDefaultFaqs } from '@/server/deals'
import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import { DealsExperience } from './components/deals-experience'

export const revalidate = 3600

export default async function DealsPage() {
  const [deals, firms, faqs, catalogueData] = await Promise.all([
    getActiveDeals(),
    getUnifiedFirms(),
    getDefaultFaqs(),
    getPropfirmCatalogueData('allTime'),
  ])

  return (
    <DealsExperience
      deals={deals}
      firms={firms}
      faqs={faqs}
      catalogueData={catalogueData}
      lastUpdated={new Date().toISOString().split('T')[0]}
    />
  )
}
