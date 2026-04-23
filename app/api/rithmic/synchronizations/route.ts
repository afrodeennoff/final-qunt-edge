import { NextRequest } from 'next/server'
import {
  getRithmicSynchronizations,
  setRithmicSynchronization,
  removeRithmicSynchronization,
} from '@/server/imports/rithmic-sync-actions'
import { createRouteClient } from '@/lib/supabase/route-client'
import { z } from 'zod'
import { parseJson, toValidationErrorResponse } from '@/app/api/_utils/validate'
import { apiError } from '@/lib/api-response'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'

const rithmicSyncWriteBodySchema = z
  .object({
    accountId: z.string().min(1),
  })
  .strict()
const rithmicSyncDeleteBodySchema = z.object({
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

    const synchronizations = await getRithmicSynchronizations()
    return apiSuccess({ success: true, data: synchronizations })
  } catch (error) {
    console.error('Error fetching Rithmic synchronizations:', error)
    return apiError('INTERNAL_ERROR', 'Failed to fetch synchronizations', 500, { requestId })
  }
}

async function handlePost(request: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const { user, error } = await requireSessionUser(request)
    if (error || !user?.id) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401, { requestId })
    }

    const { accountId } = await parseJson(request, rithmicSyncWriteBodySchema)
    await setRithmicSynchronization({ accountId, service: 'rithmic' })
    return apiSuccess({
      success: true,
      message: 'Synchronization updated successfully',
    })
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    console.error('Error setting Rithmic synchronization:', error)
    return apiError('INTERNAL_ERROR', 'Failed to update synchronization', 500, { requestId })
  }
}

async function handleDelete(request: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const { user, error } = await requireSessionUser(request)
    if (error || !user?.id) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401, { requestId })
    }

    const { accountId } = await parseJson(request, rithmicSyncDeleteBodySchema)

    const result = await removeRithmicSynchronization(accountId)
    if (result.deletedCount === 0) {
      return apiError('NOT_FOUND', 'Synchronization not found', 404, { requestId })
    }

    return apiSuccess({
      success: true,
      message: 'Synchronization removed successfully',
    })
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    console.error('Error deleting Rithmic synchronization:', error)
    return apiError('INTERNAL_ERROR', 'Failed to delete synchronization', 500, { requestId })
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'rithmic-sync-read',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'rithmic/synchronizations:get',
})

export const POST = withRateLimited(handlePost, {
  rateLimitId: 'rithmic-sync-write',
  rateLimitMax: 20,
  rateLimitWindow: 60_000,
  routeName: 'rithmic/synchronizations:post',
})

export const DELETE = withRateLimited(handleDelete, {
  rateLimitId: 'rithmic-sync-write',
  rateLimitMax: 20,
  rateLimitWindow: 60_000,
  routeName: 'rithmic/synchronizations:delete',
})
