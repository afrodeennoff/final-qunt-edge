import { NextRequest } from 'next/server'
import { z } from 'zod'
import { parseJson, toValidationErrorResponse } from '@/app/api/_utils/validate'
import { apiError } from '@/lib/api-response'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'
import { createRouteClient } from '@/lib/supabase/route-client'
import { getDxFeedToken, getDxFeedTrades } from '@/server/imports/dxfeed-actions'

const dxFeedSyncBodySchema = z.object({
  accountId: z.string().min(1),
})

async function requireSessionUser(request: Request) {
  const supabase = createRouteClient(request)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user, error }
}

async function handlePost(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const { user, error } = await requireSessionUser(request)
    if (error || !user?.id) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401, { requestId })
    }

    const { accountId } = await parseJson(request, dxFeedSyncBodySchema)
    const tokenResult = await getDxFeedToken(accountId)
    if (tokenResult.error || !tokenResult.storedTokenJson) {
      return apiError('BAD_REQUEST', tokenResult.error || 'Missing DxFeed credentials', 400, {
        requestId,
      })
    }

    const syncResult = await getDxFeedTrades(tokenResult.storedTokenJson, {
      userId: user.id,
      accountId,
    })

    if (syncResult.error) {
      if (syncResult.error === 'DUPLICATE_TRADES') {
        return apiSuccess({
          success: true,
          savedCount: 0,
          tradesCount: syncResult.tradesCount ?? 0,
          message: 'DUPLICATE_TRADES',
        })
      }

      return apiError('BAD_REQUEST', syncResult.error, 400, { requestId })
    }

    return apiSuccess({
      success: true,
      savedCount: syncResult.savedCount ?? 0,
      tradesCount: syncResult.tradesCount ?? 0,
      message: 'Sync completed',
    })
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    console.error('Error performing DxFeed sync:', error)
    return apiError('INTERNAL_ERROR', 'Failed to perform DxFeed sync', 500, { requestId })
  }
}

export const POST = withRateLimited(handlePost, {
  rateLimitId: 'dxfeed-sync',
  rateLimitMax: 20,
  rateLimitWindow: 60_000,
  routeName: 'dxfeed/sync',
})
