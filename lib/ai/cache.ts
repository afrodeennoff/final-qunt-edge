import { isRedisConfigured, getRedisJson, setRedisJson } from "@/lib/redis-client";
import { getEnv } from "@/lib/env";

// Simple hash function for caching keys
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Create a stable JSON string for hashing (ignoring undefined/null)
function stableStringify(obj: unknown): string {
  return JSON.stringify(obj, (_, value) => 
    typeof value === 'bigint' ? value.toString() : 
    value === undefined || value === null ? null : value
  );
}

// In-memory cache fallback
const inMemoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const CACHE_SWEEP_INTERVAL_MS = 60_000; // 1 minute

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of inMemoryCache.entries()) {
    if (entry.expiresAt <= now) {
      inMemoryCache.delete(key);
    }
  }
}, CACHE_SWEEP_INTERVAL_MS).unref?.();

function getFromInMemoryCache<T>(key: string): T | null {
  const entry = inMemoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    inMemoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setInMemoryCache<T>(key: string, value: T, ttlSeconds: number): void {
  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Cache AI responses to reduce API calls and improve performance
 * @param feature The AI feature (chat, editor, etc.)
 * @param options The options passed to the AI model (messages, parameters, etc.)
 * @param ttlSeconds Time to live in seconds (default: 300 = 5 minutes)
 * @returns Cached result if available, null otherwise
 */
export async function cacheAiResponse<T>(
  feature: string,
  options: unknown,
  ttlSeconds: number = 300
): Promise<T | null> {
  const env = getEnv();
  
  // Generate cache key
  const optionsStr = stableStringify(options);
  const cacheKey = `ai:${feature}:${hashString(optionsStr)}`;
  
  // Try to get from Redis first
  if (isRedisConfigured()) {
    try {
      const cached = await getRedisJson<T>(cacheKey, cacheKey);
      if (cached !== null) {
        return cached;
      }
    } catch (error) {
      console.warn('[AI Cache] Redis GET failed, falling back to in-memory cache', { error });
    }
  }
  
  // Fallback to in-memory cache
  const cached = getFromInMemoryCache<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  return null;
}

/**
 * Cache AI responses to reduce API calls and improve performance
 * @param feature The AI feature (chat, editor, etc.)
 * @param options The options passed to the AI model (messages, parameters, etc.)
 * @param result The result to cache
 * @param ttlSeconds Time to live in seconds (default: 300 = 5 minutes)
 */
export async function setAiResponseCache<T>(
  feature: string,
  options: unknown,
  result: T,
  ttlSeconds: number = 300
): Promise<void> {
  const env = getEnv();
  
  // Generate cache key
  const optionsStr = stableStringify(options);
  const cacheKey = `ai:${feature}:${hashString(optionsStr)}`;
  
  // Set in Redis
  if (isRedisConfigured()) {
    try {
      await setRedisJson(cacheKey, cacheKey, result, ttlSeconds);
    } catch (error) {
      console.warn('[AI Cache] Redis SET failed, falling back to in-memory cache', { error });
    }
  }
  
  // Always set in-memory cache as fallback
  setInMemoryCache(cacheKey, result, ttlSeconds);
}