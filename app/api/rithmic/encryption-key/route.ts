import { withRateLimited } from '@/lib/api/with-api-route'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route-client'
import { apiError } from '@/lib/api-response'
import { logger } from '@/lib/logger'

const KEY_DERIVATION_ITERATIONS = 100000
const KEY_LENGTH = 256

async function handleGet(request: NextRequest) {
  try {
    const supabase = createRouteClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()

    if (authError || !user || !session) {
      return apiError('AUTH_UNAUTHORIZED', 'Authentication required', 401)
    }

    const accessToken = session.access_token

    if (!accessToken) {
      return apiError('AUTH_UNAUTHORIZED', 'No active session', 401)
    }

    const salt = 'rithmic-credential-encryption-v1'
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(accessToken),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: KEY_DERIVATION_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      KEY_LENGTH
    )

    const keyBase64 = btoa(
      Array.from(new Uint8Array(derivedKey), (b) => String.fromCharCode(b)).join('')
    )

    return NextResponse.json(
      { key: keyBase64, algorithm: 'AES-GCM', version: 1 },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    logger.error('[Rithmic] Failed to derive encryption key', { error })
    return apiError('INTERNAL_ERROR', 'Failed to derive encryption key', 500)
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'rithmic-key',
  rateLimitMax: 30,
  rateLimitWindow: 60_000,
  routeName: 'rithmic-key',
})
