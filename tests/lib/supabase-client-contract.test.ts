import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

describe('Supabase client env contracts', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_ANON_KEY
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it('fails closed for the browser client when public env vars are missing outside tests', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    const { createClient } = await import('@/lib/supabase')

    expect(() => createClient()).toThrow(
      'Missing Supabase public environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  })

  it('fails closed for the route client when public env vars are missing outside tests', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    const { createRouteClient } = await import('@/lib/supabase/route-client')

    expect(() => createRouteClient(new Request('http://localhost/test'))).toThrow(
      'Missing Supabase environment variables for route client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  })

  it('keeps deterministic test fallbacks available for unit tests', async () => {
    vi.stubEnv('NODE_ENV', 'test')

    const [{ createClient }, { createRouteClient }] = await Promise.all([
      import('@/lib/supabase'),
      import('@/lib/supabase/route-client'),
    ])

    expect(() => createClient()).not.toThrow()
    expect(() => createRouteClient(new Request('http://localhost/test'))).not.toThrow()
  })
})
