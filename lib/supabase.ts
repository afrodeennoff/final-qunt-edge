import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabasePublicCredentials() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim()

  if (url && key) {
    return { url, key }
  }

  if (process.env.NODE_ENV === 'test') {
    return {
      url: 'http://127.0.0.1:54321',
      key: 'dummy-anon-key',
    }
  }

  throw new Error(
    'Missing Supabase public environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  )
}

export function createClient() {
  if (browserClient) {
    return browserClient
  }

  const { url, key } = getSupabasePublicCredentials()
  browserClient = createBrowserClient(url, key)
  return browserClient
}
