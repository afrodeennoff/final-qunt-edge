'use client'

import { useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { clearReferralCode } from '@/lib/referral-storage'
import { FEATURE_FLAGS } from '@/lib/feature-flags'
import { WORKSPACE_SHELL_WIDTH } from '@/lib/constants/layout'
import { cn } from '@/lib/utils'

type DashboardTab = 'widgets' | 'table' | 'accounts' | 'chart'

const TradeTableReview = dynamic(
  () => import('./tables/trade-table-review').then((m) => m.TradeTableReview),
  { loading: () => null },
)

const AccountsOverview = dynamic(
  () => import('./accounts/accounts-overview').then((m) => m.AccountsOverview),
  { loading: () => null },
)

const WidgetCanvas = dynamic(() => import('./widget-canvas'), {
  loading: () => null,
})

const ChartTheFuturePanel = dynamic(
  () => import('./chart-the-future-panel').then((m) => m.ChartTheFuturePanel),
  { loading: () => null },
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

  return (
    <div className="w-full min-h-[calc(100dvh-64px)] overflow-x-hidden px-4 py-4 sm:min-h-[calc(100vh-72px)] sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className={cn('mx-auto flex h-full w-full max-w-full flex-col', WORKSPACE_SHELL_WIDTH)}>
        <Suspense fallback={null}>
          {activeTab === 'table' ? <TradeTableReview /> : null}
          {activeTab === 'accounts' ? <AccountsOverview size="large" surface="embedded" /> : null}
          {activeTab === 'chart' ? <ChartTheFuturePanel /> : null}
          {activeTab === 'widgets' ? <WidgetCanvas /> : null}
        </Suspense>
      </div>
    </div>
  )
}
