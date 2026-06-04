import { getMcpProtectedResourceMetadata } from '@/lib/mcp/oauth-metadata'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  'Content-Type': 'application/json',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  const metadata = getMcpProtectedResourceMetadata()
  return Response.json(metadata, { headers: CORS_HEADERS })
}