import 'server-only'

// Configuration constants
const KEY_PREFIX = 'qunt:v1'
const VERSION_CACHE_TTL_MS = 30_000
const MAX_IN_MEMORY_CACHE_ENTRIES = 500
const CACHE_SWEEP_INTERVAL_MS = 60_000
const LOCAL_REDIS_TIMEOUT_MS = 2000

// ── Unified TTL Cache ──────────────────────────────────────────────

class TTLCache<T> {
  private store = new Map<string, { value: T; expiresAt: number }>()
  private maxSize: number

  constructor(maxSize = 500) {
    this.maxSize = maxSize
  }

  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return null
    }
    // LRU promotion
    this.store.delete(key)
    this.store.set(key, entry)
    return entry.value
  }

  set(key: string, value: T, ttlMs: number): void {
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      // Evict oldest (first-inserted) entry
      const oldestKey = this.store.keys().next().value as string | undefined
      if (oldestKey) this.store.delete(oldestKey)
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  get size(): number {
    return this.store.size
  }

  /** Sweep expired entries; returns count removed */
  sweep(): number {
    const now = Date.now()
    let removed = 0
    this.store.forEach((entry, key) => {
      if (entry.expiresAt <= now) {
        this.store.delete(key)
        removed++
      }
    })
    return removed
  }

  clear(): void {
    this.store.clear()
  }
}

// ── Single cache instance per logical concern ──────────────────────

const dataCache = new TTLCache<string>(MAX_IN_MEMORY_CACHE_ENTRIES)        // general JSON cache
const versionMetadata = new Map<string, number>()                          // namespace versions (never expire in-memory)
const versionCache = new TTLCache<number>(100)                             // cached version lookups with short TTL
const queryCache = new TTLCache<unknown>(MAX_IN_MEMORY_CACHE_ENTRIES)      // query optimizer cache

// ── Environment configuration ───────────────────────────────────────

const localRedisUrl = process.env.REDIS_URL
const upstashRedisUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const localRedisEnabled = Boolean(localRedisUrl)
const upstashRedisEnabled = Boolean(upstashRedisUrl && upstashRedisToken)

export function isRedisConfigured(): boolean {
  return localRedisEnabled || upstashRedisEnabled
}

// ── Key helpers ─────────────────────────────────────────────────────

function namespacedVersionKey(namespace: string): string {
  return `${KEY_PREFIX}:nsver:${namespace}`
}

function cacheKey(namespace: string, version: number, key: string): string {
  return `${KEY_PREFIX}:${namespace}:v${version}:${key}`
}

// ── Namespace version management ────────────────────────────────────

async function getNamespaceVersion(namespace: string): Promise<number> {
  const cached = versionCache.get(namespace)
  if (cached !== null) return cached

  if (!isRedisConfigured()) {
    const current = versionMetadata.get(namespace) ?? 1
    versionCache.set(namespace, current, VERSION_CACHE_TTL_MS)
    return current
  }

  const versionKey = namespacedVersionKey(namespace)
  const raw = await runRedisCommand(['GET', versionKey])
  const parsed = Number(raw)
  const version = Number.isFinite(parsed) && parsed > 0 ? parsed : 1

  if (!Number.isFinite(parsed) || parsed <= 0) {
    await runRedisCommand(['SET', versionKey, '1']).catch(() => undefined)
  }

  versionCache.set(namespace, version, VERSION_CACHE_TTL_MS)
  return version
}

export async function invalidateCacheNamespace(namespace: string): Promise<void> {
  const next = (versionMetadata.get(namespace) ?? 1) + 1
  versionMetadata.set(namespace, next)

  if (isRedisConfigured()) {
    const versionKey = namespacedVersionKey(namespace)
    const raw = await runRedisCommand(['INCR', versionKey]).catch(() => null)
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed > 0) {
      versionCache.set(namespace, parsed, VERSION_CACHE_TTL_MS)
      return
    }
  }

  versionCache.set(namespace, next, VERSION_CACHE_TTL_MS)
}

// ── JSON cache (namespaced) ─────────────────────────────────────────

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

  const local = dataCache.get(scopedKey)
  if (!local) return null

  try {
    return JSON.parse(local) as T
  } catch {
    return null
  }
}

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

  dataCache.set(scopedKey, payload, ttlSeconds * 1000)
}

export async function delRedisKey(namespace: string, key: string): Promise<void> {
  const version = await getNamespaceVersion(namespace)
  const scopedKey = cacheKey(namespace, version, key)

  if (isRedisConfigured()) {
    await runRedisCommand(['DEL', scopedKey]).catch(() => undefined)
  }

  dataCache.delete(scopedKey)
}

// ── Direct key cache (query optimizer) ──────────────────────────────

export async function getCachedResult<T>(key: string): Promise<T | null> {
  const cached = queryCache.get(key)
  if (cached !== null) return cached as T

  if (localRedisEnabled) {
    try {
      const raw = await runLocalRedisCommand(['GET', key])
      if (typeof raw === 'string') return JSON.parse(raw) as T
    } catch (error) {
      console.warn('[Cache] Local Redis GET failed', { key, error })
    }
  } else if (upstashRedisEnabled) {
    try {
      const raw = await runUpstashRedisCommand(['GET', key])
      if (typeof raw === 'string') return JSON.parse(raw) as T
    } catch (error) {
      console.warn('[Cache] Upstash Redis GET failed', { key, error })
    }
  }

  return null
}

export async function setCachedResult<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  const payload = JSON.stringify(data)

  if (localRedisEnabled) {
    try {
      await runLocalRedisCommand(['SETEX', key, String(ttlSeconds), payload])
    } catch (error) {
      console.warn('[Cache] Local Redis SETEX failed', { key, error })
    }
  } else if (upstashRedisEnabled) {
    try {
      await runUpstashRedisCommand(['SETEX', key, String(ttlSeconds), payload])
    } catch (error) {
      console.warn('[Cache] Upstash Redis SETEX failed', { key, error })
    }
  }

  queryCache.set(key, data, ttlSeconds * 1000)
}

// ── Redis transport ─────────────────────────────────────────────────

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

// ── RESP2 protocol helpers ──────────────────────────────────────────

function encodeRedisCommand(parts: string[]): string {
  let output = `*${parts.length}\r\n`
  for (const part of parts) {
    const length = Buffer.byteLength(part)
    output += `$${length}\r\n${part}\r\n`
  }
  return output
}

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

// ── Single unified sweep timer ──────────────────────────────────────

const sweepTimer = setInterval(() => {
  dataCache.sweep()
  versionCache.sweep()
  queryCache.sweep()
}, CACHE_SWEEP_INTERVAL_MS)

sweepTimer.unref?.()

// Graceful shutdown for serverless environments
export function shutdownCache(): void {
  clearInterval(sweepTimer)
  dataCache.clear()
  versionCache.clear()
  queryCache.clear()
  versionMetadata.clear()
}

if (typeof process !== 'undefined' && process.on) {
  process.on('beforeExit', shutdownCache)
}

export { runRedisCommand }
