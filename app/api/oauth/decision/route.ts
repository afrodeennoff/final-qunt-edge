import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ensureUserInDatabase } from '@/server/auth'

function createOAuthDecisionClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim()

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: async () => (await cookies()).getAll(),
      setAll: async (cookiesToSet) => {
        const cookieStore = await cookies()
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: options?.sameSite ?? 'lax',
            httpOnly: options?.httpOnly ?? true,
          })
        }
      },
    },
  })
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form body' }, { status: 400 })
  }

  const decision = formData.get('decision')
  const authorizationId = formData.get('authorization_id')

  if (typeof authorizationId !== 'string' || !authorizationId.trim()) {
    return NextResponse.json({ error: 'Missing authorization_id' }, { status: 400 })
  }

  if (decision !== 'approve' && decision !== 'deny') {
    return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })
  }

  const supabase = await createOAuthDecisionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  try {
    await ensureUserInDatabase(user, 'en', { skipDefaultLayout: true })
  } catch {
    return NextResponse.json(
      { error: 'Account setup failed. Sign in on the website first, then approve MCP access again.' },
      { status: 503 },
    )
  }

  const result =
    decision === 'approve'
      ? await supabase.auth.oauth.approveAuthorization(authorizationId.trim())
      : await supabase.auth.oauth.denyAuthorization(authorizationId.trim())

  if (result.error) {
    return NextResponse.json({ error: 'Authorization request failed' }, { status: 400 })
  }

  const redirectUrl = result.data?.redirect_url
  if (!redirectUrl) {
    return NextResponse.json({ error: 'No redirect URL from authorization server' }, { status: 500 })
  }

  // Custom URL schemes (cursor://) are more reliable via HTML navigation than a 303 from POST.
  if (/^[a-z][a-z0-9+.-]*:/i.test(redirectUrl) && !redirectUrl.startsWith('http')) {
    const jsUrl = JSON.stringify(redirectUrl)
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Authorization complete</title></head><body><p>Returning to your MCP client…</p><script>window.location.replace(${jsUrl});</script></body></html>`
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  return NextResponse.redirect(redirectUrl, 303)
}