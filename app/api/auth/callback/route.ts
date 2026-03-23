import { createClient, ensureUserInDatabase, getWebsiteURL } from '@/server/auth'
import { NextResponse } from 'next/server'

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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
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

  if (stateParam || stateCookie) {
    if (!stateParam || !stateCookie || !timingSafeEqual(stateParam, stateCookie)) {
      console.error('[Auth Callback] OAuth CSRF validation failed — state mismatch or missing')
      return NextResponse.redirect(
        new URL(withLocalePrefix('/authentication?error=csrf'), websiteURL)
      )
    }
  }
  // --- End OAuth CSRF Protection ---

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        if (type === 'recovery') {
          return NextResponse.redirect(new URL(withLocalePrefix('/dashboard/settings?passwordReset=true'), websiteURL))
        }

        if (action === 'link') {
          return NextResponse.redirect(new URL(withLocalePrefix('/dashboard/settings?linked=true'), websiteURL))
        }

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
        }

        if (normalizedNext) {
          return NextResponse.redirect(new URL(withLocalePrefix(normalizedNext), websiteURL))
        }
        return NextResponse.redirect(new URL(withLocalePrefix('/dashboard'), websiteURL))
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
