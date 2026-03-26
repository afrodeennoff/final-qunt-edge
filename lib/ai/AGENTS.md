# lib/ai — AI Layer (Client, Router, Telemetry, Entitlements)

> **Conventions & Developer Guide**: See root `./AGENTS.md` for shared conventions.

**Scope**: `lib/ai/`, `lib/ai/router/`

## OVERVIEW
AI integration layer with Vercel AI SDK, OpenRouter fallback router, entitlements, telemetry, and prompt safety.

## ROUTER ARCHITECTURE

```
client.ts
    └── getAiLanguageModel(feature) → routes through router
    └── createCompletionWithRouter() → explicit free-tier first
router/
    ├── config.ts       # Feature flag: AI_ROUTER_ENABLED
    ├── openrouter.ts  # OpenRouter API client
    ├── circuit.ts      # Circuit breaker (Redis)
    ├── cache.ts       # Per-user response cache (Redis)
    ├── reservations.ts # Budget reservation (Redis)
    └── fallback.ts     # Provider chain: OpenRouter Free → Auto → Liquid LFM → GLM
```

## PROVIDER CHAIN

| Priority | Provider | Trigger |
|----------|---------|---------|
| 1 | OpenRouter Free (`free`) | Always attempted first when router enabled |
| 2 | OpenRouter Auto (`auto`) | Fallback if free exhausted |
| 3 | Liquid LFM (`liquid-lfm`) | Fallback if auto fails |
| 4 | GLM (via `AI_BASE_URL`) | Final fallback |

Router disabled by default → uses `AI_BASE_URL` directly.

## KEY FILES

| File | Purpose |
|------|---------|
| `client.ts` | AI client factory, `getAiLanguageModel()`, `createCompletionWithRouter()` |
| `router/config.ts` | `AI_ROUTER_ENABLED`, provider chain config |
| `router/openrouter.ts` | OpenRouter API client with response transformation |
| `router/circuit.ts` | Redis-backed circuit breaker, failure thresholds |
| `router/cache.ts` | Per-user cache keys: `ai:exact:${userId}:${feature}:${hash}` |
| `router/reservations.ts` | Atomic budget reservation (Redis), **fail-closed** |
| `router/fallback.ts` | Provider chain with cost estimation |
| `router/index.ts` | Public exports |
| `entitlements.ts` | AI feature entitlement checks |
| `telemetry.ts` | AI usage logging |
| `policy.ts` | AI usage policies |
| `usage-budget.ts` | Usage budget tracking |
| `prompt-safety.ts` | Prompt injection detection (threshold: 0.5) |
| `route-guard.ts` | AI route protection |
| `trade-access.ts` | AI trade data access control |
| `trade-normalization.ts` | AI trade data normalization |
| `get-all-trades.ts` | Trade data fetching for AI (user-scoped) |
| `errors.ts` | AI error types |
| `error-utils.ts` | AI error utilities |

## SECURITY RULES

- **Cache keys**: Always include `userId` to prevent cross-user cache pollution
- **Budget**: Must **never** fall back to in-memory store when Redis unavailable → throw explicit error
- **Prompt injection**: High-risk threshold lowered to `0.5` (from `0.7`)
- **API config**: `AI_BASE_URL` must be set → throws in dev if missing when router disabled

## CONVENTIONS

- Routes use `getAiLanguageModel()` which auto-checks router config
- Explicit free-tier attempts use `createCompletionWithRouter()`
- All AI routes must pass through `route-guard.ts`
- Entitlements checked via `entitlements.ts` before AI calls
- Telemetry logged via `telemetry.ts` for all AI requests

## AI ROUTE ERROR CONTRACT

All AI routes standardize on:
```typescript
{ error: { code, message, details? } }
```
Use `apiError()` from `lib/api-utils.ts` — never return raw strings as errors.

## DEPENDENCIES

- `lib/ai/router/index.ts` — Public router interface
- `lib/rate-limit.ts` — Rate limiting for AI routes
- `lib/redis-cache.ts` — Redis connection
- `lib/logger.ts` — Logging
- `lib/api-utils.ts` — `apiError()` helper
