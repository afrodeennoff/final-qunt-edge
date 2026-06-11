import {
  getDxFeedAccounts,
  getDxFeedSynchronizations,
  removeDxFeedToken,
} from '@/app/[locale]/dashboard/components/import/dxfeed/sync/actions'
import { createRouteClient } from "@/lib/supabase/route-client"
import { withApiRoute, apiSuccess, apiErrorWithId } from "@/lib/api/with-api-route"
import { z } from "zod"
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate"

const deleteSchema = z.object({
  accountId: z.string().min(1, "accountId is required"),
})

export const GET = withApiRoute(
  async (ctx) => {
    const supabase = createRouteClient(ctx.request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return apiErrorWithId(ctx.requestId, 'UNAUTHORIZED', 'Unauthorized', 401)

    const result = await getDxFeedSynchronizations()
    if (result.error) {
      return apiErrorWithId(ctx.requestId, 'BAD_REQUEST', result.error, 400)
    }

    const sanitized = await Promise.all(
      (result.synchronizations || []).map(async ({ token, ...rest }) => {
        let accountNumbers: string[] = []
        if (token) {
          try {
            const parsed = JSON.parse(token) as {
              accessToken?: string
              historicalHost?: string
              accountNumbers?: string[]
            }

            if (Array.isArray(parsed.accountNumbers)) {
              accountNumbers = parsed.accountNumbers
            }

            if (
              accountNumbers.length === 0 &&
              typeof parsed.accessToken === 'string' &&
              typeof parsed.historicalHost === 'string'
            ) {
              const accounts = await getDxFeedAccounts(parsed.accessToken, parsed.historicalHost)
              accountNumbers = accounts.map(
                (account) =>
                  account.accountHeader || account.accountReference || account.accountId.toString(),
              )
            }
          } catch {
            /* ignore parse errors */
          }
        }

        return {
          ...rest,
          hasToken: !!token,
          accountNumbers,
        }
      }),
    )

    return apiSuccess({
      success: true,
      data: sanitized,
    })
  },
  { rateLimitId: 'dxfeed-sync-read', rateLimitMax: 30, routeName: 'dxfeed-synchronizations' }
)

export const DELETE = withApiRoute(
  async (ctx) => {
    const supabase = createRouteClient(ctx.request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return apiErrorWithId(ctx.requestId, 'UNAUTHORIZED', 'Unauthorized', 401)

    try {
      const { accountId } = await parseJson(ctx.request, deleteSchema)
      const result = await removeDxFeedToken(accountId)
      if (result.error) {
        return apiErrorWithId(ctx.requestId, 'BAD_REQUEST', result.error, 400)
      }

      return apiSuccess({
        success: true,
        message: 'Synchronization removed',
      })
    } catch (error) {
      const parsed = toValidationErrorResponse(error)
      if (parsed) return parsed
      return apiErrorWithId(ctx.requestId, 'INTERNAL_ERROR', 'Failed to delete synchronization', 500)
    }
  },
  { rateLimitId: 'dxfeed-sync-delete', rateLimitMax: 30, routeName: 'dxfeed-synchronizations' }
)
