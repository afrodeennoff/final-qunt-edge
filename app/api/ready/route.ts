/**
 * Readiness Probe — `/api/ready`
 *
 * Returns dependency health snapshot for Kubernetes-style readiness checks.
 * - DB down → 503 (not ready)
 * - Redis down → 200 with degraded status (ready but degraded)
 * - All healthy → 200 (ready)
 */

import { NextResponse, connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRedisConfigured } from '@/lib/redis-client'
import { getCacheMetrics } from '@/lib/cache/cache-service'
import { createLogger } from '@/lib/logger'
import { requireServiceAuth } from '@/server/authz'

const log = createLogger('ready')

interface DependencyCheck {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  latencyMs?: number
  error?: string
}

export async function GET(request: Request) {
  await connection()

  const requestId = crypto.randomUUID()
  const checks: DependencyCheck[] = []

  // Check Postgres
  const dbStart = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.push({
      name: 'postgres',
      status: 'healthy',
      latencyMs: Date.now() - dbStart,
    })
  } catch (error) {
    log.error('Postgres readiness check failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    checks.push({
      name: 'postgres',
      status: 'down',
      latencyMs: Date.now() - dbStart,
      error: 'Postgres unavailable',
    })
  }

  // Check Redis (non-critical — degrade gracefully)
  if (isRedisConfigured()) {
    try {
      const { getCachedResult } = await import('@/lib/redis-client')
      const redisStart = Date.now()
      await getCachedResult<string>('__health_check__')
      checks.push({
        name: 'redis',
        status: 'healthy',
        latencyMs: Date.now() - redisStart,
      })
    } catch {
      checks.push({
        name: 'redis',
        status: 'degraded',
        error: 'Redis unavailable — cache operating in memory-only mode',
      })
    }
  } else {
    checks.push({
      name: 'redis',
      status: 'degraded',
      error: 'Redis not configured — cache operating in memory-only mode',
    })
  }

  // Determine overall status
  const hasDown = checks.some(c => c.status === 'down')
  const hasDegraded = checks.some(c => c.status === 'degraded')

  const overallStatus = hasDown ? 'not_ready' : hasDegraded ? 'degraded' : 'ready'
  const httpStatus = hasDown ? 503 : 200

  // Base response — only status, no infrastructure details
  const response: Record<string, unknown> = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    requestId,
  }

  // SECURITY: Only expose detailed infrastructure info to authenticated internal callers
  // or in non-production with explicit opt-in
  let canViewDetails = process.env.NODE_ENV !== 'production' && process.env.READY_DETAILS_PUBLIC === 'true'
  if (!canViewDetails) {
    try {
      requireServiceAuth(request.headers.get('authorization'), {
        serviceName: 'ready',
        secretEnvKey: 'HEALTHCHECK_SECRET',
        requestId,
      })
      canViewDetails = true
    } catch {
      canViewDetails = false
    }
  }

  if (canViewDetails) {
    const cacheMetrics = getCacheMetrics()
    response.checks = checks
    response.cache = {
      hits: cacheMetrics.hits,
      misses: cacheMetrics.misses,
      staleServed: cacheMetrics.staleServed,
      redisHits: cacheMetrics.redisHits,
      redisFailures: cacheMetrics.redisFailures,
    }
  }

  if (hasDown) {
    log.error('Readiness check failed — critical dependency down', { checks })
  } else if (hasDegraded) {
    log.warn('Readiness check degraded', { checks })
  }

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'public, max-age=60',
      'X-Request-Id': requestId,
    },
  })
}
