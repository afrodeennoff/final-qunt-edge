import { NextResponse, connection } from 'next/server'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { logger, withLogContext } from '@/lib/logger'
import { requireServiceAuth } from '@/server/authz'
import { isRedisConfigured } from '@/lib/redis-client'

const DB_LATENCY_ALERT_MS = Number.parseInt(process.env.DB_LATENCY_ALERT_MS || "1000", 10)
const EXPOSE_HEALTH_DETAILS_PUBLICLY =
  process.env.NODE_ENV !== 'production' && process.env.HEALTH_DETAILS_PUBLIC === 'true'

if (process.env.NODE_ENV === 'production' && process.env.HEALTH_DETAILS_PUBLIC === 'true') {
  logger.warn('[health] HEALTH_DETAILS_PUBLIC=true ignored in production for safety')
}


async function checkDatabase(): Promise<{ ok: boolean; latencyMs: number; error?: string; unconfigured?: boolean }> {
  if (!hasConfiguredDatabaseConnection) {
    return {
      ok: false,
      latencyMs: 0,
      error: 'database connection is not configured',
      unconfigured: true,
    }
  }

  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { ok: true, latencyMs: Date.now() - start }
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'database check failed',
    }
  }
}

async function checkRedis(): Promise<{ ok: boolean; configured: boolean; error?: string }> {
  if (!isRedisConfigured()) {
    return { ok: false, configured: false, error: 'Redis not configured' }
  }
  try {
    const { getCachedResult } = await import('@/lib/redis-client')
    await getCachedResult<string>('__health_check__')
    return { ok: true, configured: true }
  } catch (error) {
    return { ok: false, configured: true, error: error instanceof Error ? error.message : 'Redis check failed' }
  }
}

export async function GET(request: Request) {
  await connection()
  const requestId = crypto.randomUUID()
  return withLogContext(
    {
      requestId,
      correlationId: requestId,
      route: "/api/health",
      method: "GET",
    },
    async () => {
      const startedAt = Date.now()
      const db = await checkDatabase()
      const redis = await checkRedis()
      const alerts: string[] = []

      if (!db.ok) {
        alerts.push(db.unconfigured ? "database-unconfigured" : "database-unhealthy")
      }
      if (db.latencyMs > DB_LATENCY_ALERT_MS) {
        alerts.push(`database-latency-above-threshold:${db.latencyMs}ms`)
      }
      if (redis.configured && !redis.ok) {
        alerts.push('redis-unhealthy')
      }

      const status = !db.ok && !db.unconfigured ? "down" : alerts.length > 0 ? "degraded" : "ok"
      const body: Record<string, unknown> = {
        status,
        timestamp: new Date().toISOString(),
        requestId,
      }

      let canViewDetailedDiagnostics = EXPOSE_HEALTH_DETAILS_PUBLICLY
      if (!canViewDetailedDiagnostics) {
        try {
          requireServiceAuth(request.headers.get('authorization'), {
            serviceName: 'healthcheck',
            secretEnvKey: 'HEALTHCHECK_SECRET',
            requestId,
          })
          canViewDetailedDiagnostics = true
        } catch {
          canViewDetailedDiagnostics = false
        }
      }

      if (canViewDetailedDiagnostics) {
        const memory = process.memoryUsage()
        body.checks = { database: db, redis }
        body.alerts = alerts
        body.uptimeSeconds = Math.floor(process.uptime())
        body.memory = {
          rssMb: Number((memory.rss / 1024 / 1024).toFixed(2)),
          heapUsedMb: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
          heapTotalMb: Number((memory.heapTotal / 1024 / 1024).toFixed(2)),
        }
      }

      if (alerts.length > 0) {
        const latencyMs = Date.now() - startedAt
        if (db.unconfigured) {
          logger.info('[health] database not configured', {
            status,
            alerts,
            latencyMs,
          })
        } else {
          logger.warn('[health] threshold warning', {
            status,
            alerts,
            latencyMs,
          })
        }
      } else {
        logger.info('[health] readiness check', {
          status,
          latencyMs: Date.now() - startedAt,
        })
      }

      return NextResponse.json(body, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=5, stale-while-revalidate=30',
        },
      })
    }
  )
}
