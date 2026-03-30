import { connection, NextResponse } from 'next/server'
import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { createRouteClient } from '@/lib/supabase/route-client'

export async function GET(request: Request) {
  // This endpoint requires request headers for auth; opt out of build-time prerender.
  await connection()

  try {
    const supabase = createRouteClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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
    return NextResponse.json({ error: 'Failed to fetch propfirm statistics' }, { status: 500 })
  }
}
