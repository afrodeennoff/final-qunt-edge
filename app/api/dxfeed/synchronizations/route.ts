import { NextRequest } from 'next/server'
import { z } from 'zod'
import { parseJson, toValidationErrorResponse } from '@/app/api/_utils/validate'
import { apiError } from '@/lib/api-response'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'
import { createRouteClient } from '@/lib/supabase/route-client'
import {
  getDxFeedSynchronizations,
  removeDxFeedToken,
} from '@/server/imports/dxfeed-actions'

const dxFeedDeleteBodySchema = z.object({
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

async function handleGet(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const { user, error } = await requireSessionUser(request)
    if (error || !user?.id) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401, { requestId })
    }

    const result = await getDxFeedSynchronizations()
    if (result.error) {
      if (result.error === 'User not authenticated') {
        return apiError('UNAUTHORIZED', result.error, 401, { requestId })
      }
      return apiError('BAD_REQUEST', result.error, 400, { requestId })
    }

    return apiSuccess({
      success: true,
      data: result.synchronizations || [],
    })
  } catch (error) {
    console.error('Error fetching DxFeed synchronizations:', error)
    return apiError('INTERNAL_ERROR', 'Failed to fetch DxFeed synchronizations', 500, {
      requestId,
    })
  }
}

async function handleDelete(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const { user, error } = await requireSessionUser(request)
    if (error || !user?.id) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401, { requestId })
    }

    const { accountId } = await parseJson(request, dxFeedDeleteBodySchema)
    const result = await removeDxFeedToken(accountId)
    if (result.error) {
      return apiError('BAD_REQUEST', result.error, 400, { requestId })
    }

    if (!result.deletedCount) {
      return apiError('NOT_FOUND', 'Synchronization not found', 404, { requestId })
    }

    return apiSuccess({
      success: true,
      message: 'Synchronization removed',
    })
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    console.error('Error deleting DxFeed synchronization:', error)
    return apiError('INTERNAL_ERROR', 'Failed to delete synchronization', 500, { requestId })
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'dxfeed-syncs',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'dxfeed-syncs',
})

export const DELETE = withRateLimited(handleDelete, {
  rateLimitId: 'dxfeed-syncs',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'dxfeed-syncs',
})
