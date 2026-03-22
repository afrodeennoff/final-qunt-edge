import { NextResponse } from 'next/server'
import { getDealsSpotlights } from '@/server/deals'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours (spotlights change infrequently)

export async function GET(request: Request) {
  try {
    const spotlights = await getDealsSpotlights()
    
    return NextResponse.json(spotlights)
  } catch (error) {
    logger.error('[api/deals/spotlights] Error fetching deals spotlights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals spotlights' },
      { status: 500 }
    )
  }
}