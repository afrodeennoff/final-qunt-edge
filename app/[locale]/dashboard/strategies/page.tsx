import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import dynamic from 'next/dynamic'

const TradeTableReview = dynamic(
  () => import('../components/tables/trade-table-review').then(m => ({ default: m.TradeTableReview })),
  { loading: () => <div className="flex h-[80vh] items-center justify-center"><div className="h-32 w-full animate-pulse rounded-xl bg-muted/30" /></div> }
)

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
