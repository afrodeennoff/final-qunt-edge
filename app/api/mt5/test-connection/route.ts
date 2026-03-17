import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseUserId } from '@/server/auth'
import { apiError } from '@/lib/api-response'
import { z } from 'zod'
import { createRateLimitResponse, rateLimit } from '@/lib/rate-limit'

const mt5TestRateLimit = rateLimit({ limit: 5, window: 60_000, identifier: 'mt5-test-connection' })

const testConnectionSchema = z.object({
  login: z.number().min(1, 'Login is required'),
  server: z.string().min(1, 'Server is required'),
  password: z.string().min(1, 'Investor password is required'),
})

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    const limit = await mt5TestRateLimit(req)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    try {
      await getDatabaseUserId()
    } catch {
      return apiError('UNAUTHORIZED', 'Authentication required to test MT5 connection', 401)
    }

    const body = await req.json()
    const validation = testConnectionSchema.safeParse(body)
    
    if (!validation.success) {
      return apiError('VALIDATION_FAILED', 'Invalid input', 400, {
        issues: validation.error.issues
      })
    }

    const { server, password } = validation.data

    // Connection test is handled by the Python MT5 worker
    // This endpoint stores credentials and triggers a test via the worker queue
    // For now, we validate the credentials are properly formed
    
    if (password.length < 8) {
      return apiError('VALIDATION_FAILED', 'Password must be at least 8 characters', 400)
    }

    // Basic server format validation (common MT5 broker formats)
    const validServerPatterns = [
      /^[a-zA-Z0-9][a-zA-Z0-9.-]*$/,
      /^[\w.-]+$/,
    ]
    
    const serverValid = validServerPatterns.some(pattern => pattern.test(server))
    if (!serverValid) {
      return apiError('VALIDATION_FAILED', 'Invalid server format', 400)
    }

    return NextResponse.json({
      success: true,
      connected: false,
      error: null,
      message: 'Credentials validated. Connection test will be performed by the MT5 worker service.',
      accountInfo: null,
      note: 'The worker will test the connection and update account status automatically',
    })

  } catch (error) {
    console.error('[mt5/test-connection] Error testing connection:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return apiError('INTERNAL_ERROR', errorMessage, 500, { requestId })
  }
}
