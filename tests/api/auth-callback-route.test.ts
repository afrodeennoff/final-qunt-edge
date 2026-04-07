import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  createClientMock,
  ensureUserInDatabaseMock,
  getWebsiteURLMock,
  exchangeCodeForSessionMock,
  getUserMock,
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  ensureUserInDatabaseMock: vi.fn(),
  getWebsiteURLMock: vi.fn(),
  exchangeCodeForSessionMock: vi.fn(),
  getUserMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  createClient: createClientMock,
  ensureUserInDatabase: ensureUserInDatabaseMock,
  getWebsiteURL: getWebsiteURLMock,
}))

describe('GET /api/auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()

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

    createClientMock.mockResolvedValue({
      auth: {
        exchangeCodeForSession: exchangeCodeForSessionMock,
        getUser: getUserMock,
      },
    })

    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('allows Supabase OAuth callbacks when state param exists without a custom cookie', async () => {
    const { GET } = await import('@/app/api/auth/callback/route')

    const response = await GET(
      new Request('http://localhost/api/auth/callback?code=test-code&state=supabase-state&locale=en')
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

  it('redirects to an explicit auth error when user setup fails after session exchange', async () => {
    const { GET } = await import('@/app/api/auth/callback/route')

    ensureUserInDatabaseMock.mockRejectedValueOnce(new Error('database offline'))

    const response = await GET(
      new Request('http://localhost/api/auth/callback?code=test-code&state=supabase-state&locale=en')
    )

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith('test-code')
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/en/authentication?error=account_setup_failed'
    )
  })
})
