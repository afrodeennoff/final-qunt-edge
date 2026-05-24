import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { TradeTableReview } from '../components/tables/trade-table-review'

export default function DashboardStrategiesPage() {
  return (
    <UnifiedPageShell density="compact">
      <div className="flex h-[calc(100dvh-10rem)] min-h-[40rem] w-full flex-col pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <UnifiedSurface className="h-full overflow-hidden">
          <TradeTableReview />
        </UnifiedSurface>
      </div>
    </UnifiedPageShell>
  )
}
