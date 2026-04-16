/**
 * Next.js Instrumentation Hook
 *
 * Runs once per server instance at startup (Node.js runtime).
 * Initializes structured logging, cache metrics, and dependency health probes.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createLogger } = await import('@/lib/logger')
    const log = createLogger('instrumentation')

    log.info('Server instance starting', {
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
      redisConfigured: Boolean(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL),
    })

    // Log startup complete
    log.info('Instrumentation registered')
  }
}
