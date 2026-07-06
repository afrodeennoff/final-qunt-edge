import { NextRequest } from 'next/server'
import { getTradesAction } from '@/server/database'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'

const MAX_PAGE_SIZE = 200

async function handleGet(request: NextRequest, _ctx: { params: Promise<Record<string, string>> }) {
  const requestId = crypto.randomUUID()
  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError(
        'UNAUTHORIZED',
        'Authentication required',
        401,
        { requestId },
        {
          'Cache-Control': 'no-store, max-age=0',
        },
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') ?? '1')
    const pageSizeRaw = Number(searchParams.get('pageSize') ?? '50')
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), MAX_PAGE_SIZE)

    if (!Number.isFinite(page) || page < 1) {
      return apiError(
        'BAD_REQUEST',
        'Invalid page parameter',
        400,
        { requestId },
        {
          'Cache-Control': 'no-store, max-age=0',
        },
      )
    }

    const result = await getTradesAction(null, page, pageSize, true, false)
    return apiSuccess(result, 200, 'private, max-age=30')
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to fetch trades',
      500,
      {
        requestId,
      },
      {
        'Cache-Control': 'no-store, max-age=0',
      },
    )
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'dashboard-trades',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'dashboard-trades',
})
