import { getSiteOrigin } from '@/lib/site-url'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Cache-Control': 'public, max-age=3600',
  'Content-Type': 'application/json',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  const origin = getSiteOrigin()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

  const metadata = {
    resource: `${origin}/api/mcp`,
    authorization_servers: supabaseUrl
      ? [`${supabaseUrl}/auth/v1`]
      : [],
    scopes_supported: ['mcp:tools', 'mcp:admin'],
    bearer_methods_supported: ['header'],
    resource_documentation: `${origin}/api/mcp`,
  }

  return Response.json(metadata, { headers: CORS_HEADERS })
}
