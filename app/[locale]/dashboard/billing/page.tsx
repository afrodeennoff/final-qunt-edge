'use client'

import { CardV2, CardV2Content } from "@/components/ui/v2"
import BillingManagement from './components/billing-management'
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function BillingPage() {
  return (
    <UnifiedPageShell density="compact">
      <UnifiedSurface>
        <CardV2 className="border-none bg-transparent shadow-none">
          <CardV2Content className="p-0">
            <BillingManagement />
          </CardV2Content>
        </CardV2>
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
