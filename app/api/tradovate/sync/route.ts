import { z } from "zod"
import {
  getTradovateToken,
  getTradovateTrades,
} from "@/app/[locale]/dashboard/components/import/tradovate/sync/actions"
import { createRouteClient } from "@/lib/supabase/route-client"
import { withApiRoute, apiSuccess, apiErrorWithId } from "@/lib/api/with-api-route"
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate"

const syncSchema = z.object({
  accountId: z.string().min(1, "accountId is required"),
})

export const POST = withApiRoute(
  async (ctx) => {
    const supabase = createRouteClient(ctx.request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return apiErrorWithId(ctx.requestId, 'UNAUTHORIZED', 'Unauthorized', 401)
    }

    try {
      const { accountId } = await parseJson(ctx.request, syncSchema)

      const tokenResult = await getTradovateToken(accountId)
      if (tokenResult.error || !tokenResult.accessToken) {
        return apiErrorWithId(ctx.requestId, 'BAD_REQUEST', tokenResult.error || "Missing Tradovate access token", 400)
      }

      const syncResult = await getTradovateTrades(tokenResult.accessToken, {
        includedFeeTypes: tokenResult.includedFeeTypes,
      })
      if (syncResult.error) {
        return apiErrorWithId(ctx.requestId, 'BAD_REQUEST', syncResult.error, 400)
      }

      return apiSuccess({
        success: true,
        savedCount: syncResult.savedCount ?? 0,
        ordersCount: syncResult.ordersCount ?? 0,
        message: "Sync completed",
      })
    } catch (error) {
      const parsed = toValidationErrorResponse(error)
      if (parsed) return parsed
      return apiErrorWithId(ctx.requestId, 'INTERNAL_ERROR', "Failed to perform Tradovate sync", 500)
    }
  },
  { rateLimitId: 'tradovate-sync-write', rateLimitMax: 30, routeName: 'tradovate-sync' }
)
