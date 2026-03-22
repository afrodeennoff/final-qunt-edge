import { NextResponse } from 'next/server'
import { getDealsOverview } from '@/server/deals'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

export async function GET(request: Request) {
  try {
    const overview = await getDealsOverview()
    
    return NextResponse.json(overview)
  } catch (error) {
    logger.error('[api/deals/overview] Error fetching deals overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals overview' },
      { status: 500 }
    )
  }
}