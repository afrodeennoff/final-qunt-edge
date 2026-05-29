import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { TradeTableReview } from '../components/tables/trade-table-review'

export default function DashboardStrategiesPage() {
  return (
    <UnifiedPageShell density="compact">
      <div className="flex min-h-full w-full flex-col pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <UnifiedSurface className="min-h-full overflow-hidden">
          <TradeTableReview />
        </UnifiedSurface>
      </div>
    </UnifiedPageShell>
  )
}
