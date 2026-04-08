import { createServerClient } from "@supabase/ssr"
import { ensureUserInDatabase, getWebsiteURL } from '@/server/auth'
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: unknown }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  )
}

function parseStateCookie(cookieHeader: string): string | undefined {
  const match = cookieHeader.match(/(?:^|;\s*)oauth_state=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

/**
 * Creates a Supabase client that reads request cookies and writes session
 * cookies directly onto the given NextResponse object. This is required in
 * Route Handlers so that exchangeCodeForSession tokens survive the redirect.
 */
function createCallbackClient(request: Request, response: NextResponse) {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookieHeader = request.headers.get('cookie') || ''
        return cookieHeader
          .split(';')
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => {
            const eqIndex = c.indexOf('=')
            const name = eqIndex > 0 ? c.slice(0, eqIndex).trim() : c
            const value = eqIndex > 0 ? c.slice(eqIndex + 1).trim() : ''
            return { name, value }
          })
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: options?.sameSite ?? 'lax',
            httpOnly: options?.httpOnly ?? true,
          })
        })
      },
    },
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next')
  const action = searchParams.get('action')
  const locale = searchParams.get('locale') || undefined

  let normalizedNext: string | null = null
  if (next) {
    const decodedNext = decodeURIComponent(next).trim()
    const isAbsolute =
      decodedNext.startsWith('http://') ||
      decodedNext.startsWith('https://') ||
      decodedNext.startsWith('//') ||
      decodedNext.startsWith('\\\\')

    if (decodedNext && !isAbsolute) {
      normalizedNext = `/${decodedNext.replace(/^\/+/, '')}`
    }
  }

  const safeLocale = (() => {
    const raw = (locale || '').trim().toLowerCase()
    if (!raw) return 'en'
    if (!/^[a-z]{2}(-[a-z]{2})?$/.test(raw)) return 'en'
    return raw
  })()

  const withLocalePrefix = (path: string) => {
    const normalized = `/${path.replace(/^\/+/, '')}`
    if (normalized.startsWith('/api/')) return normalized
    if (/^\/[a-z]{2}(?:-[a-z]{2})?(?:\/|$)/i.test(normalized)) return normalized
    return `/${safeLocale}${normalized}`
  }

  const websiteURL = await getWebsiteURL()

  // --- OAuth CSRF Protection ---
  // Validate state parameter to prevent CSRF attacks on OAuth flows
  const stateParam = searchParams.get('state')
  const cookieHeader = request.headers.get('cookie') || ''
  const stateCookie = parseStateCookie(cookieHeader)

  if (stateCookie) {
    const stateMatches =
      !!stateParam &&
      stateParam.length === stateCookie.length &&
      timingSafeEqual(Buffer.from(stateParam), Buffer.from(stateCookie))

    if (
      !stateMatches
    ) {
      console.error('[Auth Callback] OAuth CSRF validation failed — state mismatch or missing')
      return NextResponse.redirect(
        new URL(withLocalePrefix('/authentication?error=csrf'), websiteURL)
      )
    }
  }
  // --- End OAuth CSRF Protection ---

  if (code) {
    try {
      // Create a response object upfront so Supabase can write session cookies onto it
      const response = NextResponse.next()
      const supabase = createCallbackClient(request, response)
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        if (type === 'recovery') {
          const redirectUrl = new URL(withLocalePrefix('/dashboard/settings?passwordReset=true'), websiteURL)
          const redirectResponse = NextResponse.redirect(redirectUrl)
          // Forward session cookies from the exchange to the redirect response
          response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, {
              path: cookie.path,
              domain: cookie.domain,
              expires: cookie.expires,
              httpOnly: cookie.httpOnly,
              secure: cookie.secure,
              sameSite: cookie.sameSite,
            })
          })
          return redirectResponse
        }

        if (action === 'link') {
          const redirectUrl = new URL(withLocalePrefix('/dashboard/settings?linked=true'), websiteURL)
          const redirectResponse = NextResponse.redirect(redirectUrl)
          response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, {
              path: cookie.path,
              domain: cookie.domain,
              expires: cookie.expires,
              httpOnly: cookie.httpOnly,
              secure: cookie.secure,
              sameSite: cookie.sameSite,
            })
          })
          return redirectResponse
        }

        let setupFailed = false
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await ensureUserInDatabase(user, locale, { skipDefaultLayout: true })
          }
        } catch (e) {
          if (isNextRedirectError(e)) {
            throw e
          }
          console.error('Auth callback ensureUserInDatabase error:', e)
          setupFailed = true
        }

        if (setupFailed) {
          return NextResponse.redirect(
            new URL(withLocalePrefix('/authentication?error=account_setup_failed'), websiteURL)
          )
        }

        // Build the final redirect and copy session cookies onto it
        const redirectPath = normalizedNext
          ? withLocalePrefix(normalizedNext)
          : withLocalePrefix('/dashboard')
        const redirectUrl = new URL(redirectPath, websiteURL)
        const redirectResponse = NextResponse.redirect(redirectUrl)

        // This is the critical fix: forward all Supabase session cookies
        // from the exchange response to the redirect response so the browser
        // actually receives the auth tokens.
        response.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value, {
            path: cookie.path,
            domain: cookie.domain,
            expires: cookie.expires,
            httpOnly: cookie.httpOnly,
            secure: cookie.secure,
            sameSite: cookie.sameSite,
          })
        })

        return redirectResponse
      }
    } catch (error: unknown) {
      if (isNextRedirectError(error)) {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : ''
      const originalErrorMessage =
        typeof error === 'object' &&
          error !== null &&
          'originalError' in error &&
          typeof (error as { originalError?: { message?: string } }).originalError?.message === 'string'
          ? (error as { originalError?: { message?: string } }).originalError?.message ?? ''
          : ''

      if (
        errorMessage.includes('Unexpected token') ||
        errorMessage.includes('is not valid JSON') ||
        originalErrorMessage.includes('Unexpected token') ||
        originalErrorMessage.includes('is not valid JSON')
      ) {
        console.error('[Auth Callback] Supabase API returned non-JSON response:', error)
        return NextResponse.redirect(new URL(withLocalePrefix('/authentication?error=service_unavailable'), websiteURL))
      }
      console.error('Auth callback unexpected error:', error)
    }
  }

  return NextResponse.redirect(new URL(withLocalePrefix('/authentication'), websiteURL))
}
