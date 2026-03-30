import { PrismaClient } from '@/prisma/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { logger } from './logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

const isProduction = process.env.NODE_ENV === 'production'
const isNextBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const MAX_POOL_LIMIT = 20
const MISSING_CONNECTION_ERROR =
  '[Prisma] Database connection is not configured. Set POSTGRES_PRISMA_URL, POSTGRES_URL, DATABASE_URL, DIRECT_URL, or POSTGRES_URL_NON_POOLING.'

const selectRuntimeConnectionString = (): string => {
  // Prefer provider-specific pooled URLs when available.
  return (
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.DIRECT_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  )
}

function createMissingConnectionProxy(): PrismaClient {
  const createCallableProxy = (path: string[] = []): unknown =>
    new Proxy(function missingPrismaMethod() {}, {
      get(_target, property) {
        if (property === 'then') return undefined
        if (property === Symbol.toStringTag) return 'PrismaClient'
        if (property === 'toJSON') {
          return () => '[Prisma missing connection proxy]'
        }
        return createCallableProxy([...path, String(property)])
      },
      apply() {
        const accessPath = path.length > 0 ? `prisma.${path.join('.')}` : 'prisma'
        throw new Error(`${MISSING_CONNECTION_ERROR} Attempted to access ${accessPath}.`)
      },
      construct() {
        const accessPath = path.length > 0 ? `prisma.${path.join('.')}` : 'prisma'
        throw new Error(`${MISSING_CONNECTION_ERROR} Attempted to access ${accessPath}.`)
      },
    })

  return createCallableProxy() as PrismaClient
}

const normalizeSupabasePoolerMode = (connectionString: string): string => {
  if (!connectionString) return ''

  try {
    const url = new URL(connectionString)
    const isSupabasePooler = url.hostname.endsWith('.pooler.supabase.com')

    // Session mode (5432) can hit "max clients reached" in serverless bursts.
    // Transaction mode (6543) is safer for Prisma runtime queries.
    if (isSupabasePooler && url.port === '5432') {
      url.port = '6543'
      if (isProduction) {
        console.warn('[Prisma] Supabase Session mode URL detected. Switching runtime DB port 5432 -> 6543 (transaction pooler).')
      }
      return url.toString()
    }
  } catch {
    return connectionString
  }

  return connectionString
}

const forceIPv4ConnectionString = (connectionString: string): string => {
  if (!connectionString) return ''
  try {
    const url = new URL(connectionString)

    if (url.hostname.includes(':')) {
      return connectionString
    }

    const family = 4
    const separator = connectionString.includes('?') ? '&' : '?'
    return `${connectionString}${separator}family=${family}`
  } catch {
    return connectionString
  }
}

const parseBooleanEnv = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return undefined
}

const parseConnectionUrl = (connectionString: string): URL | null => {
  if (!connectionString) return null
  try {
    return new URL(connectionString)
  } catch {
    return null
  }
}

const shouldEnableSsl = (connectionString: string): boolean => {
  const override = parseBooleanEnv(process.env.PGSSL_ENABLE)
  if (override !== undefined) return override
  if (!connectionString) return false

  const url = parseConnectionUrl(connectionString)
  const sslMode = url?.searchParams.get('sslmode')?.toLowerCase()
  if (sslMode === 'disable') return false
  if (sslMode) return true

  if (!url) {
    // Fall back to production default.
  }

  return isProduction
}

const shouldRejectUnauthorized = (connectionString: string): boolean => {
  const override = parseBooleanEnv(process.env.PGSSL_REJECT_UNAUTHORIZED)
  if (override !== undefined) return override

  const url = parseConnectionUrl(connectionString)
  if (url) {
    const sslMode = url.searchParams.get('sslmode')?.toLowerCase()
    const isSupabasePooler = url.hostname.endsWith('.pooler.supabase.com')

    // Align TLS verification behavior with libpq sslmode semantics.
    // - verify-full / verify-ca: verify certificate chain.
    // - require / prefer / allow: encrypt transport without strict verification.
    if (sslMode === 'verify-full' || sslMode === 'verify-ca') return true
    if (sslMode === 'require' || sslMode === 'prefer' || sslMode === 'allow') return false
    if (isSupabasePooler) return false
  }

  // Secure-by-default fallback in production. Opt out explicitly with PGSSL_REJECT_UNAUTHORIZED=false.
  return isProduction
}

// Runtime should prefer pooled DATABASE_URL (Supabase pooler).
// DIRECT_URL is intended for migrations/admin operations.
const connectionString = normalizeSupabasePoolerMode(selectRuntimeConnectionString())
export const hasConfiguredDatabaseConnection = Boolean(connectionString)
const parsedPoolMax = Number.parseInt(process.env.PG_POOL_MAX ?? '', 10)
const parsedPoolMin = Number.parseInt(process.env.PG_POOL_MIN ?? '', 10)

let pool: pg.Pool | undefined
let prisma: PrismaClient

if (!connectionString) {
  if (process.env.NODE_ENV !== 'test') {
    console.warn(
      '[Prisma] No database connection configured. Exporting a lazy Prisma proxy; database-backed features will fail when used until env vars are set.'
    )
  }

  prisma = globalForPrisma.prisma ?? createMissingConnectionProxy()
} else {
  // Production-grade pool settings: max 20, min 5 for production
  const defaultPoolMax = isProduction ? (isNextBuildPhase ? 1 : 20) : 5
  const defaultPoolMin = isProduction ? 5 : 2

  const maxPoolCap = isNextBuildPhase ? 1 : MAX_POOL_LIMIT
  const poolMax = Number.isFinite(parsedPoolMax) && parsedPoolMax > 0
    ? Math.min(parsedPoolMax, maxPoolCap)
    : defaultPoolMax

  const poolMin = Number.isFinite(parsedPoolMin) && parsedPoolMin > 0 && parsedPoolMin <= poolMax
    ? parsedPoolMin
    : Math.min(defaultPoolMin, poolMax)

  if (Number.isFinite(parsedPoolMax) && parsedPoolMax > maxPoolCap) {
    console.warn(`[Prisma] PG_POOL_MAX=${parsedPoolMax} exceeds safe cap ${maxPoolCap}; using ${maxPoolCap}.`)
  }

  // Production-grade timeout settings
  const defaultIdleTimeout = isProduction ? 30000 : 10000  // 30s in prod, 10s in dev
  const defaultConnTimeout = isProduction ? 10000 : 15000  // 10s fail-fast in prod

  const parsedIdleTimeout = Number.parseInt(process.env.PG_POOL_IDLE_TIMEOUT_MS ?? '', 10)
  const idleTimeoutMillis = Number.isFinite(parsedIdleTimeout) && parsedIdleTimeout > 0 ? parsedIdleTimeout : defaultIdleTimeout
  const parsedConnTimeout = Number.parseInt(process.env.PG_POOL_CONNECT_TIMEOUT_MS ?? '', 10)
  const connectionTimeoutMillis = Number.isFinite(parsedConnTimeout) && parsedConnTimeout > 0 ? parsedConnTimeout : defaultConnTimeout

  const poolConfig: pg.PoolConfig = {
    connectionString: forceIPv4ConnectionString(connectionString),
    max: poolMax,
    min: poolMin,
    idleTimeoutMillis,
    connectionTimeoutMillis,
  }

  if (shouldEnableSsl(connectionString)) {
    const rejectUnauthorized = shouldRejectUnauthorized(connectionString)
    poolConfig.ssl = { rejectUnauthorized }
    const explicitInsecureTls = parseBooleanEnv(process.env.PGSSL_REJECT_UNAUTHORIZED) === false

    if (isProduction && !isNextBuildPhase && rejectUnauthorized === false && explicitInsecureTls) {
      console.warn(
        "[Prisma] SSL certificate verification is disabled (PGSSL_REJECT_UNAUTHORIZED=false). " +
        "Enable certificate verification in production unless your provider explicitly requires insecure TLS."
      )
    }
  }

  pool = globalForPrisma.pool ?? new pg.Pool(poolConfig)
  const activePool = pool

  if (isProduction && !isNextBuildPhase) {
    logger.info('[Prisma] Pool initialized', {
      host: (() => {
        try {
          return new URL(poolConfig.connectionString ?? '').host
        } catch {
          return 'unknown'
        }
      })(),
      max: poolConfig.max,
      min: poolConfig.min,
      idleTimeoutMillis: poolConfig.idleTimeoutMillis,
      connectionTimeoutMillis: poolConfig.connectionTimeoutMillis,
      ssl: Boolean(poolConfig.ssl),
      rejectUnauthorized:
        typeof poolConfig.ssl === 'object' ? poolConfig.ssl.rejectUnauthorized : undefined,
    })
  }

  activePool.on('error', (err) => {
    console.error('[Prisma] Unexpected error on idle client', err)
  })

  // Monitor pool utilization - log when at 80% capacity
  activePool.on('acquire', () => {
    const totalCount = activePool.totalCount
    const idleCount = activePool.idleCount
    const activeConnections = totalCount - idleCount

    // Log warning when pool is at 80% capacity (16/20 connections)
    if (activeConnections >= Math.ceil(poolMax * 0.8)) {
      const utilization = ((activeConnections / poolMax) * 100).toFixed(0)

      // Use logger.warn for production logging
      if (isProduction && !isNextBuildPhase) {
        logger.warn('[DB Pool] High connection usage', {
          active: activeConnections,
          max: poolMax,
          utilization: `${utilization}%`,
          idle: idleCount,
          total: totalCount
        })
      } else {
        console.warn(`[DB Pool] High connection usage: ${activeConnections}/${poolMax} active (${utilization}% utilization)`)
      }
    }
  })

  const adapter = new PrismaPg(pool)

  prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  globalForPrisma.pool = pool
}

globalForPrisma.prisma = prisma

export { prisma }
