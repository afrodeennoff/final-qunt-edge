import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_API_ROUTES = [
  '/api/health',
  '/api/og/',
  '/api/auth/callback',
  '/api/whop/webhook',
  '/api/tradovate/auth',
  '/api/rithmic/callback',
]

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => {
    if (route.endsWith('/')) {
      return pathname.startsWith(route)
    }
    return pathname === route
  })
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (isPublicApiRoute(pathname)) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}