import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createCookieClient } from '@/server/auth'

export async function getMcpKeyRouteAuthUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : ''

  if (bearer) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) return null

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
    const { data: { user }, error } = await supabase.auth.getUser(bearer)
    if (error || !user?.id) return null
    return user.id
  }

  const supabase = await createCookieClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}
