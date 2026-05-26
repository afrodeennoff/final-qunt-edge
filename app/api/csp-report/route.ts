import { createLogger } from '@/lib/logger'
import { createRateLimitResponse, rateLimit } from '@/lib/rate-limit'

const log = createLogger('csp-report')

const cspReportRateLimit = rateLimit({ limit: 60, window: 60_000, identifier: 'csp-report' })

export async function POST(request: Request) {
  const rl = await cspReportRateLimit(request)
  if (!rl.success) {
    return createRateLimitResponse({ limit: rl.limit, remaining: rl.remaining, resetTime: rl.resetTime })
  }

  try {
    const report = await request.json()

    // Log CSP violations for security monitoring
    log.warn('CSP violation detected', {
      'csp-report': report['csp-report'] || report,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    // Malformed CSP payloads - log but don't fail
    log.error('Failed to parse CSP report', { error: error instanceof Error ? error.message : String(error) })
  }

  return new Response(null, { status: 204 })
}

export async function OPTIONS() {
  return new Response(null, { status: 204 })
}
