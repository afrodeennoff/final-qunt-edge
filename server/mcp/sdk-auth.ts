import { authenticateMcpRequest } from '@/server/mcp-auth'
import { NextRequest } from 'next/server'

export interface SdkAuthContext {
  userId: string
  role: string
}

export async function authenticateSdkRequest(request: NextRequest): Promise<SdkAuthContext | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const ctx = await authenticateMcpRequest(authHeader)
  return ctx ? { userId: ctx.userId, role: ctx.role } : null
}
