import 'server-only'

// Configuration constants
const KEY_PREFIX = 'qunt:v1'
const VERSION_CACHE_TTL_MS = 30_000
const MAX_IN_MEMORY_CACHE_ENTRIES = 500
const CACHE_SWEEP_INTERVAL_MS = 60_000
const LOCAL_REDIS_TIMEOUT_MS = 2000

// In-memory caches for fallback and local development
const inMemoryCache = new Map<string, { value: string; expiresAt: number }>()
const inMemoryNamespaceVersions = new Map<string, number>()
const versionCache = new Map<string, { version: number; expiresAt: number }>()
const queryCache = new Map<string, { data: unknown; expiresAt: number }>()

// Environment configuration
const localRedisUrl = process.env.REDIS_URL
const upstashRedisUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const localRedisEnabled = Boolean(localRedisUrl)
const upstashRedisEnabled = Boolean(upstashRedisUrl && upstashRedisToken)

/**
 * Check if Redis is configured (either local or Upstash)
 */
export function isRedisConfigured(): boolean {
  return localRedisEnabled || upstashRedisEnabled
}

/**
 * Generate namespaced version key for tracking cache versions
 */
function namespacedVersionKey(namespace: string): string {
  return `${KEY_PREFIX}:nsver:${namespace}`
}

/**
 * Generate full cache key with namespace, version, and key
 */
function cacheKey(namespace: string, version: number, key: string): string {
  return `${KEY_PREFIX}:${namespace}:v${version}:${key}`
}

/**
 * Get current timestamp
 */
function getNow(): number {
  return Date.now()
}

/**
 * Get value from in-memory cache with expiration check
 */
function getInMemoryValue(key: string): string | null {
  const entry = inMemoryCache.get(key)
  if (!entry) return null
  if (entry.expiresAt <= getNow()) {
    inMemoryCache.delete(key)
    return null
  }
  return entry.value
}

/**
 * Set value in in-memory cache with TTL
 */
function setInMemoryValue(key: string, value: string, ttlSeconds: number): void {
  inMemoryCache.set(key, {
    value,
    expiresAt: getNow() + ttlSeconds * 1000,
  })
}

/**
 * Get cached namespace version with expiration check
 */
function getCachedNamespaceVersion(namespace: string): number | null {
  const cached = versionCache.get(namespace)
  if (!cached) return null
  if (cached.expiresAt <= getNow()) {
    versionCache.delete(namespace)
    return null
  }
  return cached.version
}

/**
 * Set cached namespace version with TTL
 */
function setCachedNamespaceVersion(namespace: string, version: number): void {
  versionCache.set(namespace, {
    version,
    expiresAt: getNow() + VERSION_CACHE_TTL_MS,
  })
}

/**
 * Get current version for a namespace, fetching from Redis if needed
 */
async function getNamespaceVersion(namespace: string): Promise<number> {
  const cached = getCachedNamespaceVersion(namespace)
  if (cached !== null) return cached

  if (!isRedisConfigured()) {
    const current = inMemoryNamespaceVersions.get(namespace) ?? 1
    setCachedNamespaceVersion(namespace, current)
    return current
  }

  const versionKey = namespacedVersionKey(namespace)
  const raw = await runRedisCommand(['GET', versionKey])
  const parsed = Number(raw)
  const version = Number.isFinite(parsed) && parsed > 0 ? parsed : 1

  if (!Number.isFinite(parsed) || parsed <= 0) {
    await runRedisCommand(['SET', versionKey, '1']).catch(() => undefined)
  }

  setCachedNamespaceVersion(namespace, version)
  return version
}

/**
 * Invalidate a cache namespace by incrementing its version
 */
export async function invalidateCacheNamespace(namespace: string): Promise<void> {
  const nextInMemory = (inMemoryNamespaceVersions.get(namespace) ?? 1) + 1
  inMemoryNamespaceVersions.set(namespace, nextInMemory)

  if (isRedisConfigured()) {
    const versionKey = namespacedVersionKey(namespace)
    const raw = await runRedisCommand(['INCR', versionKey]).catch(() => null)
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed > 0) {
      setCachedNamespaceVersion(namespace, parsed)
      return
    }
  }

  setCachedNamespaceVersion(namespace, nextInMemory)
}

/**
 * Get JSON value from cache with namespace versioning
 */
export async function getRedisJson<T>(namespace: string, key: string): Promise<T | null> {
  const version = await getNamespaceVersion(namespace)
  const scopedKey = cacheKey(namespace, version, key)

  if (isRedisConfigured()) {
    const raw = await runRedisCommand(['GET', scopedKey]).catch(() => null)
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    }
  }

  const local = getInMemoryValue(scopedKey)
  if (!local) return null

  try {
    return JSON.parse(local) as T
  } catch {
    return null
  }
}

/**
 * Set JSON value in cache with namespace versioning and TTL
 */
export async function setRedisJson<T>(
  namespace: string,
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const version = await getNamespaceVersion(namespace)
  const scopedKey = cacheKey(namespace, version, key)
  const payload = JSON.stringify(value)

  if (isRedisConfigured()) {
    await runRedisCommand(['SETEX', scopedKey, String(ttlSeconds), payload]).catch(() => undefined)
  }

  setInMemoryValue(scopedKey, payload, ttlSeconds)
}

/**
 * Delete a key from cache
 */
export async function delRedisKey(namespace: string, key: string): Promise<void> {
  const version = await getNamespaceVersion(namespace)
  const scopedKey = cacheKey(namespace, version, key)

  if (isRedisConfigured()) {
    await runRedisCommand(['DEL', scopedKey]).catch(() => undefined)
  }

  inMemoryCache.delete(scopedKey)
}

/**
 * Simple string get from cache (without namespace versioning)
 * Used by query optimizer for direct key access
 */
export async function getCachedResult<T>(key: string): Promise<T | null> {
  // Check in-memory query cache first
  const cached = queryCache.get(key)
  if (cached && cached.expiresAt > getNow()) {
    // Promote hot keys (LRU-like behavior)
    queryCache.delete(key)
    queryCache.set(key, cached)
    return cached.data as T
  }
  if (cached) {
    queryCache.delete(key)
  }

  // Try local Redis
  if (localRedisEnabled) {
    const fromLocalRedis = await getLocalRedisCachedResult<T>(key)
    if (fromLocalRedis !== null) return fromLocalRedis
  }

  // Try Upstash Redis
  if (upstashRedisEnabled) {
    const fromUpstashRedis = await getUpstashRedisCachedResult<T>(key)
    if (fromUpstashRedis !== null) return fromUpstashRedis
  }

  return null
}

/**
 * Simple string set in cache (without namespace versioning)
 * Used by query optimizer for direct key access
 */
export async function setCachedResult<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  // Set in local Redis if available
  if (localRedisEnabled) {
    await setLocalRedisCachedResult(key, data, ttlSeconds)
  } 
  // Set in Upstash Redis if available and local not enabled
  else if (upstashRedisEnabled) {
    await setUpstashRedisCachedResult(key, data, ttlSeconds)
  }

  // Always set in-memory query cache as fallback
  queryCache.set(key, {
    data,
    expiresAt: getNow() + ttlSeconds * 1000
  })
  enforceLocalCacheBounds()
}

/**
 * Enforce bounds on in-memory query cache (LRU-like eviction)
 */
function enforceLocalCacheBounds(): void {
  const now = getNow()

  // Remove expired entries
  for (const [key, value] of queryCache.entries()) {
    if (value.expiresAt <= now) {
      queryCache.delete(key)
    }
  }

  // Evict oldest entries if over limit
  while (queryCache.size > MAX_IN_MEMORY_CACHE_ENTRIES) {
    const oldestKey = queryCache.keys().next().value as string | undefined
    if (!oldestKey) break
    queryCache.delete(oldestKey)
  }
}

/**
 * Run a Redis command with fallback logic (local -> Upstash -> null)
 */
async function runRedisCommand(command: string[]): Promise<string | number | null> {
  if (localRedisEnabled) {
    try {
      return await runLocalRedisCommand(command)
    } catch {
      // Try upstash fallback
    }
  }

  if (upstashRedisEnabled) {
    try {
      return await runUpstashRedisCommand(command)
    } catch {
      return null
    }
  }

  return null
}

/**
 * Run command against local Redis via TCP socket
 */
async function runLocalRedisCommand(command: string[]): Promise<string | number | null> {
  if (!localRedisUrl) return null

  const { createConnection } = await import('node:net')
  const parsedUrl = new URL(localRedisUrl)
  const host = parsedUrl.hostname || '127.0.0.1'
  const port = Number(parsedUrl.port || 6379)
  const username = decodeURIComponent(parsedUrl.username || '')
  const password = decodeURIComponent(parsedUrl.password || '')
  const db = parsedUrl.pathname ? Number(parsedUrl.pathname.replace('/', '') || '0') : 0

  const startupCommands: string[][] = []
  if (password) {
    startupCommands.push(username ? ['AUTH', username, password] : ['AUTH', password])
  }
  if (!Number.isNaN(db) && db > 0) {
    startupCommands.push(['SELECT', String(db)])
  }

  const commands = [...startupCommands, command]
  const payload = commands.map(encodeRedisCommand).join('')

  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port })
    let settled = false
    let buffer = Buffer.alloc(0)
    const replies: Array<string | number | null> = []

    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      socket.removeAllListeners()
      socket.end()
      fn()
    }

    socket.setTimeout(LOCAL_REDIS_TIMEOUT_MS)

    socket.on('connect', () => {
      socket.write(payload)
    })

    socket.on('data', (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk])
      let offset = 0

      while (offset < buffer.length) {
        const parsed = parseRedisResponse(buffer, offset)
        if (!parsed) break
        replies.push(parsed.value)
        offset = parsed.next
      }

      if (offset > 0) {
        buffer = buffer.subarray(offset)
      }

      if (replies.length >= commands.length) {
        finish(() => resolve(replies[replies.length - 1]))
      }
    })

    socket.on('timeout', () => {
      finish(() => reject(new Error('Local Redis command timed out')))
    })

    socket.on('error', (error) => {
      finish(() => reject(error))
    })

    socket.on('end', () => {
      if (!settled && replies.length < commands.length) {
        finish(() => reject(new Error('Local Redis connection closed before full response')))
      }
    })
  })
}

/**
 * Run command against Upstash Redis via HTTP REST API
 */
async function runUpstashRedisCommand(command: string[]): Promise<string | number | null> {
  if (!upstashRedisUrl || !upstashRedisToken) return null

  const response = await fetch(upstashRedisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${upstashRedisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })

  if (!response.ok) {
    throw new Error(`Upstash Redis request failed: ${response.status}`)
  }

  const payload = await response.json()
  if (payload.error) {
    throw new Error(String(payload.error))
  }

  return payload.result ?? null
}

/**
 * Get cached result from local Redis (used by query optimizer)
 */
async function getLocalRedisCachedResult<T>(key: string): Promise<T | null> {
  try {
    const raw = await runLocalRedisCommand(['GET', key])
    if (typeof raw !== 'string') return null
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('[Cache] Local Redis GET failed, falling back to other caches', { key, error })
    return null
  }
}

/**
 * Set cached result in local Redis (used by query optimizer)
 */
async function setLocalRedisCachedResult<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    await runLocalRedisCommand(['SETEX', key, String(ttlSeconds), JSON.stringify(data)])
  } catch (error) {
    console.warn('[Cache] Local Redis SETEX failed, falling back to other caches', { key, error })
  }
}

/**
 * Get cached result from Upstash Redis (used by query optimizer)
 */
async function getUpstashRedisCachedResult<T>(key: string): Promise<T | null> {
  try {
    const raw = await runUpstashRedisCommand(['GET', key])
    if (typeof raw !== 'string') return null
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('[Cache] Upstash Redis GET failed, falling back to in-memory cache', { key, error })
    return null
  }
}

/**
 * Set cached result in Upstash Redis (used by query optimizer)
 */
async function setUpstashRedisCachedResult<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    await runUpstashRedisCommand(['SETEX', key, String(ttlSeconds), JSON.stringify(data)])
  } catch (error) {
    console.warn('[Cache] Upstash Redis SETEX failed, falling back to in-memory cache', { key, error })
  }
}

/**
 * Encode Redis command in RESP2 format
 */
function encodeRedisCommand(parts: string[]): string {
  let output = `*${parts.length}\r\n`
  for (const part of parts) {
    const length = Buffer.byteLength(part)
    output += `$${length}\r\n${part}\r\n`
  }
  return output
}

/**
 * Parse Redis RESP2 response
 */
function parseRedisResponse(
  buffer: Buffer,
  offset: number
): { value: string | number | null; next: number } | null {
  if (offset >= buffer.length) return null

  const type = String.fromCharCode(buffer[offset])
  const lineEnd = buffer.indexOf('\r\n', offset + 1)
  if (lineEnd === -1) return null

  const line = buffer.toString('utf8', offset + 1, lineEnd)

  if (type === '+') {
    return { value: line, next: lineEnd + 2 }
  }

  if (type === ':') {
    return { value: Number(line), next: lineEnd + 2 }
  }

  if (type === '-') {
    throw new Error(`Redis error: ${line}`)
  }

  if (type === '$') {
    const size = Number(line)
    if (size === -1) {
      return { value: null, next: lineEnd + 2 }
    }

    const valueStart = lineEnd + 2
    const valueEnd = valueStart + size
    if (valueEnd + 2 > buffer.length) return null

    const value = buffer.toString('utf8', valueStart, valueEnd)
    return { value, next: valueEnd + 2 }
  }

  throw new Error(`Unsupported Redis response type: ${type}`)
}

// Cache cleanup sweeps
const inMemorySweep = setInterval(() => {
  const now = getNow()
  for (const [key, entry] of inMemoryCache.entries()) {
    if (entry.expiresAt <= now) {
      inMemoryCache.delete(key)
    }
  }
}, 60_000)

inMemorySweep.unref?.()

const cacheSweepTimer = setInterval(() => {
  enforceLocalCacheBounds()
}, CACHE_SWEEP_INTERVAL_MS)

cacheSweepTimer.unref?.()

// Export runRedisCommand for use in other modules (backward compatibility)
export { runRedisCommand }