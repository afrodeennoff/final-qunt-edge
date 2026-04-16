/**
 * IdempotencyService — Durable request deduplication via Postgres.
 *
 * Stores request-response pairs keyed by `Idempotency-Key` header so
 * externally-retried POST endpoints can safely replay prior results.
 *
 * Records auto-expire after 24 hours via TTL column.
 *
 * @module lib/idempotency
 */

import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const log = createLogger('idempotency')

const DEFAULT_TTL_HOURS = 24

interface IdempotencyRecord {
  key: string
  endpoint: string
  requestHash: string
  status: number
  body: string
  createdAt: Date
  expiresAt: Date
}

/**
 * Check if an idempotency key has a stored result.
 * Returns the stored response if found and not expired, null otherwise.
 */
export async function getExistingResult(
  key: string,
  endpoint: string
): Promise<{ status: number; body: unknown } | null> {
  if (!key) return null

  try {
    const record = await prisma.$queryRaw<Array<IdempotencyRecord>>`
      SELECT key, endpoint, status, body, created_at as "createdAt", expires_at as "expiresAt"
      FROM "IdempotencyRecord"
      WHERE key = ${key}
        AND endpoint = ${endpoint}
        AND expires_at > NOW()
      LIMIT 1
    `

    if (record.length === 0) return null

    const entry = record[0]
    let parsedBody: unknown
    try {
      parsedBody = JSON.parse(entry.body as string)
    } catch {
      parsedBody = entry.body
    }

    log.info('Idempotency hit — returning stored result', { key, endpoint })
    return { status: entry.status, body: parsedBody }
  } catch {
    // Table may not exist yet — degrade gracefully
    log.warn('Idempotency lookup failed — proceeding as new request', { key, endpoint })
    return null
  }
}

/**
 * Store a request result for future idempotent replay.
 * Best-effort: failures are logged but never block the original response.
 */
export async function storeResult(
  key: string,
  endpoint: string,
  status: number,
  body: unknown,
  ttlHours = DEFAULT_TTL_HOURS
): Promise<void> {
  if (!key) return

  try {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)
    const requestHash = '' // Not used for lookup, placeholder for future content hash

    await prisma.$executeRaw`
      INSERT INTO "IdempotencyRecord" (key, endpoint, request_hash, status, body, created_at, expires_at)
      VALUES (${key}, ${endpoint}, ${requestHash}, ${status}, ${bodyStr}, NOW(), NOW() + interval '${ttlHours} hours')
      ON CONFLICT (key) DO NOTHING
    `
  } catch {
    log.warn('Idempotency store failed — response already sent', { key, endpoint })
  }
}

/**
 * Clean up expired idempotency records.
 * Can be called from a cron job or periodically.
 */
export async function cleanupExpiredRecords(): Promise<number> {
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM "IdempotencyRecord" WHERE expires_at < NOW()
    `
    log.info('Cleaned up expired idempotency records', { deletedCount: result })
    return result
  } catch {
    log.warn('Idempotency cleanup failed')
    return 0
  }
}

/**
 * Extract Idempotency-Key from request headers.
 */
export function extractIdempotencyKey(request: Request): string | null {
  const key = request.headers.get('idempotency-key')
  if (!key || key.trim().length === 0) return null
  return key.trim()
}
