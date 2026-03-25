import { createServerClient } from '@supabase/ssr'
import { isAdmin } from '@/server/authz'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/api/:path*'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/cron/')) {
    return handleCronAuth(request)
  }

  if (pathname.startsWith('/api/admin/')) {
    return handleAdminAuth(request)
  }

  return NextResponse.next()
}

async function handleCronAuth(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET
  const vercelCronSecret = process.env.VERCEL_CRON_SECRET

  if (!cronSecret && !vercelCronSecret) {
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }

  const vercelCronHeader = request.headers.get('x-vercel-cron')
  if (vercelCronHeader && vercelCronSecret && vercelCronHeader === vercelCronSecret) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing cron token' }, { status: 401 })
  }

  if (cronSecret && token === cronSecret) {
    return NextResponse.next()
  }

  return NextResponse.json({ error: 'Unauthorized: Invalid cron token' }, { status: 401 })
}

async function handleAdminAuth(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
          setAll: () => {},
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: No valid session' }, { status: 401 })
    }

    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email || '')

    return NextResponse.next({ request: { headers: requestHeaders } })
  } catch (error) {
    console.error('Admin auth middleware error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
