import { withRateLimited } from '@/lib/api/with-api-route'
import { NextRequest, connection, NextResponse } from 'next/server'
import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { createRouteClient } from '@/lib/supabase/route-client'
import { apiError } from '@/lib/api-response'

async function handleGet(request: NextRequest) {
  // This endpoint requires request headers for auth; opt out of build-time prerender.
  await connection()

  try {
    const supabase = createRouteClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401)
    }

    const data = await getPropfirmCatalogueData('allTime')

    let totalPaid = 0
    let totalPending = 0
    let totalRefused = 0
    let totalAccounts = 0

    if (data.stats) {
      for (const stat of data.stats) {
        totalPaid += stat.payouts.paidAmount || 0
        totalPending += stat.payouts.pendingAmount || 0
        totalRefused += stat.payouts.refusedAmount || 0
        totalAccounts += stat.accountsCount || 0
      }
    }

    const totalFirms = Object.keys(propFirms).length

    return NextResponse.json({
      totalPaid,
      totalPending,
      totalRefused,
      totalAccounts,
      totalFirms,
    })
  } catch (error) {
    console.warn('Error fetching propfirm stats:', error)
    return apiError('INTERNAL_ERROR', 'Failed to fetch propfirm statistics', 500)
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'propfirms-stats',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'propfirms-stats',
})
