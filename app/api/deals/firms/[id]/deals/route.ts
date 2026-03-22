import { NextResponse } from 'next/server'
import { getFirmDeals } from '@/server/deals'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
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