'use client'

import BillingManagement from './components/billing-management'
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function BillingPage() {
  return (
    <UnifiedPageShell density="compact">
      <div className="flex min-h-full w-full flex-col pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <UnifiedSurface className="min-h-full overflow-hidden">
          <BillingManagement />
        </UnifiedSurface>
      </div>
    </UnifiedPageShell>
  )
}
