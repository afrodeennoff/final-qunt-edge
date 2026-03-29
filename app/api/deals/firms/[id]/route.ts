import { NextResponse, type NextRequest } from 'next/server'
import { getFirmById } from '@/server/deals'
import { logger } from '@/lib/logger'
import { requireDealsApiAuth } from '../../_auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const firm = await getFirmById(id)
    
    if (!firm) {
      return NextResponse.json(
        { error: 'Firm not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(firm)
  } catch (error) {
    logger.error('[api/deals/firms/[id]] Error fetching firm:', error)
    return NextResponse.json(
      { error: 'Failed to fetch firm' },
      { status: 500 }
    )
  }
}
