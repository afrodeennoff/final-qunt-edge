/**
 * AI Response Cache
 *
 * Caches AI model responses to reduce API calls and latency.
 * Uses CacheService for unified caching with singleflight and graceful degradation.
 *
 * @module lib/ai/cache
 */

import { get, set, invalidateNamespace, CachePolicies, buildCacheKey } from '@/lib/cache/cache-service'
import { createLogger } from '@/lib/logger'

const log = createLogger('ai-cache')

const AI_CACHE_TTL = 300 // 5 minutes
const AI_CACHE_DOMAIN = 'ai'

// Simple hash function for caching keys
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// Create a stable JSON string for hashing
function stableStringify(obj: unknown): string {
  return JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString()
    : value === undefined || value === null ? null : value
  )
}

// Cache statistics
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  errors: 0,
}

function buildAiCacheKey(feature: string, options: unknown, userId?: string): string {
  const parts = [feature, stableStringify(options)]
  if (userId) parts.push(userId)
  const hash = hashString(parts.join('|'))
  return buildCacheKey(AI_CACHE_DOMAIN, feature, hash)
}

/**
 * Get cache statistics
 */
export function getAiCacheStats() {
  return { ...cacheStats }
}

/**
 * Reset cache statistics
 */
export function resetAiCacheStats() {
  cacheStats.hits = 0
  cacheStats.misses = 0
  cacheStats.sets = 0
  cacheStats.errors = 0
}

/**
 * Read AI response from cache.
 * Returns null on miss — caller should compute and call setAiResponseCache.
 *
 * @param feature The AI feature (chat, editor, etc.)
 * @param options The options passed to the AI model
 * @returns Cached result if available, null otherwise
 */
export async function cacheAiResponse<T>(
  feature: string,
  options: unknown,
  userId?: string
): Promise<T | null> {
  const key = buildAiCacheKey(feature, options, userId)
  const policy = CachePolicies.aiDerived(AI_CACHE_TTL)

  try {
    const cached = await get<T>(key, policy)

    if (cached !== undefined) {
      cacheStats.hits++
      return cached
    }

    cacheStats.misses++
    return null
  } catch (error) {
    cacheStats.errors++
    log.warn('AI cache read failed', { feature, error })
    return null
  }
}

/**
 * Write AI response to cache.
 *
 * @param feature The AI feature (chat, editor, etc.)
 * @param options The options passed to the AI model
 * @param result The result to cache
 */
export async function setAiResponseCache<T>(
  feature: string,
  options: unknown,
  result: T,
  userId?: string
): Promise<void> {
  const key = buildAiCacheKey(feature, options, userId)
  const policy = CachePolicies.aiDerived(AI_CACHE_TTL)

  try {
    await set(key, result, policy, `ai-${feature}`)
    cacheStats.sets++
  } catch (error) {
    cacheStats.errors++
    log.warn('AI cache write failed', { feature, error })
  }
}

/**
 * Invalidate all cached responses for an AI feature.
 */
export async function invalidateAiCache(feature: string): Promise<void> {
  try {
    await invalidateNamespace(`ai-${feature}`)
  } catch {
    // Best-effort
  }
}
