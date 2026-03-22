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

import {
  getCachedResult,
  setCachedResult
} from './redis-client'

export async function executeOptimizedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  cacheKey?: string,
  cacheTtl?: number
): Promise<T> {
  if (cacheKey) {
    const cached = await getCachedResult<T>(cacheKey)
    if (cached) {
      return cached
    }
  }

  const result = await measureQueryPerformance(queryName, queryFn)

  if (cacheKey && cacheTtl) {
    await setCachedResult(cacheKey, result, cacheTtl)
  }

  return result
}

const queryCache = new Map<string, { data: unknown; expiresAt: number }>()
const MAX_IN_MEMORY_CACHE_ENTRIES = 500
const CACHE_SWEEP_INTERVAL_MS = 60_000

function enforceLocalCacheBounds(): void {
  const now = Date.now()

  for (const [key, value] of queryCache.entries()) {
    if (value.expiresAt <= now) {
      queryCache.delete(key)
    }
  }

  while (queryCache.size > MAX_IN_MEMORY_CACHE_ENTRIES) {
    const oldestKey = queryCache.keys().next().value as string | undefined
    if (!oldestKey) break
    queryCache.delete(oldestKey)
  }
}

const cacheSweepTimer = setInterval(() => {
  enforceLocalCacheBounds()
}, CACHE_SWEEP_INTERVAL_MS)

cacheSweepTimer.unref?.()