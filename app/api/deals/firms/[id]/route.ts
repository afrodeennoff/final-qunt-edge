import { NextResponse } from 'next/server'
import { getFirmById } from '@/server/deals'
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