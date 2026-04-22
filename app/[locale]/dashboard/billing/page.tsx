'use client'

import BillingManagement from './components/billing-management'
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function BillingPage() {
  return (
    <UnifiedPageShell density="compact">
      <UnifiedSurface>
        <BillingManagement />
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
