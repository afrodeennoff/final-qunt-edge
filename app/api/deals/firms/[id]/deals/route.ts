import { NextResponse, type NextRequest } from 'next/server'
import { connection } from 'next/server'
import { getFirmDeals } from '@/server/deals'
import { logger } from '@/lib/logger'
import { requireDealsApiAuth } from '../../../_auth'
import { withRateLimited } from '@/lib/api/with-api-route'

async function handleGet(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection()
  try {
    const access = await requireDealsApiAuth(request)
    if (!access.ok) {
      return access.response
    }

    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Firm ID is required' },
        { status: 400 }
      )
    }
    
    const deals = await getFirmDeals(id)
    
    return NextResponse.json({
      deals,
      pagination: {
        total: deals.length,
        limit: deals.length,
        offset: 0,
        hasMore: false
      }
    })
  } catch (error) {
    logger.error('[api/deals/firms/[id]/deals] Error fetching firm deals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch firm deals' },
      { status: 500 }
    )
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'deals-firm-deals',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'deals-firm-deals',
})
