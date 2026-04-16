# Caching Decisions — Qunt Edge

**Last updated:** 2026-04-16

## Architecture

The caching stack has three layers, checked in order:

1. **In-memory LRU cache** (per-process, fastest, 2000 entry max)
2. **Redis cache** (shared across instances via 3-tier: local TCP → Upstash HTTP → memory)
3. **Next.js `'use cache'`** (SSR cache with `cacheLife`/`cacheTag`, invalidated via `updateTag`)

Read flow: `memory → Redis → loader → populate memory + Redis`

## Cache Policies by Data Class

| Data Class | Examples | Memory TTL | Redis TTL | CDN | Invalidation | Stale TTL |
|-----------|----------|-----------|-----------|-----|-------------|-----------|
| Public reference | Deals, firms, prop-firm stats | 30s | 300s | `s-maxage=300` | Write-aside on mutation | 30s |
| Private summary | Behavior insights, trade summaries | 15s | 60s | No | Write-aside on mutation | 15s |
| AI-derived | Trade context, chat responses | — | 90s | No | Namespace on trade writes | 10s |
| Critical entitlement | Subscription summary | 15s | 30s | No | Write-through on change | 0s |
| Hot reference | Tick details, config | 300s | 3600s | No | TTL-only | 300s |

## Key Format

```
qunt:v2:{domain}:{scope}:{id}
```

Examples:
- `qunt:v2:behavior:insights:user:abc123:period:30`
- `qunt:v2:ai:chat:a1b2c3d4`
- `qunt:v2:query:getOptimizedTrades:userId:abc`

## Invalidation Strategy

| Strategy | When | How |
|----------|------|-----|
| Write-aside | Most data | Update DB → `updateTag()` + `CacheService.invalidate()` |
| Write-through | Subscription/entitlement | Update DB + write cache in same flow |
| TTL-only | Tick details, config | No explicit invalidation |
| Namespace | AI trade context | Bump namespace version → all keys unreachable |

## Graceful Degradation

- **Redis failure:** Circuit breaker opens after 5 consecutive failures. 30s cooldown. All reads fall back to loader (DB). Cache writes skip silently.
- **Invalidation failure:** Best-effort. DB is source of truth. `updateTag()` and Redis delete failures are logged but never roll back writes.
- **Singleflight:** Concurrent loads for the same key are deduped. Only one loader runs at a time per key.
- **Stale-while-recompute:** Non-critical reads serve stale data up to `staleTtl` while one refresher recomputes in the background.

## What is NOT Cached via CacheService

These use Next.js `'use cache'` directly and are NOT migrated to CacheService:
- Server component data loaders (`user-data.ts`, `trades.ts`, `deals.ts`, etc.)
- Dashboard layout, equity chart, groups, tags, moods
- Blog posts, community posts, leaderboard

These stay with `cacheLife`/`cacheTag`/`updateTag` because they are SSR-first and the Next.js cache component model handles them correctly.

## What IS Cached via CacheService

- AI responses (`lib/ai/cache.ts`)
- Behavior insights (`app/api/behavior/insights/route.ts`)
- Optimized query results (`lib/query-optimizer.ts` → `server/optimized-trades.ts`)
- Any future Redis-layer caching for API routes

## Runbooks

### Cache Degradation (Redis Down)

1. Check `/api/ready` — should return `degraded` with `redis: degraded`
2. Check `/api/health` — should show `redis-unhealthy` in alerts
3. All requests proceed normally (slower, hitting DB directly)
4. Circuit breaker auto-recovers after 30s cooldown
5. No manual intervention needed

### Cache Purge (Emergency)

For `'use cache'` data: redeploy or call `updateTag()` for specific tags.

For CacheService data:
```typescript
import { invalidateNamespace } from '@/lib/cache/cache-service'
await invalidateNamespace('behavior-insights')
await invalidateNamespace('ai-trades')
```

### New Cache Addition

1. Choose the right `CachePolicies.*` preset
2. Use `buildCacheKey()` for consistent key format
3. Use `getOrLoad()` for read-through, `set()` for write-through
4. Add invalidation to the relevant mutation path
5. Document in this file
