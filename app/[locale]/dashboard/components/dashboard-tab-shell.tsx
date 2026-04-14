'use client'

import { useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { clearReferralCode } from '@/lib/referral-storage'
import { DashboardSkeleton } from './skeletons/dashboard-skeleton'
import { FEATURE_FLAGS } from '@/lib/feature-flags'
import { Spinner } from '@/components/ui/skeleton'

type DashboardTab = 'widgets' | 'table' | 'accounts' | 'chart'

const tabLoadingFallback = (
  <div className="flex items-center justify-center h-64">
    <Spinner size={24} />
  </div>
)

const TradeTableReview = dynamic(
  () => import('./tables/trade-table-review').then((m) => m.TradeTableReview),
  { loading: () => tabLoadingFallback },
)

const AccountsOverview = dynamic(
  () => import('./accounts/accounts-overview').then((m) => m.AccountsOverview),
  { loading: () => tabLoadingFallback },
)

const WidgetCanvas = dynamic(() => import('./widget-canvas'), {
  loading: () => tabLoadingFallback,
})

const ChartTheFuturePanel = dynamic(
  () => import('./chart-the-future-panel').then((m) => m.ChartTheFuturePanel),
  { loading: () => tabLoadingFallback },
)

export function DashboardTabShell({
  activeTab,
  checkoutSuccess,
}: {
  activeTab: DashboardTab
  checkoutSuccess: boolean
}) {
  useEffect(() => {
    if (checkoutSuccess) {
      clearReferralCode()
    }
  }, [checkoutSuccess])

  // Use enhanced skeleton if feature flag is enabled
  const shouldUseEnhancedSkeleton = FEATURE_FLAGS.ENABLE_SKELETON_LOADING

  return (
    <div className="w-full min-h-[calc(100dvh-64px)] px-3 py-4 sm:min-h-[calc(100vh-72px)] sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col">
        <Suspense
          fallback={shouldUseEnhancedSkeleton ? <DashboardSkeleton activeTab={activeTab} /> : null}
        >
          {activeTab === 'table' ? <TradeTableReview /> : null}
          {activeTab === 'accounts' ? <AccountsOverview size="large" surface="embedded" /> : null}
          {activeTab === 'chart' ? <ChartTheFuturePanel /> : null}
          {activeTab === 'widgets' ? <WidgetCanvas /> : null}
        </Suspense>
      </div>
    </div>
  )
}
