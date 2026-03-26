import { NextResponse } from 'next/server'
import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
    console.error('Error fetching propfirm stats:', error)
    return NextResponse.json({ error: 'Failed to fetch propfirm statistics' }, { status: 500 })
  }
}
