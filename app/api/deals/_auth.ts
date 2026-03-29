import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'

function getBearerToken(headerValue: string | null): string | null {
  if (!headerValue || !headerValue.startsWith('Bearer ')) return null
  const token = headerValue.slice(7).trim()
  return token.length > 0 ? token : null
}

export async function requireDealsApiAuth(request: Request) {
  try {
    const supabase = createRouteClient(request)
    const bearerToken = getBearerToken(request.headers.get('authorization'))
    const {
      data: { user },
      error,
    } = bearerToken
      ? await supabase.auth.getUser(bearerToken)
      : await supabase.auth.getUser()

    if (error || !user?.id) {
      return {
        ok: false as const,
        response: apiError('UNAUTHORIZED', 'Authentication required', 401, undefined, {
          'Cache-Control': 'no-store, max-age=0',
        }),
      }
    }

    return { ok: true as const, userId: user.id }
  } catch {
    return {
      ok: false as const,
      response: apiError('UNAUTHORIZED', 'Authentication required', 401, undefined, {
        'Cache-Control': 'no-store, max-age=0',
      }),
    }
  }
}
