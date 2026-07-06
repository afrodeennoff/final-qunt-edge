/**
 * Query Performance Optimizer
 *
 * Two utilities:
 * 1. `measureQueryPerformance` — wraps any async function, logs execution time,
 *    warns on >1000ms, stores metrics (max 500).
 * 2. `executeOptimizedQuery` — wraps a query function with caching via CacheService.
 *
 * The duplicate queryCache Map that was previously here has been consolidated
 * into CacheService (lib/cache/cache-service.ts) which provides unified
 * in-memory + Redis caching.
 *
 * @module lib/query-optimizer
 */

import { getOrLoad, CachePolicies, buildCacheKey } from '@/lib/cache/cache-service'

export interface QueryMetrics {
  queryName: string
  executionTime: number
  recordCount: number
  timestamp: Date
}

const queryMetrics: QueryMetrics[] = []
const MAX_QUERY_METRICS = 500

export function measureQueryPerformance<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()

  return queryFn().then(result => {
    const executionTime = Date.now() - startTime

    queryMetrics.push({
      queryName,
      executionTime,
      recordCount: Array.isArray(result) ? result.length : 1,
      timestamp: new Date()
    })
    if (queryMetrics.length > MAX_QUERY_METRICS) {
      queryMetrics.splice(0, queryMetrics.length - MAX_QUERY_METRICS)
    }

    if (executionTime > 1000) {
      console.warn(`[Slow Query] ${queryName} took ${executionTime}ms`)
    }

    return result
  })
}

export function getQueryMetrics(): QueryMetrics[] {
  return [...queryMetrics]
}

export function clearQueryMetrics(): void {
  queryMetrics.length = 0
}

/**
 * Execute a query with optional caching.
 * Uses CacheService for unified in-memory + Redis caching with singleflight.
 *
 * @param queryName - Name for performance tracking
 * @param queryFn - The async function to execute on cache miss
 * @param cacheKey - Optional cache key (enables caching)
 * @param cacheTtl - TTL in seconds (required if cacheKey is provided)
 */
export async function executeOptimizedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  cacheKey?: string,
  cacheTtl?: number
): Promise<T> {
  if (cacheKey && cacheTtl) {
    const key = buildCacheKey('query', queryName, cacheKey)
    return getOrLoad(
      key,
      () => measureQueryPerformance(queryName, queryFn),
      CachePolicies.privateSummary(cacheTtl),
      'query-optimizer'
    )
  }

  return measureQueryPerformance(queryName, queryFn)
}
