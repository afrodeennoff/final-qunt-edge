import { NextRequest } from 'next/server'
import { Prisma } from '@/prisma/generated/prisma'
import { getAccountsAction } from '@/server/accounts'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'

function serializeWithDecimals<T>(value: T): T {
  if (value === null || value === undefined) return value
  if (typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(serializeWithDecimals) as unknown as T
  if (value instanceof Prisma.Decimal) return value.toNumber() as unknown as T

  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v instanceof Prisma.Decimal) {
      result[k] = v.toNumber()
    } else if (typeof v === 'object' && v !== null) {
      result[k] = serializeWithDecimals(v)
    } else {
      result[k] = v
    }
  }
  return result as T
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
    return apiSuccess(serializeWithDecimals(accounts), 200, 'private, max-age=30')
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to fetch accounts',
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
  rateLimitId: 'dashboard-accounts',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'dashboard-accounts',
})
