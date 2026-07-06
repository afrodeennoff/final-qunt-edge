import { NextResponse, type NextRequest } from 'next/server'
import { connection } from 'next/server'
import { getFirmById } from '@/server/deals'
import { logger } from '@/lib/logger'
import { requireDealsApiAuth } from '../../_auth'
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
    
    const firm = await getFirmById(id)
    
    if (!firm) {
      return NextResponse.json(
        { error: 'Firm not found' },
        { status: 404 }
      )
    }
    
    const firmRes = NextResponse.json(firm)
    firmRes.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    return firmRes
  } catch (error) {
    logger.error('[api/deals/firms/[id]] Error fetching firm:', error)
    return NextResponse.json(
      { error: 'Failed to fetch firm' },
      { status: 500 }
    )
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'deals-firm-detail',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'deals-firm-detail',
})
