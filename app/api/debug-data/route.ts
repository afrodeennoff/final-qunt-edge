import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route-client'
import { apiError } from '@/lib/api-response'
import logger, { withLogContext } from '@/lib/logger'
import { prisma, hasConfiguredDatabaseConnection } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()

  return withLogContext(
    {
      requestId,
      correlationId: requestId,
      route: '/api/debug-data',
      method: 'GET',
    },
    async () => {
      const supabase = createRouteClient(request)
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      const authenticated = !authError && user != null
      const userId = user?.id
      const email = user?.email

      const environment = {
        nodeEnv: process.env.NODE_ENV || 'development',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not-configured',
        vercelEnv: process.env.VERCEL_ENV,
      }

      let dbHealthy = false
      let dbLatencyMs: number | undefined
      let dbError: string | undefined

      if (hasConfiguredDatabaseConnection) {
        try {
          const dbStart = Date.now()
          await prisma.$queryRaw`SELECT 1`
          dbLatencyMs = Date.now() - dbStart
          dbHealthy = true
        } catch (error) {
          dbHealthy = false
          dbError = error instanceof Error ? error.message : 'Unknown database error'
          logger.warn('Database health check failed', { error: dbError })
        }
      }

      const database = {
        configured: hasConfiguredDatabaseConnection,
        healthy: dbHealthy,
        latencyMs: dbLatencyMs,
        error: dbError,
      }

      const memUsage = process.memoryUsage()
      const system = {
        uptimeSeconds: Math.floor(process.uptime()),
        memory: {
          rssMb: Math.round(memUsage.rss / 1024 / 1024),
          heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
        },
      }

      const auth = {
        authenticated,
        userId,
        email,
      }

      const response = {
        requestId,
        timestamp: new Date().toISOString(),
        environment,
        database,
        auth,
        system,
      }

      logger.info('Debug data retrieved', {
        requestId,
        authenticated,
        dbHealthy: dbHealthy,
      })

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      })
    }
  ).catch((error) => {
    logger.error('Debug data endpoint error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return apiError(
      'INTERNAL_ERROR',
      'Failed to retrieve debug data',
      500,
      error instanceof Error ? error.message : undefined
    )
  })
}
