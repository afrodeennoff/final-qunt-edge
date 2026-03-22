import 'server-only'
import {
  isRedisConfigured,
  getRedisJson,
  setRedisJson,
  invalidateCacheNamespace,
  delRedisKey,
  runRedisCommand
} from './redis-client'

// Re-export for backward compatibility
export { isRedisConfigured, getRedisJson, setRedisJson, invalidateCacheNamespace, delRedisKey, runRedisCommand }