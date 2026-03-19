import { listPropFirms } from '@/server/prop-firms'
import DealsV2Experience from './components/deals-v2-experience'

export const revalidate = 3600

export default async function DealsV2Page() {
  const firms = await listPropFirms()
  return <DealsV2Experience initialFirms={firms as any} />
}
