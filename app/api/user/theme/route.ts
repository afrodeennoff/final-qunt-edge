import { withRateLimited } from '@/lib/api/with-api-route'
import { NextRequest, NextResponse } from 'next/server'
import { getUserDashboardTheme, setUserDashboardTheme } from '@/server/user-data'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'
import { VALID_DASHBOARD_THEMES, type DashboardTheme } from '@/lib/constants/dashboard-themes'

async function handleGet(request: NextRequest) {
  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401, undefined, {
        'Cache-Control': 'no-store, max-age=0',
      })
    }

    const theme = await getUserDashboardTheme()
    return NextResponse.json({ theme: theme || 'blue' }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to fetch theme',
      500,
      undefined,
      {
        'Cache-Control': 'no-store, max-age=0',
      },
    )
  }
}

export async function PUT(request: Request) {
  // Rate limiting for theme writes
  const { rateLimit, createRateLimitResponse } = await import('@/lib/rate-limit')
  const limiter = rateLimit({ limit: 30, window: 60_000, identifier: 'user-theme-write' })
  const rlResult = await limiter(request as unknown as NextRequest)
  if (!rlResult.success) {
    return createRateLimitResponse({
      limit: rlResult.limit,
      remaining: rlResult.remaining,
      resetTime: rlResult.resetTime,
    })
  }

  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401, undefined, {
        'Cache-Control': 'no-store, max-age=0',
      })
    }

    const body = await request.json()
    const { theme } = body

    if (!theme || typeof theme !== 'string') {
      return apiError('VALIDATION_FAILED', 'Theme is required', 400, undefined, {
        'Cache-Control': 'no-store, max-age=0',
      })
    }

    if (!(VALID_DASHBOARD_THEMES as readonly DashboardTheme[]).includes(theme as DashboardTheme)) {
      return apiError('VALIDATION_FAILED', `Invalid theme. Must be one of: ${VALID_DASHBOARD_THEMES.join(', ')}`, 400, undefined, {
        'Cache-Control': 'no-store, max-age=0',
      })
    }

    const updatedTheme = await setUserDashboardTheme(theme)
    return NextResponse.json({ theme: updatedTheme }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to update theme',
      500,
      undefined,
      {
        'Cache-Control': 'no-store, max-age=0',
      },
    )
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'user-theme',
  rateLimitMax: 30,
  rateLimitWindow: 60_000,
  routeName: 'user-theme',
})
