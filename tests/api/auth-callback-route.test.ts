import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  ensureUserInDatabaseMock,
  getWebsiteURLMock,
  exchangeCodeForSessionMock,
  getUserMock,
  createServerClientMock,
} = vi.hoisted(() => ({
  ensureUserInDatabaseMock: vi.fn(),
  getWebsiteURLMock: vi.fn(),
  exchangeCodeForSessionMock: vi.fn(),
  getUserMock: vi.fn(),
  createServerClientMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  ensureUserInDatabase: ensureUserInDatabaseMock,
  getWebsiteURL: getWebsiteURLMock,
}))

// The route uses createServerClient from @supabase/ssr directly (createCallbackClient),
// not createClient from @/server/auth. Mock it to return a client with our spies.
vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}))

vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server')
  return {
    ...actual,
    NextResponse: {
      ...(typeof actual.NextResponse === 'object' ? actual.NextResponse : {}),
      next: vi.fn(() => ({
        cookies: { getAll: vi.fn(() => []), set: vi.fn() },
        headers: new Headers(),
      })),
      redirect: vi.fn((url: URL | string) => ({
        status: 307,
        headers: new Headers({ location: typeof url === 'string' ? url : url.toString() }),
        cookies: { getAll: vi.fn(() => []), set: vi.fn() },
      })),
      json: vi.fn(),
    },
  }
})

describe('GET /api/auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set env vars required by createCallbackClient in the auth callback route
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    getWebsiteURLMock.mockResolvedValue('http://localhost:3000/')
    exchangeCodeForSessionMock.mockResolvedValue({ error: null })
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user_123',
          email: 'test@example.com',
        },
      },
    })
    ensureUserInDatabaseMock.mockResolvedValue({
      id: 'user_123',
      email: 'test@example.com',
      language: 'en',
    })

    // createServerClient returns a Supabase client instance
    createServerClientMock.mockReturnValue({
      auth: {
        exchangeCodeForSession: exchangeCodeForSessionMock,
        getUser: getUserMock,
      },
    })

    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('rejects OAuth callbacks when state param exists without a matching cookie (CSRF protection)', async () => {
    const { GET } = await import('@/app/api/auth/callback/route')

    const response = await GET(
      new Request('http://localhost/api/auth/callback?code=test-code&state=supabase-state&locale=en')
    )

    // State param present without oauth_state cookie → CSRF validation failure
    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled()
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/en/authentication?error=csrf'
    )
  })

  it('redirects to csrf error when a custom oauth_state cookie does not match', async () => {
    const { GET } = await import('@/app/api/auth/callback/route')

    const response = await GET(
      new Request('http://localhost/api/auth/callback?code=test-code&state=wrong-state&locale=en', {
        headers: {
          cookie: 'oauth_state=expected-state',
        },
      })
    )

    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled()
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/en/authentication?error=csrf'
    )
  })

  it('allows OAuth callbacks when state param matches oauth_state cookie', async () => {
    const { GET } = await import('@/app/api/auth/callback/route')

    const response = await GET(
      new Request('http://localhost/api/auth/callback?code=test-code&state=supabase-state&locale=en', {
        headers: {
          cookie: 'oauth_state=supabase-state',
        },
      })
    )

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith('test-code')
    expect(ensureUserInDatabaseMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user_123' }),
      'en',
      { skipDefaultLayout: true }
    )
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/en/dashboard')
  })

  it('redirects to an explicit auth error when user setup fails after session exchange', async () => {
    const { GET } = await import('@/app/api/auth/callback/route')

    ensureUserInDatabaseMock.mockRejectedValueOnce(new Error('database offline'))

    // Include matching oauth_state cookie so CSRF validation passes
    const response = await GET(
      new Request('http://localhost/api/auth/callback?code=test-code&state=supabase-state&locale=en', {
        headers: {
          cookie: 'oauth_state=supabase-state',
        },
      })
    )

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith('test-code')
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/en/authentication?error=account_setup_failed'
    )
  })
})
