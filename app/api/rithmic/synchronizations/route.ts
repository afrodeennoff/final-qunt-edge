import { z } from "zod"
import {
  getRithmicSynchronizations,
  setRithmicSynchronization,
  removeRithmicSynchronization,
} from "@/app/[locale]/dashboard/components/import/rithmic/sync/actions"
import { createRouteClient } from "@/lib/supabase/route-client"
import { withApiRoute, apiSuccess, apiErrorWithId } from "@/lib/api/with-api-route"
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate"

const synchronizationSchema = z.object({
  accountId: z.string().min(1),
}).strict()

const deleteSchema = z.object({
  accountId: z.string().min(1, "accountId is required"),
})

export const GET = withApiRoute(
  async (ctx) => {
    const supabase = createRouteClient(ctx.request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return apiErrorWithId(ctx.requestId, 'UNAUTHORIZED', 'Unauthorized', 401)

    try {
      const synchronizations = await getRithmicSynchronizations()
      return apiSuccess({ success: true, data: synchronizations })
    } catch (error) {
      return apiErrorWithId(ctx.requestId, 'INTERNAL_ERROR', error instanceof Error ? error.message : "Failed to fetch synchronizations", 500)
    }
  },
  { rateLimitId: 'rithmic-sync-read', rateLimitMax: 30, routeName: 'rithmic-synchronizations' }
)

export const POST = withApiRoute(
  async (ctx) => {
    const supabase = createRouteClient(ctx.request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return apiErrorWithId(ctx.requestId, 'UNAUTHORIZED', 'Unauthorized', 401)

    try {
      const body = await parseJson(ctx.request, synchronizationSchema)
      await setRithmicSynchronization({ ...body, service: "rithmic" })
      return apiSuccess({ success: true, message: "Synchronization updated successfully" })
    } catch (error) {
      const parsed = toValidationErrorResponse(error)
      if (parsed) return parsed
      return apiErrorWithId(ctx.requestId, 'INTERNAL_ERROR', error instanceof Error ? error.message : "Failed to update synchronization", 500)
    }
  },
  { rateLimitId: 'rithmic-sync-write', rateLimitMax: 30, routeName: 'rithmic-synchronizations' }
)

export const DELETE = withApiRoute(
  async (ctx) => {
    const supabase = createRouteClient(ctx.request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return apiErrorWithId(ctx.requestId, 'UNAUTHORIZED', 'Unauthorized', 401)

    try {
      const { accountId } = await parseJson(ctx.request, deleteSchema)
      const result = await removeRithmicSynchronization(accountId)
      const deletedCount = typeof result === "object" && result !== null ? (result as { deletedCount?: number }).deletedCount : undefined

      if (deletedCount === 0) {
        return apiErrorWithId(ctx.requestId, 'NOT_FOUND', "Synchronization not found", 404)
      }

      return apiSuccess({ success: true, message: "Synchronization removed successfully" })
    } catch (error) {
      const parsed = toValidationErrorResponse(error)
      if (parsed) return parsed
      return apiErrorWithId(ctx.requestId, 'INTERNAL_ERROR', error instanceof Error ? error.message : "Failed to delete synchronization", 500)
    }
  },
  { rateLimitId: 'rithmic-sync-delete', rateLimitMax: 30, routeName: 'rithmic-synchronizations' }
)
