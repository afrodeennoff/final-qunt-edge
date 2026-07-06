import { z } from "zod"
import {
  getTradovateSynchronizations,
  removeTradovateToken,
} from "@/app/[locale]/dashboard/components/import/tradovate/sync/actions"
import { createRouteClient } from "@/lib/supabase/route-client"
import { withApiRoute, apiSuccess, apiErrorWithId } from "@/lib/api/with-api-route"
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate"

const deleteSchema = z.object({
  accountId: z.string().min(1, "accountId is required"),
})

export const GET = withApiRoute(
  async (ctx) => {
    const supabase = createRouteClient(ctx.request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return apiErrorWithId(ctx.requestId, 'UNAUTHORIZED', 'Unauthorized', 401)

    try {
      const result = await getTradovateSynchronizations()
      if (result.error) {
        return apiErrorWithId(ctx.requestId, 'BAD_REQUEST', result.error, 400)
      }
      return apiSuccess({ success: true, data: result.synchronizations || [] })
    } catch (error) {
      return apiErrorWithId(ctx.requestId, 'INTERNAL_ERROR', "Failed to fetch Tradovate synchronizations", 500)
    }
  },
  { rateLimitId: 'tradovate-sync-read', rateLimitMax: 30, routeName: 'tradovate-synchronizations' }
)

export const DELETE = withApiRoute(
  async (ctx) => {
    const supabase = createRouteClient(ctx.request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return apiErrorWithId(ctx.requestId, 'UNAUTHORIZED', 'Unauthorized', 401)

    try {
      const { accountId } = await parseJson(ctx.request, deleteSchema)
      const result = await removeTradovateToken(accountId)
      const deletedCount = typeof result === "object" && result !== null ? (result as { deletedCount?: number }).deletedCount : undefined

      if (deletedCount === 0) {
        return apiErrorWithId(ctx.requestId, 'NOT_FOUND', "Synchronization not found", 404)
      }

      return apiSuccess({ success: true, message: "Synchronization removed" })
    } catch (error) {
      const parsed = toValidationErrorResponse(error)
      if (parsed) return parsed
      return apiErrorWithId(ctx.requestId, 'INTERNAL_ERROR', "Failed to delete synchronization", 500)
    }
  },
  { rateLimitId: 'tradovate-sync-delete', rateLimitMax: 30, routeName: 'tradovate-synchronizations' }
)
