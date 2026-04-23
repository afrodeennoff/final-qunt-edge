import { NextRequest } from 'next/server'
import { Prisma } from '@/prisma/generated/prisma'
import { getAccountsAction } from '@/server/accounts'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'

function serializeWithDecimals<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) => {
      if (nested instanceof Prisma.Decimal) {
        return nested.toString()
      }
      return nested
    }),
  ) as T
}

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

    const accounts = await getAccountsAction()
    return apiSuccess(serializeWithDecimals(accounts), 200, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to fetch accounts',
      500,
      {
        requestId,
        message: error instanceof Error ? error.message : undefined,
      },
      {
        'Cache-Control': 'no-store, max-age=0',
      },
    )
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'dashboard-accounts',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'dashboard-accounts',
})
