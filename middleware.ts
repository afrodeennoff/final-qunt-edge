import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Static assets: aggressive caching (fonts, images, JS/CSS bundles)
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.match(/\.(js|css|woff2?|ttf|otf|avif|webp|png|jpg|jpeg|svg|ico)$/)
  ) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // API health/readiness: short cache
  if (pathname.match(/^\/[a-z]{2}(?:-[A-Za-z]{2})?\/api\/(health|ready)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=10, s-maxage=30')
    return response
  }

  // Dashboard pages: private, no cache (authenticated content)
  if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate')
    response.headers.set('X-Frame-Options', 'DENY')
    return response
  }

  // Public landing pages: moderate cache with stale-while-revalidate
  response.headers.set(
    'Cache-Control',
    'public, max-age=60, s-maxage=120, stale-while-revalidate=300'
  )

  return response
}

export const config = {
  matcher: [
    '/((?!api/whop|api/stripe|_next/image|favicon.ico).*)',
  ],
}
