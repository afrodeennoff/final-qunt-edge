import { NextResponse } from 'next/server'
import { getUserDashboardTheme, setUserDashboardTheme, VALID_DASHBOARD_THEMES } from '@/server/user-data'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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
      error instanceof Error ? error.message : undefined,
      {
        'Cache-Control': 'no-store, max-age=0',
      },
    )
  }
}

export async function PUT(request: Request) {
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

    if (!VALID_DASHBOARD_THEMES.includes(theme as any)) {
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
      error instanceof Error ? error.message : undefined,
      {
        'Cache-Control': 'no-store, max-age=0',
      },
    )
  }
}
