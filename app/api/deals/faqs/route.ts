import { NextResponse } from 'next/server'
import { getDefaultFaqs } from '@/server/deals'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours (FAQs change infrequently)

export async function GET(request: Request) {
  try {
    const faqs = await getDefaultFaqs()
    
    return NextResponse.json(faqs)
  } catch (error) {
    logger.error('[api/deals/faqs] Error fetching deals FAQs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals FAQs' },
      { status: 500 }
    )
  }
}