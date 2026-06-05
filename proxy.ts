import { type NextRequest, NextResponse } from 'next/server'
import { createI18nMiddleware } from 'next-international/middleware'
import { createServerClient } from '@supabase/ssr'
import { geolocation } from '@vercel/functions'
import { User } from '@supabase/supabase-js'
import { buildAppCsp, buildEmbedCsp, createNonce } from '@/lib/security/csp'
import { assertSecurityEnvConsistency } from '@/lib/env'
import { shouldSkipLocalePrefix } from '@/lib/locale-path'
import { timingSafeEqual } from 'node:crypto'

try {
  assertSecurityEnvConsistency()
} catch (error) {
  // Never fail middleware hard at runtime due env policy mismatch.
  // Validation still needs to be enforced by CI/release gates.
  console.error('[Proxy] Security environment validation failed:', error)
}

// Maintenance mode flag - Set to true to enable maintenance mode
const MAINTENANCE_MODE = false

// ── CORS Configuration ──────────────────────────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  'https://qunt-edge.vercel.app',
  'https://www.qunt-edge.vercel.app',
])
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.add('http://localhost:3000')
  ALLOWED_ORIGINS.add('http://127.0.0.1:3000')
}
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  return ALLOWED_ORIGINS.has(origin)
}

function parseCsvEnv(value?: string): string[] {
  return (
    value
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? []
  )
}

function normalizeEnvValue(value?: string): string {
  return value?.trim() ?? ''
}

function timingSafeStringEqual(candidate: string, expected: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected))
  } catch {
    return false
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(message)), timeoutMs),
  )
  return Promise.race([promise, timeoutPromise])
}

function getErrorMessage(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === 'object' && value !== null && 'message' in value) {
    const message = (value as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return ''
}

function isSupabaseJsonParseError(error: unknown): boolean {
  const primary = getErrorMessage(error).toLowerCase()
  const originalError =
    typeof error === 'object' && error !== null && 'originalError' in error
      ? getErrorMessage((error as { originalError?: unknown }).originalError).toLowerCase()
      : ''
  const combined = `${primary} ${originalError}`
  return combined.includes('unexpected token') || combined.includes('is not valid json')
}

function isAdmin(userId: string): boolean {
  const allowedUserIds = parseCsvEnv(process.env.ALLOWED_ADMIN_USER_ID)

  if (userId && allowedUserIds.includes(userId.toLowerCase())) {
    return true
  }

  const deprecatedAdminId = process.env.ADMIN_USER_ID
  if (deprecatedAdminId && userId.toLowerCase() === deprecatedAdminId.toLowerCase()) {
    return true
  }

  return false
}

function handleCronAuth(request: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET
  const vercelCronSecret = process.env.VERCEL_CRON_SECRET

  if (!cronSecret && !vercelCronSecret) {
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }

  const vercelCronHeader = request.headers.get('x-vercel-cron')
  if (
    vercelCronHeader &&
    vercelCronSecret &&
    timingSafeStringEqual(vercelCronHeader, vercelCronSecret)
  ) {
    return null
  }

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing cron token' }, { status: 401 })
  }

  if (cronSecret) {
    if (timingSafeStringEqual(token, cronSecret)) {
      return null
    }
  }

  return NextResponse.json({ error: 'Unauthorized: Invalid cron token' }, { status: 401 })
}

async function handleAdminAuth(
  request: NextRequest,
): Promise<{ error: NextResponse } | { user: User }> {
  const supabaseUrl = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  )
  const supabaseAnonKey = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  )

  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: () => {},
    },
  })

  let user: User | null = null
  try {
    const result = await withTimeout(supabase.auth.getUser(), 5000, 'Auth timeout')
    user = result.data?.user ?? null
  } catch {
    return {
      error: NextResponse.json({ error: 'Unauthorized: No valid session' }, { status: 401 }),
    }
  }

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized: No valid session' }, { status: 401 }),
    }
  }

  if (!isAdmin(user.id)) {
    return {
      error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }),
    }
  }

  return { user }
}

// Use redirect strategy to ensure users are always on valid localized paths
const I18nMiddleware = createI18nMiddleware({
  locales: ['en', 'fr', 'de', 'es', 'it', 'pt', 'vi', 'hi', 'ja', 'zh', 'yo'],
  defaultLocale: 'en',
  urlMappingStrategy: 'redirect',
})

const LOCALES = ['en', 'fr', 'de', 'es', 'it', 'pt', 'vi', 'hi', 'ja', 'zh', 'yo'] as const
const LOCALE_SET = new Set<string>(LOCALES)
const STATIC_FILE_REGEX = /\.[^/]+$/
const PUBLIC_DOCUMENT_PATH_PREFIXES = [
  '/',
  '/about',
  '/pricing',
  '/updates',
  '/faq',
  '/docs',
  '/terms',
  '/privacy',
  '/support',
  '/community',
  '/propfirms',
  '/firm',
  '/deals',
  '/blogs',
  '/leaderboard',
  '/trader',
  '/best-trading-journal',
  '/referral',
  '/newsletter',
  '/disclaimers',
  '/maintenance',
  '/oauth',
]
const PRIVATE_DOCUMENT_PATH_PREFIXES = [
  '/dashboard',
  '/teams/dashboard',
  '/teams/manage',
  '/teams/join',
  '/authentication',
  '/admin',
]
const PUBLIC_READ_API_PATHS = new Set<string>([])
const PUBLIC_API_PATH_PREFIXES = [
  '/api/health',
  '/api/ready',
  '/api/og',
  '/api/email/unsubscribe',
  '/api/email/welcome',
  '/api/csp-report',
  '/api/auth/callback',
  '/api/whop/checkout',
  '/api/whop/checkout-team',
  '/api/whop/webhook',
  '/api/tradovate/auth',
  '/api/rithmic/callback',
  '/api/mcp/public',
  '/api/oauth/',
  '/.well-known/',
]
const PRIVATE_API_PATH_PREFIXES = ['/api/']
const CUSTOM_TOKEN_API_PATH_PREFIXES = ['/api/mt5/', '/api/thor/', '/api/etp/', '/api/mcp']

type RouteClass =
  | 'static-asset'
  | 'embed'
  | 'public-api'
  | 'private-api'
  | 'public-document'
  | 'private-document'
  | 'other-document'

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie')
  return Boolean(
    cookieHeader && cookieHeader.includes('sb-') && cookieHeader.includes('auth-token'),
  )
}

function isRootOrLocaleRootPath(pathname: string): boolean {
  if (pathname === '/') return true
  return LOCALES.some((locale) => pathname === `/${locale}`)
}

function getLocale(pathname: string): string {
  const firstSegment = pathname.split('/')[1]
  return LOCALE_SET.has(firstSegment) ? firstSegment : 'en'
}

function normalizePathWithoutLocale(pathname: string): string {
  const segment = pathname.split('/')[1]
  if (!segment || !LOCALE_SET.has(segment)) return pathname
  const normalized = pathname.replace(new RegExp(`^/${segment}(?=/|$)`), '')
  return normalized || '/'
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix === '/') return pathname === '/'
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function isPrivateDocumentRoute(pathname: string): boolean {
  const normalizedPath = normalizePathWithoutLocale(pathname)
  return PRIVATE_DOCUMENT_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(normalizedPath, prefix))
}

function isPublicDocumentRoute(pathname: string): boolean {
  const normalizedPath = normalizePathWithoutLocale(pathname)
  return PUBLIC_DOCUMENT_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(normalizedPath, prefix))
}

function isPublicReadApiRoute(pathname: string): boolean {
  return PUBLIC_READ_API_PATHS.has(pathname)
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))
}

function isPrivateApiRoute(pathname: string): boolean {
  return PRIVATE_API_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isCustomTokenApiRoute(pathname: string): boolean {
  return CUSTOM_TOKEN_API_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/** Remote MCP clients (Cursor, OpenCode, Grok, etc.) use varied Origin headers. */
function isMcpApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/mcp')
}

function classifyRoute(pathname: string): RouteClass {
  const normalizedPathname = normalizePathWithoutLocale(pathname)
  const isStaticAsset =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/videos/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('/opengraph-image') ||
    pathname.includes('/twitter-image') ||
    pathname.includes('/icon') ||
    STATIC_FILE_REGEX.test(pathname)

  if (isStaticAsset) return 'static-asset'
  if (pathMatchesPrefix(normalizedPathname, '/embed')) return 'embed'
  if (isPublicApiRoute(pathname)) return 'public-api'
  if (isPrivateApiRoute(pathname)) return 'private-api'
  if (isPrivateDocumentRoute(pathname)) return 'private-document'
  if (isPublicDocumentRoute(pathname)) return 'public-document'
  return 'other-document'
}

function applyPrivateNoStoreHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('x-dashboard-cache-policy', 'private-no-store')
}

function applyPublicRevalidateHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400')
  response.headers.set('x-dashboard-cache-policy', 'public-revalidate')
}

function redirectWithPrivateNoStore(url: URL) {
  const redirectResponse = NextResponse.redirect(url)
  applySecurityHeaders(redirectResponse)
  applyPrivateNoStoreHeaders(redirectResponse)
  return redirectResponse
}

async function updateSession(request: NextRequest) {
  const response = NextResponse.next()
  const supabaseUrl = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  )
  const supabaseAnonKey = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  )

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Proxy] Missing Supabase URL or anon key; skipping session refresh.')
    return { response, user: null, error: new Error('Missing Supabase environment variables') }
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Preserve Supabase defaults while enforcing secure production behavior.
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

  let user: User | null = null
  let error: unknown = null

  try {
    // Add timeout to prevent hanging requests
    const result = await withTimeout(supabase.auth.getUser(), 5000, 'Auth timeout')
    user = result.data?.user || null
    error = result.error
  } catch (authError: unknown) {
    // Handle JSON parsing errors from Supabase API (when API returns HTML instead of JSON)
    if (isSupabaseJsonParseError(authError)) {
      console.error('[Proxy] Supabase API returned non-JSON response:', authError)
      // Don't throw - gracefully handle auth failures by treating as unauthenticated
      user = null
      error = new Error('Authentication service temporarily unavailable')
    } else {
      console.warn('Auth check failed:', authError)
      // Don't throw - gracefully handle auth failures
      user = null
      error = authError
    }
  }

  // Do not expose auth identity or auth error details via response headers.
  // Downstream code must derive identity from Supabase session server-side.

  return { response, user, error }
}

async function handlePrivateApiAuth(request: NextRequest): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname
  if (isCustomTokenApiRoute(pathname)) {
    // Custom token routes use their own auth (Bearer token or session).
    // Enforce baseline: at least one credential must be present.
    // Special case for MCP: the MCP endpoints implement their own authentication
    // model (qunt_usr_* / qunt_adm_* keys). We let them through unconditionally here
    // so that unauthenticated initialize/ping/discovery succeed (per MCP spec and
    // for remote clients like Grok), and the MCP handler returns proper JSON-RPC
    // auth errors only for methods that require it. This prevents proxy-level 401
    // from breaking protocol handshakes or public discovery on /api/mcp/public.
    if (pathname.startsWith('/api/mcp')) {
      return null
    }
    const authHeader = request.headers.get('authorization')
    const hasCookie = hasSupabaseAuthCookie(request)
    if (!authHeader && !hasCookie) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
    }
    return null
  }

  const supabaseUrl = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  )
  const supabaseAnonKey = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  )

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: () => {},
    },
  })

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  try {
    const authPromise = token ? supabase.auth.getUser(token) : supabase.auth.getUser()
    const result = await withTimeout(authPromise, 5000, 'Auth timeout')
    const user = result.data?.user ?? null

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    return null
  } catch {
    return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }
}

function setCspHeader(response: NextResponse, csp: string, reportOnly: boolean) {
  response.headers.delete('Content-Security-Policy')
  response.headers.delete('Content-Security-Policy-Report-Only')
  response.headers.set(
    reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
    csp,
  )
}

function attachRequestHeaders(response: NextResponse, headers: Headers) {
  const headerForwardingResponse = NextResponse.next({
    request: {
      headers,
    },
  })

  headerForwardingResponse.headers.forEach((value, key) => {
    if (key === 'x-middleware-override-headers' || key.startsWith('x-middleware-request-')) {
      response.headers.set(key, value)
    }
  })
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const normalizedPathname = normalizePathWithoutLocale(pathname)
  const origin = req.headers.get('origin')
  const locale = getLocale(pathname)
  const routeClass = classifyRoute(pathname)
  const isDashboardRoute = pathMatchesPrefix(normalizedPathname, '/dashboard')
  const isTeamsProtectedRoute =
    pathMatchesPrefix(normalizedPathname, '/teams/dashboard') ||
    pathMatchesPrefix(normalizedPathname, '/teams/manage') ||
    pathMatchesPrefix(normalizedPathname, '/teams/join')
  const isAdminRoute = pathMatchesPrefix(normalizedPathname, '/admin')
  const isAuthRoute = pathMatchesPrefix(normalizedPathname, '/authentication')
  const isEmbedRoute = routeClass === 'embed'
  const isApiRoute = routeClass === 'public-api' || routeClass === 'private-api'
  const isDev = process.env.NODE_ENV === 'development'
  const cspEnabled = process.env.CSP_ENABLED !== 'false'
  const cspReportOnly = process.env.CSP_REPORT_ONLY
    ? process.env.CSP_REPORT_ONLY === 'true'
    : process.env.NODE_ENV !== 'production'
  const cspStrictMode = process.env.CSP_STRICT_MODE === 'true'

  // More specific static asset exclusions - must be first!
  if (routeClass === 'static-asset') {
    return NextResponse.next()
  }

  // ── CORS handling for API routes ─────────────────────────────────────────
  if (isApiRoute) {
    const mcpApi = isMcpApiPath(pathname)

    // Preflight
    if (req.method === 'OPTIONS') {
      const headers = new Headers()
      if (mcpApi) {
        headers.set('Access-Control-Allow-Origin', '*')
      } else if (origin && isAllowedOrigin(origin)) {
        headers.set('Access-Control-Allow-Origin', origin)
      }
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      headers.set(
        'Access-Control-Allow-Headers',
        mcpApi
          ? 'Content-Type, Authorization, X-Requested-With, X-API-Key, X-Qunt-Api-Key, Accept, Mcp-Session-Id, MCP-Protocol-Version'
          : 'Content-Type, Authorization, X-Requested-With',
      )
      headers.set('Access-Control-Max-Age', '86400')
      if (!mcpApi) {
        headers.set('Access-Control-Allow-Credentials', 'true')
      }
      return new NextResponse(null, { status: 204, headers })
    }

    // Reject cross-origin requests from disallowed origins (MCP exempt — remote AI clients)
    if (!mcpApi && origin && !isAllowedOrigin(origin)) {
      return NextResponse.json(
        { error: 'Origin not allowed', code: 'CORS_REJECTED' },
        { status: 403 },
      )
    }

    if (!isPublicApiRoute(pathname)) {
      if (pathname.startsWith('/api/cron/')) {
        const cronError = handleCronAuth(req)
        if (cronError) return cronError
      } else if (pathname.startsWith('/api/admin/')) {
        const adminResult = await handleAdminAuth(req)
        if ('error' in adminResult) return adminResult.error
        // Admin auth validated — identity is resolved downstream from session
      } else {
        const authError = await handlePrivateApiAuth(req)
        if (authError) return authError
      }
    }

    // Let API routes pass through with security headers + optional CORS
    const apiResponse = NextResponse.next()
    // Do not forward admin user identity via response headers — downstream code
    // must derive identity from the Supabase session server-side to avoid leakage.
    applySecurityHeaders(apiResponse)
    if (req.method === 'GET' && isPublicReadApiRoute(pathname)) {
      apiResponse.headers.set(
        'Cache-Control',
        'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      )
      apiResponse.headers.set('x-dashboard-cache-policy', 'public-read-api')
    } else {
      applyPrivateNoStoreHeaders(apiResponse)
    }
    // Attach CORS header for allowed cross-origin API requests
    if (mcpApi) {
      apiResponse.headers.set('Access-Control-Allow-Origin', '*')
    } else if (origin && isAllowedOrigin(origin)) {
      apiResponse.headers.set('Access-Control-Allow-Origin', origin)
      apiResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    return apiResponse
  }

  // OAuth consent lives at /oauth/* (not under [locale]). Skip i18n redirect to /en/oauth/...
  if (pathname === '/oauth' || pathname.startsWith('/oauth/')) {
    const oauthResponse = NextResponse.next()
    applySecurityHeaders(oauthResponse)
    applyPublicRevalidateHeaders(oauthResponse)
    return oauthResponse
  }

  // Apply i18n middleware first
  // This handles basic redirects for / to /en, etc.
  const response = I18nMiddleware(req)

  // If i18n middleware returned a redirect (e.g. / -> /en), respect it immediately
  // to avoid running auth/session checks on the un-localized path
  if (response.status >= 300 && response.status < 400) {
    applySecurityHeaders(response)
    return response
  }

  const nonce = createNonce()

  // Embed route check (public path, no auth/session roundtrip needed)
  if (isEmbedRoute) {
    response.headers.delete('X-Frame-Options') // Allow framing

    // Check if request is from a local file or development environment
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    const isLocalFile = origin === 'null' || referer?.startsWith('file://') || (!origin && !referer)
    // If embedding from a local file (file://), omit CSP entirely so browsers don't block
    if (isLocalFile) {
      response.headers.delete('Content-Security-Policy')
      response.headers.delete('Content-Security-Policy-Report-Only')
      return response
    }

    // Development: omit CSP entirely to prevent frame-ancestors blocking during local testing
    if (isDev) {
      response.headers.delete('Content-Security-Policy')
      response.headers.delete('Content-Security-Policy-Report-Only')
      return response
    }

    // Production CSP - more restrictive
    const allowedOrigins = [
      "'self'",
      'https://*.deltalytix.app', // Main domain
      'https://*.beta.deltalytix.app', // Beta subdomain
      'file:', // For local HTML file testing (may be ignored by some browsers)
      'https://thortradecopier.com',
      'https://app.thortradecopier.com',
    ].join(' ')

    if (cspEnabled) {
      setCspHeader(response, buildEmbedCsp(allowedOrigins), cspReportOnly)
    }

    return response
  }

  // Check for protected routes
  const needsSessionCheck = isDashboardRoute || isTeamsProtectedRoute || isAdminRoute || isAuthRoute
  const hasAuthCookie = hasSupabaseAuthCookie(req)
  const shouldRunSessionCheck = needsSessionCheck && hasAuthCookie

  let user: User | null = null
  let error: unknown = null

  if (shouldRunSessionCheck) {
    const {
      response: authResponse,
      user: sessionUser,
      error: sessionError,
    } = await updateSession(req)
    user = sessionUser
    error = sessionError

    // Merge responses - copy headers from auth response to i18n response
    authResponse.headers.forEach((value, key) => {
      response.headers.set(key, value)
    })

    // Copy cookies from auth response
    authResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
      })
    })
  } else if (!hasAuthCookie && (isDashboardRoute || isTeamsProtectedRoute || isAdminRoute)) {
    // Fast path: protected route with no auth cookie -> redirect to auth
    // Use locale-aware path
    const authUrl = new URL(`/${locale}/authentication`, req.url)

    // Preserve search params or return path
    // IMPORTANT: If we are on /dashboard (no locale), this logic might execute if I18nMiddleware didn't redirect us yet (e.g. rewrite).
    // But since we switched to 'redirect' strategy, /dashboard should have been redirected to /en/dashboard by I18nMiddleware(req) call.
    // However, I18nMiddleware returns a response with 307. We are continuing execution.
    // If I18nMiddleware returned a redirect, we should probably respect it UNLESS we need to override it?
    // Actually, if I18nMiddleware returns a 307, response.status is 307.
    // We should check response.status before doing our own logic?

    // If Next-International wants to redirect, let it redirect.
    if (response.status >= 300 && response.status < 400) {
      applySecurityHeaders(response)
      applyPrivateNoStoreHeaders(response)
      return response
    }

    // If we are here, it means we are on a valid path (localized or root if rewrite was on... but we turned it off).
    // So pathname should be /en/dashboard or similar.

    // Strip locale from next param if we want cleanliness, or keep it.
    // let encodedSearchParams = `${pathname.substring(1)}${req.nextUrl.search}`
    // This logic was stripping first char? No. substring(1)

    // Better way to build 'next':
    const nextPath = pathname + req.nextUrl.search
    if (nextPath) {
      authUrl.searchParams.append('next', nextPath)
    }
    return redirectWithPrivateNoStore(authUrl)
  }

  // Maintenance mode check
  if (MAINTENANCE_MODE && !pathname.includes('/maintenance') && isDashboardRoute) {
    return redirectWithPrivateNoStore(new URL(`/${locale}/maintenance`, req.url))
  }

  // Admin route check with better error handling
  if (isAdminRoute) {
    if (!user || error) {
      const authUrl = new URL(`/${locale}/authentication`, req.url)
      authUrl.searchParams.set('error', 'admin_access_required')
      return redirectWithPrivateNoStore(authUrl)
    }

    const allowedAdminIds = [
      process.env.ADMIN_USER_ID,
      ...parseCsvEnv(process.env.ALLOWED_ADMIN_USER_ID),
    ].filter((v): v is string => Boolean(v))

    const userIdLower = user.id.toLowerCase()
    if (!allowedAdminIds.map((id: string) => id.toLowerCase()).includes(userIdLower)) {
      return redirectWithPrivateNoStore(new URL(`/${locale}/dashboard`, req.url))
    }
  }

  // Authentication checks with better error handling
  if (isDashboardRoute || isTeamsProtectedRoute) {
    if (!user || error) {
      const nextPath = pathname + req.nextUrl.search
      const authUrl = new URL(`/${locale}/authentication`, req.url)

      if (nextPath) {
        authUrl.searchParams.append('next', nextPath)
      }

      // Add error context for debugging
      if (error) {
        authUrl.searchParams.set('auth_error', 'session_invalid')
      }

      return redirectWithPrivateNoStore(authUrl)
    }
  } else if (isAuthRoute) {
    // Authenticated - redirect from auth to dashboard
    if (user && !error) {
      const nextParam = req.nextUrl.searchParams.get('next')

      let redirectPath = '/dashboard'
      if (nextParam) {
        const trimmedNext = nextParam.trim()
        const isExternalNext =
          trimmedNext.startsWith('http://') ||
          trimmedNext.startsWith('https://') ||
          trimmedNext.startsWith('//') ||
          trimmedNext.startsWith('\\\\')

        if (!isExternalNext && trimmedNext) {
          const nextPath = trimmedNext.startsWith('/') ? trimmedNext : `/${trimmedNext}`
          const nextPathname = nextPath.split('?')[0]?.split('#')[0] ?? nextPath
          const normalizedNextPath = normalizePathWithoutLocale(nextPathname)

          // Prevent self-redirect loops back to authentication.
          if (!pathMatchesPrefix(normalizedNextPath, '/authentication')) {
            redirectPath = nextPath
          }
        }
      }

      // Ensure redirect path has locale if missing and starts with /
      if (
        redirectPath.startsWith('/') &&
        !LOCALES.some((l) => redirectPath.startsWith(`/${l}`)) &&
        !shouldSkipLocalePrefix(redirectPath.split('?')[0] ?? redirectPath)
      ) {
        redirectPath = `/${locale}${redirectPath}`
      }

      const redirectUrl = new URL(redirectPath, req.url)
      const normalizedRedirectPath = normalizePathWithoutLocale(redirectUrl.pathname)
      if (pathMatchesPrefix(normalizedRedirectPath, '/authentication')) {
        redirectUrl.pathname = `/${locale}/dashboard`
        redirectUrl.search = ''
      }

      return redirectWithPrivateNoStore(redirectUrl)
    }
  }

  // Geolocation handling: run once per visitor (cookie cache) to reduce edge work.
  const hasCountryCookie = Boolean(req.cookies.get('user-country')?.value)
  const shouldResolveGeolocation = !hasCountryCookie && isRootOrLocaleRootPath(pathname)
  if (shouldResolveGeolocation) {
    try {
      const geo = geolocation(req)

      if (geo.country) {
        response.headers.set('x-user-country', geo.country)
        response.cookies.set('user-country', geo.country, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days to minimize repeated edge geo work
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        })
      }

      if (geo.city) {
        response.headers.set('x-user-city', encodeURIComponent(geo.city))
      }

      if (geo.countryRegion) {
        response.headers.set('x-user-region', encodeURIComponent(geo.countryRegion))
      }
    } catch {
      // Fallback to Vercel headers
      const country = req.headers.get('x-vercel-ip-country')
      const city = req.headers.get('x-vercel-ip-city')
      const region = req.headers.get('x-vercel-ip-country-region')

      if (country) {
        response.headers.set('x-user-country', country)
        response.cookies.set('user-country', country, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        })
      }
      if (city) response.headers.set('x-user-city', encodeURIComponent(city))
      if (region) response.headers.set('x-user-region', encodeURIComponent(region))
    }
  }

  if (cspEnabled) {
    const appCsp = buildAppCsp({
      nonce,
      isDev,
      strictMode: cspStrictMode,
      reportOnly: cspReportOnly,
    })
    setCspHeader(response, appCsp, cspReportOnly)
  }

  applySecurityHeaders(response)

  // Route-class cache policy split:
  // - private documents: strict no-store
  // - public documents: revalidated public cacheability
  if (routeClass === 'private-document') {
    applyPrivateNoStoreHeaders(response)
  } else if (routeClass === 'public-document') {
    applyPublicRevalidateHeaders(response)
  }

  return response
}

// ── Security Headers ────────────────────────────────────────────────────────
function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - opengraph-image (Open Graph image generation)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|twitter-image|icon|.*\\..*).*)',
  ],
}
