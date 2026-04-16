/**
 * CacheService — Unified Cache Abstraction
 *
 * Provides a single cache interface for the entire application:
 * - LRU in-memory cache (per-process, fast)
 * - Redis cache (shared across instances, via redis-client 3-tier fallback)
 * - Namespace versioning for efficient bulk invalidation
 * - Singleflight to prevent thundering herd
 * - Stale-while-recompute for non-critical reads
 * - Graceful degradation on Redis failure (circuit breaker)
 *
 * Key format: `qunt:v2:{domain}:{scope}:{id}`
 *
 * @module lib/cache/cache-service
 */

import {
  isRedisConfigured,
  getRedisJson,
  setRedisJson,
  invalidateCacheNamespace,
  delRedisKey,
  getCachedResult,
  setCachedResult,
} from '@/lib/redis-client'
import { createLogger } from '@/lib/logger'

const log = createLogger('cache-service')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CacheLayer = 'memory' | 'redis'

export type InvalidationMode = 'write-aside' | 'write-through' | 'ttl-only'

export interface CachePolicy {
  /** Seconds the value is considered fresh */
  ttl: number
  /** Seconds past TTL to serve stale while recompute runs */
  staleTtl: number
  /** Which layers to use */
  layer: CacheLayer | CacheLayer[]
  /** How invalidation works */
  invalidationMode: InvalidationMode
  /** Optional version tag for key versioning */
  version?: string
}

/** Pre-built policies for common data classes */
export const CachePolicies = {
  /** Public reference data: deals, firms, prop-firm stats */
  publicReference: (ttl = 300): CachePolicy => ({
    ttl,
    staleTtl: 30,
    layer: ['memory', 'redis'],
    invalidationMode: 'write-aside',
  }),

  /** Private summaries: behavior insights, dashboard trade summaries */
  privateSummary: (ttl = 60): CachePolicy => ({
    ttl,
    staleTtl: 15,
    layer: ['memory', 'redis'],
    invalidationMode: 'write-aside',
  }),

  /** AI-derived data: trade context helpers */
  aiDerived: (ttl = 90): CachePolicy => ({
    ttl,
    staleTtl: 10,
    layer: 'redis',
    invalidationMode: 'write-aside',
  }),

  /** Critical entitlement: subscription summary — always fresh */
  criticalEntitlement: (ttl = 30): CachePolicy => ({
    ttl,
    staleTtl: 0, // no stale serving
    layer: ['memory', 'redis'],
    invalidationMode: 'write-through',
  }),

  /** Hot reference data: config, tick details — long TTL */
  hotReference: (ttl = 3600): CachePolicy => ({
    ttl,
    staleTtl: 300,
    layer: 'redis',
    invalidationMode: 'ttl-only',
  }),
} as const

// ---------------------------------------------------------------------------
// In-memory LRU Cache
// ---------------------------------------------------------------------------

const MAX_MEMORY_ENTRIES = 2000
const memoryCache = new Map<string, { value: unknown; expiresAt: number; staleUntil: number }>()

function memoryGet<T>(key: string): { value: T; isStale: boolean } | null {
  const entry = memoryCache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now > entry.staleUntil) {
    // Past stale window — fully expired
    memoryCache.delete(key)
    return null
  }

  const isStale = now > entry.expiresAt
  // Promote (LRU)
  memoryCache.delete(key)
  memoryCache.set(key, entry)

  return { value: entry.value as T, isStale }
}

function memorySet<T>(key: string, value: T, ttlSeconds: number, staleTtlSeconds: number): void {
  const now = Date.now()
  memoryCache.set(key, {
    value,
    expiresAt: now + ttlSeconds * 1000,
    staleUntil: now + (ttlSeconds + staleTtlSeconds) * 1000,
  })
  evictMemory()
}

function memoryDel(key: string): void {
  memoryCache.delete(key)
}

function evictMemory(): void {
  const now = Date.now()
  // Remove expired first
  for (const [key, entry] of memoryCache) {
    if (now > entry.staleUntil) {
      memoryCache.delete(key)
    }
  }
  // Evict oldest if still over limit
  while (memoryCache.size > MAX_MEMORY_ENTRIES) {
    const oldest = memoryCache.keys().next().value
    if (!oldest) break
    memoryCache.delete(oldest)
  }
}

// Periodic sweep
const sweepTimer = setInterval(evictMemory, 60_000)
sweepTimer.unref?.()

// ---------------------------------------------------------------------------
// Singleflight — dedup concurrent loads for the same key
// ---------------------------------------------------------------------------

const inFlightLoads = new Map<string, Promise<unknown>>()

function singleflight<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const existing = inFlightLoads.get(key)
  if (existing) return existing as Promise<T>

  const promise = loader().finally(() => {
    inFlightLoads.delete(key)
  })
  inFlightLoads.set(key, promise)
  return promise
}

// ---------------------------------------------------------------------------
// Circuit Breaker — skip Redis after consecutive failures
// ---------------------------------------------------------------------------

const CIRCUIT_FAILURE_THRESHOLD = 5
const CIRCUIT_COOLDOWN_MS = 30_000

let circuitFailures = 0
let circuitOpenUntil = 0

function isCircuitOpen(): boolean {
  if (circuitFailures < CIRCUIT_FAILURE_THRESHOLD) return false
  if (Date.now() > circuitOpenUntil) {
    // Half-open: allow one attempt
    return false
  }
  return true
}

function recordRedisFailure(): void {
  circuitFailures++
  if (circuitFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS
    log.warn('Cache circuit breaker opened', {
      failures: circuitFailures,
      cooldownMs: CIRCUIT_COOLDOWN_MS,
    })
  }
}

function recordRedisSuccess(): void {
  circuitFailures = 0
}

// ---------------------------------------------------------------------------
// Key Builder
// ---------------------------------------------------------------------------

const KEY_PREFIX = 'qunt:v2'

export function buildCacheKey(domain: string, scope: string, id: string): string {
  return `${KEY_PREFIX}:${domain}:${scope}:${id}`
}

// ---------------------------------------------------------------------------
// CacheService
// ---------------------------------------------------------------------------

export interface CacheMetrics {
  hits: number
  misses: number
  staleServed: number
  redisHits: number
  redisMisses: number
  redisFailures: number
  singleflightDedups: number
}

const metrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  staleServed: 0,
  redisHits: 0,
  redisMisses: 0,
  redisFailures: 0,
  singleflightDedups: 0,
}

export function getCacheMetrics(): Readonly<CacheMetrics> {
  return { ...metrics }
}

/**
 * Read-through cache with singleflight, stale-while-recompute, and graceful
 * Redis degradation.
 *
 * Flow:
 * 1. Check in-memory cache (if policy includes 'memory')
 * 2. If stale found, return it and trigger background recompute
 * 3. Check Redis (if policy includes 'redis' and circuit is closed)
 * 4. If miss everywhere, load via singleflighted loader
 * 5. Store in configured layers
 */
export async function getOrLoad<T>(
  key: string,
  loader: () => Promise<T>,
  policy: CachePolicy,
  namespace?: string
): Promise<T> {
  const layers = Array.isArray(policy.layer) ? policy.layer : [policy.layer]
  const useMemory = layers.includes('memory')
  const useRedis = layers.includes('redis')

  // 1. Check in-memory
  if (useMemory) {
    const memResult = memoryGet<T>(key)
    if (memResult) {
      metrics.hits++
      if (memResult.isStale && policy.staleTtl > 0) {
        metrics.staleServed++
        // Background recompute (fire-and-forget)
        recomputeInBackground(key, loader, policy, namespace)
      }
      return memResult.value
    }
  }

  // 2. Check Redis
  if (useRedis && !isCircuitOpen()) {
    try {
      const redisResult = await getRedisJson<T>(namespace ?? key, key)
      if (redisResult !== null) {
        metrics.hits++
        metrics.redisHits++
        recordRedisSuccess()
        // Backfill memory
        if (useMemory) {
          memorySet(key, redisResult, policy.ttl, policy.staleTtl)
        }
        return redisResult
      }
      metrics.redisMisses++
    } catch {
      metrics.redisFailures++
      recordRedisFailure()
      // Fall through to loader — never fail the request due to cache
    }
  }

  // 3. Cache miss — singleflighted load
  metrics.misses++
  const result = await singleflight(key, async () => {
    // Double-check memory after await (another request may have populated it)
    if (useMemory) {
      const memResult = memoryGet<T>(key)
      if (memResult) {
        metrics.singleflightDedups++
        return memResult.value
      }
    }

    const loaded = await loader()

    // Store in configured layers
    if (useMemory) {
      memorySet(key, loaded, policy.ttl, policy.staleTtl)
    }

    if (useRedis && !isCircuitOpen()) {
      try {
        await setRedisJson(namespace ?? key, key, loaded, policy.ttl + policy.staleTtl)
        recordRedisSuccess()
      } catch {
        metrics.redisFailures++
        recordRedisFailure()
        // Log once per window per key
        log.warn('Cache write failed, data served from loader', { key, layer: 'redis' })
      }
    }

    return loaded
  })

  return result
}

/**
 * Background recompute — fire-and-forget, never blocks the caller.
 * Uses singleflight so only one recompute runs per key.
 */
function recomputeInBackground<T>(
  key: string,
  loader: () => Promise<T>,
  policy: CachePolicy,
  namespace?: string
): void {
  // Don't await — fire and forget
  singleflight(`recompute:${key}`, async () => {
    try {
      const fresh = await loader()
      const layers = Array.isArray(policy.layer) ? policy.layer : [policy.layer]
      if (layers.includes('memory')) {
        memorySet(key, fresh, policy.ttl, policy.staleTtl)
      }
      if (layers.includes('redis') && !isCircuitOpen()) {
        try {
          await setRedisJson(namespace ?? key, key, fresh, policy.ttl + policy.staleTtl)
          recordRedisSuccess()
        } catch {
          recordRedisFailure()
        }
      }
    } catch {
      // Background recompute failure is non-critical — data stays stale
    }
  }).catch(() => {
    // Swallow — background recompute must never throw
  })
}

/**
 * Write a value to cache layers.
 */
export async function set<T>(
  key: string,
  value: T,
  policy: CachePolicy,
  namespace?: string
): Promise<void> {
  const layers = Array.isArray(policy.layer) ? policy.layer : [policy.layer]

  if (layers.includes('memory')) {
    memorySet(key, value, policy.ttl, policy.staleTtl)
  }

  if (layers.includes('redis') && !isCircuitOpen()) {
    try {
      await setRedisJson(namespace ?? key, key, value, policy.ttl + policy.staleTtl)
      recordRedisSuccess()
    } catch {
      metrics.redisFailures++
      recordRedisFailure()
    }
  }
}

/**
 * Invalidate a single key from all layers.
 * Best-effort: logs failures but never throws.
 */
export async function invalidate(key: string, namespace?: string): Promise<void> {
  memoryDel(key)

  if (!isCircuitOpen()) {
    try {
      await delRedisKey(namespace ?? key, key)
      recordRedisSuccess()
    } catch {
      metrics.redisFailures++
      recordRedisFailure()
      // Idempotent best-effort — DB is source of truth
    }
  }
}

/**
 * Invalidate an entire namespace by bumping the version counter.
 * All keys in the namespace become unreachable (versioned keys).
 * Best-effort: logs failures but never throws.
 */
export async function invalidateNamespace(namespace: string): Promise<void> {
  try {
    await invalidateCacheNamespace(namespace)
  } catch {
    log.warn('Cache namespace invalidation failed', { namespace })
    // Idempotent best-effort — DB is source of truth
  }
}

/**
 * Raw get (no loader). Returns null on miss.
 */
export async function get<T>(key: string, policy: CachePolicy): Promise<T | null> {
  const layers = Array.isArray(policy.layer) ? policy.layer : [policy.layer]

  if (layers.includes('memory')) {
    const memResult = memoryGet<T>(key)
    if (memResult) {
      return memResult.value
    }
  }

  if (layers.includes('redis') && !isCircuitOpen()) {
    try {
      const redisResult = await getRedisJson<T>(key, key)
      if (redisResult !== null) {
        metrics.redisHits++
        recordRedisSuccess()
        return redisResult
      }
    } catch {
      metrics.redisFailures++
      recordRedisFailure()
    }
  }

  return null
}
